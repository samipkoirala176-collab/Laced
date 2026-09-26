using System.ComponentModel.DataAnnotations;

namespace Laced.Api.Features.Refunds.DTOs;

public class CreateRefundRequest
{
    [Required]
    public Guid OrderId { get; set; }

    [Required]
    public string PaymentInfo { get; set; } = string.Empty;

    [Required]
    public string Reason { get; set; } = string.Empty;
}
