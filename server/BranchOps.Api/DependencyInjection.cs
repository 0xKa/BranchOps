using BranchOps.Api.Data;
using BranchOps.Api.Security;
using BranchOps.Api.Services;
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
        services.AddScoped<BranchService>();
        services.AddScoped<BranchPhoneService>();
        services.AddScoped<EmployeeService>();
        services.AddScoped<EmployeeSalaryService>();

        return services;
    }
}
