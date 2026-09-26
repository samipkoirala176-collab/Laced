using System.ComponentModel.DataAnnotations;

namespace Laced.Api.Features.Orders.DTOs;

public class OrderStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
