using Laced.Api.Models;

namespace Laced.Api.Features.Refunds.DTOs;

public record RefundResponse(
    Guid Id,
    Guid OrderId,
    Guid UserId,
    string? CustomerName,
    string? CustomerEmail,
    decimal OrderTotal,
    string PaymentInfo,
    string Reason,
    RefundStatus Status,
    string? AdminNote,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? ProcessedAt);
