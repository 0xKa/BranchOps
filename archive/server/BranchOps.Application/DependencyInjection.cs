using Microsoft.Extensions.DependencyInjection;

namespace BranchOps.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        //services.AddScoped<ISomthingService, SomthingService>();

        return services;
    }
}