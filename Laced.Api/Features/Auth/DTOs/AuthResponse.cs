namespace Laced.Api.Features.Auth.DTOs;

public record AuthResponse(string Token, UserProfileResponse User);
