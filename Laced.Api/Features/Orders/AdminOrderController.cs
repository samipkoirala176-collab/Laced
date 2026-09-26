using Laced.Api.Common.Results;
using Laced.Api.Features.Orders.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Orders;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrderController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] OrderQueryParameters parameters)
    {
        var result = await orderService.GetAdminAsync(parameters);
        return result.IsSuccess
            ? Ok(new ApiResponse<OrderListResponse>(true, "Admin orders retrieved successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to retrieve orders.", null));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await orderService.GetAdminByIdAsync(id);
        return result.IsSuccess
            ? Ok(new ApiResponse<OrderResponse>(true, "Order retrieved successfully.", result.Value))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "Order not found.", null));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, OrderStatusRequest request)
    {
        var result = await orderService.UpdateStatusAsync(id, request);
        return result.IsSuccess
            ? Ok(new ApiResponse<OrderResponse>(true, "Order status updated successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to update order status.", null));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await orderService.CancelAdminAsync(id);
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Order cancelled successfully.", null))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to cancel order.", null));
    }
}
