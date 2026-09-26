namespace Laced.Api.Features.Orders.DTOs;

public class OrderQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public string? Search { get; set; }
}
