using Laced.Api.Common.Results;
using Laced.Api.Features.Auth.DTOs;

namespace Laced.Api.Features.Auth;

public interface IAuthService
{
    Task<Result> SignupAsync(SignupRequest request);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
    Task<Result<UserProfileResponse>> GetProfileAsync(Guid userId);
    Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}
