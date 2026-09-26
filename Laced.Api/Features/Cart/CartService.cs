using Laced.Api.Common.Results;
using Laced.Api.Data;
using Laced.Api.Features.Cart.DTOs;
using Laced.Api.Models;
using Microsoft.EntityFrameworkCore;
using CartEntity = Laced.Api.Models.Cart;

namespace Laced.Api.Features.Cart;

public class CartService(ApplicationDbContext dbContext) : ICartService
{
    public async Task<Result<CartResponse>> GetAsync(Guid userId)
    {
        var cart = await LoadCartAsync(userId);
        return Result<CartResponse>.Success(ToResponse(cart));
    }

    public async Task<Result<CartResponse>> AddItemAsync(Guid userId, AddCartItemRequest request)
    {
        if (request.Quantity <= 0)
        {
            return Result<CartResponse>.Failure("Quantity must be greater than zero.");
        }

        var productSize = await dbContext.ProductSizes
            .Include(size => size.Product)
            .FirstOrDefaultAsync(size => size.Id == request.ProductSizeId);

        if (productSize is null)
        {
            return Result<CartResponse>.Failure("Product size not found.");
        }

        if (!productSize.Product.IsActive)
        {
            return Result<CartResponse>.Failure("This product is not available.");
        }

        var cart = await LoadCartAsync(userId);
        var existingItem = cart.Items.FirstOrDefault(item => item.ProductSizeId == request.ProductSizeId);
        var requestedQuantity = (existingItem?.Quantity ?? 0) + request.Quantity;
        if (requestedQuantity > productSize.Quantity)
        {
            return Result<CartResponse>.Failure($"Only {productSize.Quantity} item(s) are currently available for this size.");
        }

        if (existingItem is null)
        {
            cart.Items.Add(new CartItem
            {
                ProductId = productSize.ProductId,
                ProductSizeId = productSize.Id,
                Quantity = request.Quantity
            });
        }
        else
        {
            existingItem.Quantity = requestedQuantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();
        return Result<CartResponse>.Success(ToResponse(await LoadCartAsync(userId)));
    }

    public async Task<Result<CartResponse>> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequest request)
    {
        var cart = await LoadCartAsync(userId);
        var item = cart.Items.FirstOrDefault(cartItem => cartItem.Id == itemId);
        if (item is null)
        {
            return Result<CartResponse>.Failure("Cart item not found.");
        }

        if (request.Quantity <= 0)
        {
            return Result<CartResponse>.Failure("Quantity must be greater than zero.");
        }

        if (!item.Product.IsActive)
        {
            return Result<CartResponse>.Failure("This product is not available.");
        }

        if (request.Quantity > item.ProductSize.Quantity)
        {
            return Result<CartResponse>.Failure($"Only {item.ProductSize.Quantity} item(s) are currently available for this size.");
        }

        item.Quantity = request.Quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();
        return Result<CartResponse>.Success(ToResponse(await LoadCartAsync(userId)));
    }

    public async Task<Result> RemoveItemAsync(Guid userId, Guid itemId)
    {
        var cart = await LoadCartAsync(userId);
        var item = cart.Items.FirstOrDefault(cartItem => cartItem.Id == itemId);
        if (item is null)
        {
            return Result.Failure("Cart item not found.");
        }

        dbContext.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> ClearAsync(Guid userId)
    {
        var cart = await LoadCartAsync(userId);
        dbContext.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();
        return Result.Success();
    }

    private async Task<CartEntity> LoadCartAsync(Guid userId)
    {
        var cart = await dbContext.Carts
            .Include(item => item.Items)
                .ThenInclude(item => item.Product)
                    .ThenInclude(product => product.Images)
            .Include(item => item.Items)
                .ThenInclude(item => item.ProductSize)
            .FirstOrDefaultAsync(item => item.UserId == userId);

        if (cart is not null)
        {
            return cart;
        }

        cart = new CartEntity { UserId = userId };
        dbContext.Carts.Add(cart);
        await dbContext.SaveChangesAsync();
        return cart;
    }

    private static CartResponse ToResponse(CartEntity cart)
    {
        var items = cart.Items.Select(item =>
        {
            var heroImage = item.Product.Images.FirstOrDefault(image => image.IsHero)
                ?? item.Product.Images.FirstOrDefault();
            var lineTotal = item.Product.Price * item.Quantity;
            return new CartItemResponse(
                item.Id,
                item.ProductId,
                item.ProductSizeId,
                item.Product.Name,
                heroImage?.FilePath,
                item.ProductSize.Size,
                item.Quantity,
                item.Product.Price,
                lineTotal);
        }).ToList();

        return new CartResponse(items, items.Sum(item => item.LineTotal));
    }
}
