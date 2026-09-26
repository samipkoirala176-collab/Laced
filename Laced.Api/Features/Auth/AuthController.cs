using System.Security.Claims;
using Laced.Api.Common.Results;
using Laced.Api.Features.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("signup")]
    public async Task<IActionResult> Signup(SignupRequest request)
    {
        var result = await authService.SignupAsync(request);
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Registration successful.", null))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Registration failed.", null));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return result.IsSuccess
            ? Ok(new ApiResponse<AuthResponse>(true, "Login successful.", result.Value))
            : Unauthorized(new ApiResponse<object?>(false, result.Error ?? "Login failed.", null));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var result = await authService.GetProfileAsync(GetUserId());
        return result.IsSuccess
            ? Ok(new ApiResponse<UserProfileResponse>(true, "Profile retrieved successfully.", result.Value))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "User not found.", null));
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var result = await authService.ChangePasswordAsync(GetUserId(), request);
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Password changed successfully.", null))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Password change failed.", null));
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
