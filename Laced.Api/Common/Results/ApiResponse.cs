namespace Laced.Api.Common.Results;

public record ApiResponse<T>(bool Success, string Message, T? Data);