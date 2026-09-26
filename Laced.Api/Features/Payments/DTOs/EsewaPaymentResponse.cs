namespace Laced.Api.Features.Payments.DTOs;

public record EsewaPaymentResponse(string PaymentUrl, IReadOnlyDictionary<string, string> Fields);
