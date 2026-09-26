namespace Laced.Api.Features.Payments;

public class FrontendOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string SuccessPath { get; set; } = string.Empty;
    public string FailurePath { get; set; } = string.Empty;
}
