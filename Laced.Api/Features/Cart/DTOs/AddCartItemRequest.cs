using System.ComponentModel.DataAnnotations;

namespace Laced.Api.Features.Cart.DTOs;

public class AddCartItemRequest
{
    [Required]
    public Guid ProductSizeId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
