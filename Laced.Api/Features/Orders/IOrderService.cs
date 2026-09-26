using Laced.Api.Common.Results;
using Laced.Api.Features.Orders.DTOs;

namespace Laced.Api.Features.Orders;

public interface IOrderService
{
    Task<Result<OrderResponse>> PlaceAsync(Guid userId, PlaceOrderRequest request);
    Task<Result<OrderListResponse>> GetMineAsync(Guid userId, OrderQueryParameters parameters);
    Task<Result<OrderResponse>> GetMineByIdAsync(Guid userId, Guid orderId);
    Task<Result> CancelMineAsync(Guid userId, Guid orderId);
    Task<Result<OrderListResponse>> GetAdminAsync(OrderQueryParameters parameters);
    Task<Result<OrderResponse>> GetAdminByIdAsync(Guid orderId);
    Task<Result<OrderResponse>> UpdateStatusAsync(Guid orderId, OrderStatusRequest request);
    Task<Result> CancelAdminAsync(Guid orderId);
}
