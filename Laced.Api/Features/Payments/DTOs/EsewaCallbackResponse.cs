using System.Text.Json.Serialization;

namespace Laced.Api.Features.Payments.DTOs;

public class EsewaCallbackResponse
{
    [JsonPropertyName("transaction_code")]
    public string TransactionCode { get; set; } = string.Empty;
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    [JsonPropertyName("total_amount")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal TotalAmount { get; set; }
    [JsonPropertyName("transaction_uuid")]
    public string TransactionUuid { get; set; } = string.Empty;
    [JsonPropertyName("product_code")]
    public string ProductCode { get; set; } = string.Empty;
    [JsonPropertyName("signed_field_names")]
    public string SignedFieldNames { get; set; } = string.Empty;
    [JsonPropertyName("signature")]
    public string Signature { get; set; } = string.Empty;
}
