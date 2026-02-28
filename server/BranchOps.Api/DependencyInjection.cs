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
        services.AddScoped<AccountSettingsService>();
        services.AddScoped<BranchService>();
        services.AddScoped<BranchPhoneService>();
        services.AddScoped<EmployeeService>();
        services.AddScoped<EmployeeSalaryService>();
        services.AddScoped<ProductCategoryService>();
        services.AddScoped<ProductService>();
        services.AddScoped<OrderService>();
        services.AddScoped<StockService>();
        services.AddScoped<DashboardService>();
        services.AddScoped<ReportsService>();

        return services;
    }
}
