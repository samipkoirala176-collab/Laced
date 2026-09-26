using Laced.Api.Common.Results;
using Laced.Api.Features.Payments.DTOs;

namespace Laced.Api.Features.Payments;

public interface IEsewaService
{
    Task<Result<EsewaPaymentResponse>> InitiateAsync(Guid userId, Guid orderId, bool payAgain);
    Task<Result<EsewaCallbackResult>> ProcessSuccessCallbackAsync(string encodedData);
    Task<Result<EsewaStatusResponse>> CheckStatusAsync(Guid userId, Guid orderId);
    Task ExpirePendingOrdersAsync(CancellationToken cancellationToken);
}
