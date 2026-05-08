using BranchOps.Ai.Configuration;
using BranchOps.Ai.Middleware;
using BranchOps.Ai.Tools;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;

namespace BranchOps.Ai.Agents;

public sealed class AskBranchOpsAgent(
    IOptions<AiOptions> options,
    AuditAndEventMiddleware audit,
    ILoggerFactory loggerFactory,
    IServiceProvider services)
{
    private const string Instructions = """
        You are Ask BranchOps, a read-only operations analyst for a multi-branch retail business.
        Answer only from tool results. If the tools do not provide enough data, say what is unavailable.
        Always mention the branch scope and date range or as-of date used.
        Keep answers concise and practical for managers.
        Use markdown tables for ranked lists, branch comparisons, low-stock rows, or daily summaries.
        Refuse requests to create, update, delete, approve, export, adjust stock, place orders, or mutate data.
        Do not invent product, branch, sales, stock, or order facts.
        """;

    public AIAgent Build(Guid? branchId, string branchScope, AskBranchOpsTools tools)
    {
        tools.BindScope(branchId, branchScope);

        var openAiOptions = options.Value.OpenAI;
        if (string.IsNullOrWhiteSpace(openAiOptions.ApiKey))
            throw new InvalidOperationException("OpenAI API key is not configured. Set 'Ai:OpenAI:ApiKey'.");

        var client = new OpenAIClient(openAiOptions.ApiKey);
        var chatClient = client.GetChatClient(openAiOptions.Model);

        var agent = chatClient.AsAIAgent(
            Instructions,
            "AskBranchOps",
            "Answers read-only operational questions using BranchOps report, dashboard, stock, and branch tools.",
            [
                AIFunctionFactory.Create(tools.GetCurrentBranchScope),
                AIFunctionFactory.Create(tools.ListAccessibleBranches),
                AIFunctionFactory.Create(tools.GetDashboardSummary),
                AIFunctionFactory.Create(tools.GetSalesChart),
                AIFunctionFactory.Create(tools.GetDailySales),
                AIFunctionFactory.Create(tools.GetTopProducts),
                AIFunctionFactory.Create(tools.GetSalesByBranch),
                AIFunctionFactory.Create(tools.GetLowStockAlerts),
                AIFunctionFactory.Create(tools.GetRecentOrders)
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
