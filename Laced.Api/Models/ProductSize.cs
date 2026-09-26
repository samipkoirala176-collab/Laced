namespace Laced.Api.Models;

public class ProductSize
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public decimal Size { get; set; }
    public int Quantity { get; set; }

    public Product Product { get; set; } = null!;
    public ICollection<CartItem> CartItems { get; set; } = [];
}
