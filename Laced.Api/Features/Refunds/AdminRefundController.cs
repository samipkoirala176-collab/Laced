using Laced.Api.Common.Results;
using Laced.Api.Features.Refunds.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Refunds;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/refunds")]
public class AdminRefundController(IRefundService refundService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await refundService.GetAllAsync();
        return Ok(new ApiResponse<IReadOnlyList<RefundResponse>>(true, "Refund requests retrieved successfully.", result.Value));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await refundService.GetByIdAsync(id);
        return result.IsSuccess
            ? Ok(new ApiResponse<RefundResponse>(true, "Refund request retrieved successfully.", result.Value))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "Refund request not found.", null));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateRefundStatusRequest request)
    {
        var result = await refundService.UpdateStatusAsync(id, request);
        return result.IsSuccess
            ? Ok(new ApiResponse<RefundResponse>(true, "Refund status updated successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to update refund status.", null));
    }
}
