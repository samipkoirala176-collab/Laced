using Laced.Api.Common.Results;
using Laced.Api.Features.Refunds.DTOs;

namespace Laced.Api.Features.Refunds;

public interface IRefundService
{
    Task<Result<RefundResponse>> CreateAsync(Guid userId, CreateRefundRequest request);
    Task<Result<IReadOnlyList<RefundResponse>>> GetMineAsync(Guid userId);
    Task<Result<IReadOnlyList<RefundResponse>>> GetAllAsync();
    Task<Result<RefundResponse>> GetByIdAsync(Guid refundId);
    Task<Result<RefundResponse>> UpdateStatusAsync(Guid refundId, UpdateRefundStatusRequest request);
}
