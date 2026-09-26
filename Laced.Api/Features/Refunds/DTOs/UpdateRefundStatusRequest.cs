using System.ComponentModel.DataAnnotations;

namespace Laced.Api.Features.Refunds.DTOs;

public class UpdateRefundStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? AdminNote { get; set; }
}
