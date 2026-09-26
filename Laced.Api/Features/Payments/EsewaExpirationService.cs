namespace Laced.Api.Features.Payments;

public class EsewaExpirationService(
    IServiceScopeFactory scopeFactory,
    ILogger<EsewaExpirationService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var esewaService = scope.ServiceProvider.GetRequiredService<IEsewaService>();
                await esewaService.ExpirePendingOrdersAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Error while expiring pending eSewa orders.");
            }
        }
    }
}
