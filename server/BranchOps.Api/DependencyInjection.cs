using BranchOps.Api.Data;
using BranchOps.Api.Security;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
             this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BranchOpsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // JWT Settings
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        services.AddScoped<Auth>();

        return services;
    }
}
