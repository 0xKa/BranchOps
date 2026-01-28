using BranchOps.Application.Interfaces;
using BranchOps.Infrastructure.Persistence;
using BranchOps.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BranchOps.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
    this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BranchOpsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // JWT Settings
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        // Register AuthService and other services
        services.AddScoped<IAuth, Auth>();

        return services;
    }
}
