namespace Laced.Api.Features.Cart.DTOs;

public record CartItemResponse(
    Guid Id,
    Guid ProductId,
    Guid ProductSizeId,
    string ProductName,
    string? HeroImage,
    decimal Size,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public record CartResponse(IReadOnlyList<CartItemResponse> Items, decimal Total);
