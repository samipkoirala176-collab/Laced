using System.Security.Claims;
using Laced.Api.Common.Results;
using Laced.Api.Features.Orders.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Orders;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrderController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Place(PlaceOrderRequest request)
    {
        var result = await orderService.PlaceAsync(GetUserId(), request);
        return result.IsSuccess
            ? Ok(new ApiResponse<OrderResponse>(true, "Order placed successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to place order.", null));
    }

    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] OrderQueryParameters parameters)
    {
        var result = await orderService.GetMineAsync(GetUserId(), parameters);
        return result.IsSuccess
            ? Ok(new ApiResponse<OrderListResponse>(true, "Orders retrieved successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to retrieve orders.", null));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await orderService.GetMineByIdAsync(GetUserId(), id);
        return result.IsSuccess
            ? Ok(new ApiResponse<OrderResponse>(true, "Order retrieved successfully.", result.Value))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "Order not found.", null));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await orderService.CancelMineAsync(GetUserId(), id);
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Order cancelled successfully.", null))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to cancel order.", null));
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
