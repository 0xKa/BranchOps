using BranchOps.Ai.Configuration;
using BranchOps.Ai.Middleware;
using BranchOps.Ai.Models;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;

namespace BranchOps.Ai.Agents;

public sealed class ReplenishmentAdvisorAgent(
    IOptions<AiOptions> options,
    AuditAndEventMiddleware audit,
    ILoggerFactory loggerFactory,
    IServiceProvider services)
{
    private const string Instructions = """
        You are the Stock Replenishment Advisor for a multi-branch retail business.
        Analyze only the active branch using the provided tools.
        Use inventory, sales velocity, days-of-stock, and product context before proposing reorders.
        Recommendations are drafts for human approval only; never claim inventory was changed.
        Call ProposeReorder exactly once per product you recommend.
        Keep the final summary concise and business-focused.
        """;

    public AIAgent Build(Guid branchId, ToolBundle tools)
    {
        tools.Inventory.BindBranch(branchId);
        tools.Sales.BindBranch(branchId);
        tools.Drafts.BindBranch(branchId);

        var openAiOptions = options.Value.OpenAI;
        if (string.IsNullOrWhiteSpace(openAiOptions.ApiKey))
            throw new InvalidOperationException("OpenAI API key is not configured. Set 'Ai:OpenAI:ApiKey'.");

        var client = new OpenAIClient(openAiOptions.ApiKey);
        var chatClient = client.GetChatClient(openAiOptions.Model);

        var agent = chatClient.AsAIAgent(
            Instructions,
            "StockReplenishmentAdvisor",
            "Analyzes branch stock and sales data, then drafts reorder recommendations.",
            [
                AIFunctionFactory.Create(tools.Inventory.GetLowStockItems),
                AIFunctionFactory.Create(tools.Inventory.GetCurrentStock),
                AIFunctionFactory.Create(tools.Inventory.ListStockByBranch),
                AIFunctionFactory.Create(tools.Sales.GetTopProducts),
                AIFunctionFactory.Create(tools.Sales.GetSalesVelocity),
                AIFunctionFactory.Create(tools.Sales.GetDaysOfStock),
                AIFunctionFactory.Create(tools.Products.GetProduct),
                AIFunctionFactory.Create(tools.Products.ListProductsByCategory),
                AIFunctionFactory.Create(tools.Drafts.ProposeReorder)
            ],
            chat => chat
                .AsBuilder()
                .UseFunctionInvocation(loggerFactory)
                .Build(),
            loggerFactory,
            services);

        return agent.AsBuilder()
            .Use(audit.HandleAsync)
            .Build();
    }
}
