using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Laced.Api.Common.Results;
using Laced.Api.Data;
using Laced.Api.Features.Payments.DTOs;
using Laced.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Laced.Api.Features.Payments;

public class EsewaService(
    ApplicationDbContext dbContext,
    HttpClient httpClient,
    IOptions<EsewaOptions> options,
    IOptions<BackendOptions> backendOptions) : IEsewaService
{
    private const string SignedFieldNames = "total_amount,transaction_uuid,product_code";
    private readonly EsewaOptions settings = options.Value;
    private readonly BackendOptions backendSettings = backendOptions.Value;

    public async Task<Result<EsewaPaymentResponse>> InitiateAsync(Guid userId, Guid orderId, bool payAgain)
    {
        var configurationError = ValidateConfiguration();
        if (configurationError is not null)
        {
            return Result<EsewaPaymentResponse>.Failure(configurationError);
        }

        var order = await dbContext.Orders.FirstOrDefaultAsync(item => item.Id == orderId && item.UserId == userId);
        if (order is null)
        {
            return Result<EsewaPaymentResponse>.Failure("Order not found.");
        }

        if (order.PaymentMethod != PaymentMethod.Esewa)
        {
            return Result<EsewaPaymentResponse>.Failure("This order does not use eSewa.");
        }

        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return Result<EsewaPaymentResponse>.Failure("This order has already been paid.");
        }

        if (order.OrderStatus == OrderStatus.Cancelled)
        {
            return Result<EsewaPaymentResponse>.Failure("Cancelled orders cannot be paid.");
        }

        if (order.CreatedAt < DateTime.UtcNow.AddMinutes(-30))
        {
            return Result<EsewaPaymentResponse>.Failure("This payment session has expired.");
        }

        var transactionUuid = $"{order.Id:N}-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        order.EsewaTransactionUuid = transactionUuid;
        order.EsewaTransactionCode = null;
        order.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        var amount = order.TotalAmount.ToString("0.00", CultureInfo.InvariantCulture);
        var fields = new Dictionary<string, string>
        {
            ["amount"] = amount,
            ["tax_amount"] = "0",
            ["total_amount"] = amount,
            ["transaction_uuid"] = transactionUuid,
            ["product_code"] = settings.ProductCode,
            ["product_service_charge"] = "0",
            ["product_delivery_charge"] = "0",
            ["success_url"] = BuildBackendUrl(settings.SuccessPath),
            ["failure_url"] = BuildBackendUrl(settings.FailurePath),
            ["signed_field_names"] = SignedFieldNames,
            ["signature"] = CreateSignature($"total_amount={amount},transaction_uuid={transactionUuid},product_code={settings.ProductCode}")
        };

        return Result<EsewaPaymentResponse>.Success(new EsewaPaymentResponse(settings.PaymentUrl, fields));
    }

    public async Task<Result<EsewaCallbackResult>> ProcessSuccessCallbackAsync(string encodedData)
    {
        if (!TryDecodeCallback(encodedData, out var document, out var callback))
        {
            return Result<EsewaCallbackResult>.Failure("Invalid eSewa callback data.");
        }

        if (!VerifyCallbackSignature(document!, callback!))
        {
            return Result<EsewaCallbackResult>.Failure("Invalid eSewa callback signature.");
        }

        var callbackData = callback!;
        var order = await dbContext.Orders.FirstOrDefaultAsync(item => item.EsewaTransactionUuid == callbackData.TransactionUuid);
        if (order is null)
        {
            return Result<EsewaCallbackResult>.Failure("No matching order was found for this payment.");
        }

        if (!MatchesOrder(order, callbackData))
        {
            return Result<EsewaCallbackResult>.Failure("The eSewa payment does not match the order.");
        }

        if (!callbackData.Status.Equals("COMPLETE", StringComparison.OrdinalIgnoreCase))
        {
            return Result<EsewaCallbackResult>.Success(new EsewaCallbackResult(order.Id, false, "Payment is not complete."));
        }

        if (order.PaymentStatus != PaymentStatus.Paid)
        {
            order.PaymentStatus = PaymentStatus.Paid;
            order.OrderStatus = OrderStatus.Confirmed;
            order.EsewaTransactionCode = callbackData.TransactionCode;
            order.PaidAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }

        return Result<EsewaCallbackResult>.Success(new EsewaCallbackResult(order.Id, true, "Payment verified successfully."));
    }

    public async Task<Result<EsewaStatusResponse>> CheckStatusAsync(Guid userId, Guid orderId)
    {
        var configurationError = ValidateConfiguration();
        if (configurationError is not null)
        {
            return Result<EsewaStatusResponse>.Failure(configurationError);
        }

        var order = await dbContext.Orders.FirstOrDefaultAsync(item => item.Id == orderId && item.UserId == userId);
        if (order is null)
        {
            return Result<EsewaStatusResponse>.Failure("Order not found.");
        }

        if (order.PaymentMethod != PaymentMethod.Esewa)
        {
            return Result<EsewaStatusResponse>.Failure("This order does not use eSewa.");
        }

        if (string.IsNullOrWhiteSpace(order.EsewaTransactionUuid))
        {
            return Result<EsewaStatusResponse>.Failure("No eSewa transaction has been initiated for this order.");
        }

        var remoteResult = await GetRemoteStatusAsync(order, CancellationToken.None);
        if (!remoteResult.IsSuccess)
        {
            return Result<EsewaStatusResponse>.Failure(remoteResult.Error!);
        }

        var remoteStatus = remoteResult.Value!;
        var statusResult = await ApplyStatusAsync(order, remoteStatus);
        return statusResult.IsSuccess
            ? Result<EsewaStatusResponse>.Success(remoteStatus)
            : Result<EsewaStatusResponse>.Failure(statusResult.Error!);
    }

    public async Task ExpirePendingOrdersAsync(CancellationToken cancellationToken)
    {
        var expiryTime = DateTime.UtcNow.AddMinutes(-30);
        var orders = await dbContext.Orders
            .Include(order => order.Items)
                .ThenInclude(item => item.ProductSize)
            .Where(order => order.PaymentMethod == PaymentMethod.Esewa &&
                            order.PaymentStatus == PaymentStatus.Pending &&
                            order.OrderStatus != OrderStatus.Cancelled &&
                            order.CreatedAt < expiryTime)
            .ToListAsync(cancellationToken);

        foreach (var candidate in orders)
        {
            var remoteResult = await GetRemoteStatusAsync(candidate, cancellationToken);
            var remoteStatus = remoteResult.Value;
            if (remoteResult.IsSuccess &&
                remoteStatus is not null &&
                remoteStatus.Status.Equals("COMPLETE", StringComparison.OrdinalIgnoreCase) &&
                MatchesOrder(candidate, remoteStatus))
            {
                await MarkPaidAsync(candidate.Id, remoteStatus.RefId, cancellationToken);
                continue;
            }

            var paymentStatus = remoteResult.IsSuccess &&
                                remoteStatus is not null &&
                                remoteStatus.Status.Equals("FULL_REFUND", StringComparison.OrdinalIgnoreCase)
                ? PaymentStatus.Refunded
                : remoteResult.IsSuccess &&
                  remoteStatus is not null &&
                  remoteStatus.Status.Equals("CANCELED", StringComparison.OrdinalIgnoreCase)
                    ? PaymentStatus.Failed
                    : PaymentStatus.Pending;
            await CancelExpiredOrderAsync(candidate.Id, paymentStatus, cancellationToken);
        }
    }

    private async Task<Result<EsewaStatusResponse>> GetRemoteStatusAsync(Order order, CancellationToken cancellationToken)
    {
        var configurationError = ValidateConfiguration();
        if (configurationError is not null)
        {
            return Result<EsewaStatusResponse>.Failure(configurationError);
        }

        var amount = order.TotalAmount.ToString("0.00", CultureInfo.InvariantCulture);
        var url = $"{settings.StatusCheckUrl}?product_code={Uri.EscapeDataString(settings.ProductCode)}&total_amount={Uri.EscapeDataString(amount)}&transaction_uuid={Uri.EscapeDataString(order.EsewaTransactionUuid!)}";
        try
        {
            var response = await httpClient.GetFromJsonAsync<EsewaStatusResponse>(url, cancellationToken);
            return response is null
                ? Result<EsewaStatusResponse>.Failure("eSewa returned an empty status response.")
                : Result<EsewaStatusResponse>.Success(response);
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException)
        {
            return Result<EsewaStatusResponse>.Failure($"Unable to check eSewa status: {exception.Message}");
        }
    }

    private async Task<Result> ApplyStatusAsync(Order order, EsewaStatusResponse status)
    {
        if (!MatchesOrder(order, status))
        {
            return Result.Failure("The eSewa status response does not match the order.");
        }

        var normalizedStatus = status.Status.ToUpperInvariant();
        if (normalizedStatus == "COMPLETE")
        {
            await MarkPaidAsync(order.Id, status.RefId, CancellationToken.None);
        }
        else if (normalizedStatus == "FULL_REFUND")
        {
            order.PaymentStatus = PaymentStatus.Refunded;
            order.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }
        else if (normalizedStatus == "CANCELED")
        {
            order.PaymentStatus = PaymentStatus.Failed;
            order.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }

        return Result.Success();
    }

    private async Task MarkPaidAsync(Guid orderId, string? transactionCode, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders.FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);
        if (order is null || order.PaymentStatus == PaymentStatus.Paid)
        {
            return;
        }

        order.PaymentStatus = PaymentStatus.Paid;
        order.OrderStatus = OrderStatus.Confirmed;
        order.EsewaTransactionCode = string.IsNullOrWhiteSpace(transactionCode) ? order.EsewaTransactionCode : transactionCode;
        order.PaidAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task CancelExpiredOrderAsync(Guid orderId, PaymentStatus paymentStatus, CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var order = await dbContext.Orders
            .Include(item => item.Items)
                .ThenInclude(item => item.ProductSize)
            .FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);

        if (order is null || order.PaymentStatus != PaymentStatus.Pending || order.OrderStatus == OrderStatus.Cancelled)
        {
            return;
        }

        foreach (var item in order.Items)
        {
            item.ProductSize.Quantity += item.Quantity;
        }

        order.PaymentStatus = paymentStatus;
        order.OrderStatus = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private bool MatchesOrder(Order order, EsewaCallbackResponse callback) =>
        callback.ProductCode == settings.ProductCode &&
        callback.TransactionUuid == order.EsewaTransactionUuid &&
        callback.TotalAmount == order.TotalAmount;

    private bool MatchesOrder(Order order, EsewaStatusResponse response) =>
        response.ProductCode == settings.ProductCode &&
        response.TransactionUuid == order.EsewaTransactionUuid &&
        response.TotalAmount == order.TotalAmount;

    private string? ValidateConfiguration()
    {
        return string.IsNullOrWhiteSpace(settings.PaymentUrl) ||
               string.IsNullOrWhiteSpace(settings.StatusCheckUrl) ||
               string.IsNullOrWhiteSpace(settings.ProductCode) ||
               string.IsNullOrWhiteSpace(settings.SecretKey) ||
               string.IsNullOrWhiteSpace(settings.SuccessPath) ||
               string.IsNullOrWhiteSpace(settings.FailurePath) ||
               string.IsNullOrWhiteSpace(backendSettings.BaseUrl)
            ? "eSewa configuration is incomplete."
            : null;
    }

    private string BuildBackendUrl(string path) =>
        $"{backendSettings.BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}";

    private string CreateSignature(string input) => Convert.ToBase64String(
        HMACSHA256.HashData(Encoding.UTF8.GetBytes(settings.SecretKey), Encoding.UTF8.GetBytes(input)));

    private bool TryDecodeCallback(string encodedData, out JsonDocument? document, out EsewaCallbackResponse? callback)
    {
        document = null;
        callback = null;
        try
        {
            var normalized = encodedData.Replace('-', '+').Replace('_', '/');
            normalized = normalized.PadRight(normalized.Length + (4 - normalized.Length % 4) % 4, '=');
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(normalized));
            document = JsonDocument.Parse(json);
            callback = JsonSerializer.Deserialize<EsewaCallbackResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return callback is not null;
        }
        catch (FormatException)
        {
            return false;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private bool VerifyCallbackSignature(JsonDocument document, EsewaCallbackResponse callback)
    {
        if (string.IsNullOrWhiteSpace(callback.SignedFieldNames) || string.IsNullOrWhiteSpace(callback.Signature))
        {
            return false;
        }

        var values = callback.SignedFieldNames.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(field =>
            {
                if (!document.RootElement.TryGetProperty(field, out var value))
                {
                    return null;
                }

                return $"{field}={(value.ValueKind == JsonValueKind.String ? value.GetString() : value.GetRawText())}";
            })
            .ToList();

        if (values.Any(value => value is null))
        {
            return false;
        }

        try
        {
            var expected = Convert.FromBase64String(CreateSignature(string.Join(',', values!)));
            var actual = Convert.FromBase64String(callback.Signature);
            return CryptographicOperations.FixedTimeEquals(expected, actual);
        }
        catch (FormatException)
        {
            return false;
        }
    }

}
