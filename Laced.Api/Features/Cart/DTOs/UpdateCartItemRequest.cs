using System.ComponentModel.DataAnnotations;

namespace Laced.Api.Features.Cart.DTOs;

public class UpdateCartItemRequest
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
