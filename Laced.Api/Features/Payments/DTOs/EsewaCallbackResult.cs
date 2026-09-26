namespace Laced.Api.Features.Payments.DTOs;

public record EsewaCallbackResult(Guid OrderId, bool PaymentCompleted, string Message);
