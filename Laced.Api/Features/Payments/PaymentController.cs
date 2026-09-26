using System.Security.Claims;
using Laced.Api.Common.Results;
using Laced.Api.Features.Payments.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Laced.Api.Features.Payments;

[ApiController]
[Route("api/payments")]
public class PaymentController(
    IEsewaService esewaService,
    IOptions<FrontendOptions> frontendOptions) : ControllerBase
{
    [Authorize]
    [HttpPost("esewa/initiate/{orderId:guid}")]
    public async Task<IActionResult> Initiate(Guid orderId)
    {
        var result = await esewaService.InitiateAsync(GetUserId(), orderId, false);
        return result.IsSuccess
            ? Ok(new ApiResponse<EsewaPaymentResponse>(true, "eSewa payment initiated.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to initiate eSewa payment.", null));
    }

    [Authorize]
    [HttpPost("esewa/pay-again/{orderId:guid}")]
    public async Task<IActionResult> PayAgain(Guid orderId)
    {
        var result = await esewaService.InitiateAsync(GetUserId(), orderId, true);
        return result.IsSuccess
            ? Ok(new ApiResponse<EsewaPaymentResponse>(true, "eSewa payment re-initiated.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to re-initiate eSewa payment.", null));
    }

    [Authorize]
    [HttpPost("esewa/status/{orderId:guid}")]
    public async Task<IActionResult> Status(Guid orderId)
    {
        var result = await esewaService.CheckStatusAsync(GetUserId(), orderId);
        return result.IsSuccess
            ? Ok(new ApiResponse<EsewaStatusResponse>(true, "eSewa status checked successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Unable to check eSewa status.", null));
    }

    [AllowAnonymous]
    [AcceptVerbs("GET", "POST")]
    [Route("esewa/success")]
    public async Task<IActionResult> Success([FromQuery] string? data)
    {
        var encodedData = data;
        if (string.IsNullOrWhiteSpace(encodedData) && Request.HasFormContentType)
        {
            encodedData = Request.Form["data"].ToString();
        }

        if (!string.IsNullOrWhiteSpace(encodedData))
        {
            var result = await esewaService.ProcessSuccessCallbackAsync(encodedData);
            if (result.IsSuccess && result.Value is not null)
            {
                var status = result.Value.PaymentCompleted ? "success" : "pending";
                return RedirectToFrontend($"{frontendOptions.Value.SuccessPath}?orderId={result.Value.OrderId}&status={status}");
            }
        }

        return RedirectToFrontend($"{frontendOptions.Value.FailurePath}?status=invalid");
    }

    [AllowAnonymous]
    [AcceptVerbs("GET", "POST")]
    [Route("esewa/failure")]
    public IActionResult Failure() => RedirectToFrontend($"{frontendOptions.Value.FailurePath}?status=failed");

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private IActionResult RedirectToFrontend(string path)
    {
        var baseUrl = frontendOptions.Value.BaseUrl.TrimEnd('/');
        return Redirect($"{baseUrl}/{path}");
    }
}
