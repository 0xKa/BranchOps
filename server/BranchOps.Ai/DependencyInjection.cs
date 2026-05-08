using BranchOps.Ai.Configuration;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Agents;
using BranchOps.Ai.Middleware;
using BranchOps.Ai.Models;
using BranchOps.Ai.Streaming;
using BranchOps.Ai.Tools;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BranchOps.Ai;

public static class DependencyInjection
{
    public static IServiceCollection AddBranchOpsAi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<AiOptions>(configuration.GetSection("Ai"));

        services.AddScoped<IRunContext, RunContext>();
        services.AddScoped<ISequenceCounter, SequenceCounter>();
        services.AddScoped<AgentEventChannel>();
        services.AddScoped<AuditAndEventMiddleware>();
        services.AddScoped<ReplenishmentAdvisorAgent>();
        services.AddScoped<BranchOpsAgent>();

        services.AddScoped<InventoryTools>();
        services.AddScoped<SalesAnalyticsTools>();
        services.AddScoped<ProductTools>();
        services.AddScoped<RecommendationDraftTools>();
        services.AddScoped<BranchOpsAgentTools>();
        services.AddScoped(sp => new ToolBundle(
            sp.GetRequiredService<InventoryTools>(),
            sp.GetRequiredService<SalesAnalyticsTools>(),
            sp.GetRequiredService<ProductTools>(),
            sp.GetRequiredService<RecommendationDraftTools>()));

        return services;
    }
}
