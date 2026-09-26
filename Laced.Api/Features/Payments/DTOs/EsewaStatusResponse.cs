using System.Text.Json.Serialization;

namespace Laced.Api.Features.Payments.DTOs;

public class EsewaStatusResponse
{
    [JsonPropertyName("product_code")]
    public string ProductCode { get; set; } = string.Empty;

    [JsonPropertyName("scd")]
    public string LegacyProductCode
    {
        set
        {
            if (string.IsNullOrWhiteSpace(ProductCode))
            {
                ProductCode = value;
            }
        }
    }

    [JsonPropertyName("transaction_uuid")]
    public string TransactionUuid { get; set; } = string.Empty;

    [JsonPropertyName("pid")]
    public string LegacyTransactionUuid
    {
        set
        {
            if (string.IsNullOrWhiteSpace(TransactionUuid))
            {
                TransactionUuid = value;
            }
        }
    }

    [JsonPropertyName("total_amount")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal TotalAmount { get; set; }

    [JsonPropertyName("totalAmount")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal LegacyTotalAmount
    {
        set
        {
            if (TotalAmount == 0)
            {
                TotalAmount = value;
            }
        }
    }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    [JsonPropertyName("ref_id")]
    public string RefId { get; set; } = string.Empty;

    [JsonPropertyName("refId")]
    public string LegacyRefId
    {
        set
        {
            if (string.IsNullOrWhiteSpace(RefId))
            {
                RefId = value;
            }
        }
    }
}
