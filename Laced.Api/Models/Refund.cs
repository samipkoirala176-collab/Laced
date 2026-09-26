namespace Laced.Api.Models;

public enum RefundStatus
{
    Requested,
    Approved,
    Rejected,
    Paid
}

public class RefundRequest
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public string PaymentInfo { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public RefundStatus Status { get; set; } = RefundStatus.Requested;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }

    public Order Order { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
