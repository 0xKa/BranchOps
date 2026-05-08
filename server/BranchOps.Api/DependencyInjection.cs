using BranchOps.Ai;
using BranchOps.Ai.Abstractions;
using BranchOps.Api.Ai.Adapters;
using BranchOps.Api.Ai.Orchestration;
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
        services.AddScoped<SalesExportService>();
        services.AddScoped<AuditLogService>();

        services.AddBranchOpsAi(configuration);
        services.AddScoped<IInventoryReadModel, InventoryReadModelAdapter>();
        services.AddScoped<ISalesReadModel, SalesReadModelAdapter>();
        services.AddScoped<IProductReadModel, ProductReadModelAdapter>();
        services.AddScoped<IReplenishmentAuditWriter, AuditLogWriterAdapter>();
        services.AddScoped<IBranchOpsAgentReadModel, BranchOpsAgentReadModelAdapter>();
        services.AddScoped<ReplenishmentRunOrchestrator>();
        services.AddScoped<BranchOpsAgentRunOrchestrator>();

        return services;
    }
}
