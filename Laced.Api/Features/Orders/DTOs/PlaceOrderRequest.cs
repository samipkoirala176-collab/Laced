using System.ComponentModel.DataAnnotations;

namespace Laced.Api.Features.Orders.DTOs;

public class PlaceOrderRequest
{
    [Required]
    public string ShippingName { get; set; } = string.Empty;

    [Required]
    public string ShippingPhone { get; set; } = string.Empty;

    [Required]
    public string ShippingAddress { get; set; } = string.Empty;

    [Required]
    public string ShippingCity { get; set; } = string.Empty;

    public string? ShippingPostalCode { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;
}
