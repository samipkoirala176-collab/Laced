namespace Laced.Api.Features.Payments;

public class EsewaOptions
{
    public string PaymentUrl { get; set; } = string.Empty;
    public string StatusCheckUrl { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string SuccessPath { get; set; } = string.Empty;
    public string FailurePath { get; set; } = string.Empty;
}
