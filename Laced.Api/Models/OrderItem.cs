namespace Laced.Api.Models;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid ProductSizeId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Size { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductSize ProductSize { get; set; } = null!;
}
