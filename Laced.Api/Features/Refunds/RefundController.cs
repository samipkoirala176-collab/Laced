using System.Security.Claims;
using Laced.Api.Common.Results;
using Laced.Api.Features.Refunds.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Refunds;

[ApiController]
[Authorize]
[Route("api/refunds")]
public class RefundController(IRefundService refundService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateRefundRequest request)
    {
        var result = await refundService.CreateAsync(GetUserId(), request);
        return result.IsSuccess
            ? Ok(new ApiResponse<RefundResponse>(true, "Refund request created successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to create refund request.", null));
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMine()
    {
        var result = await refundService.GetMineAsync(GetUserId());
        return Ok(new ApiResponse<IReadOnlyList<RefundResponse>>(true, "Refund requests retrieved successfully.", result.Value));
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
