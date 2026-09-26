using Laced.Api.Models;

namespace Laced.Api.Features.Orders.DTOs;

public record OrderItemResponse(
    Guid Id,
    Guid ProductId,
    Guid ProductSizeId,
    string ProductName,
    decimal Size,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    string? HeroImage);

public record OrderResponse(
    Guid Id,
    Guid UserId,
    string? CustomerName,
    string? CustomerEmail,
    IReadOnlyList<OrderItemResponse> Items,
    decimal TotalAmount,
    string ShippingName,
    string ShippingPhone,
    string ShippingAddress,
    string ShippingCity,
    string? ShippingPostalCode,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    OrderStatus OrderStatus,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record OrderListResponse(
    IReadOnlyList<OrderResponse> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages);
