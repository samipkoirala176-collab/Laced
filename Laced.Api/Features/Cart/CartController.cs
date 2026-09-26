using System.Security.Claims;
using Laced.Api.Common.Results;
using Laced.Api.Features.Cart.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Cart;

[ApiController]
[Authorize]
[Route("api/cart")]
public class CartController(ICartService cartService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await cartService.GetAsync(GetUserId());
        return Ok(new ApiResponse<CartResponse>(true, "Cart retrieved successfully.", result.Value));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemRequest request)
    {
        var result = await cartService.AddItemAsync(GetUserId(), request);
        return result.IsSuccess
            ? Ok(new ApiResponse<CartResponse>(true, "Item added to cart successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to add item to cart.", null));
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemRequest request)
    {
        var result = await cartService.UpdateItemAsync(GetUserId(), id, request);
        return result.IsSuccess
            ? Ok(new ApiResponse<CartResponse>(true, "Cart item updated successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to update cart item.", null));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id)
    {
        var result = await cartService.RemoveItemAsync(GetUserId(), id);
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Cart item removed successfully.", null))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "Cart item not found.", null));
    }

    [HttpDelete]
    public async Task<IActionResult> Clear()
    {
        var result = await cartService.ClearAsync(GetUserId());
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Cart cleared successfully.", null))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to clear cart.", null));
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
