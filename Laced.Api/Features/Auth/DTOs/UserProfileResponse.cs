namespace Laced.Api.Features.Auth.DTOs;

public record UserProfileResponse(Guid Id, string Name, string Email, string Role);
