using System.Diagnostics;
using System.Text.Json;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Configuration;
using BranchOps.Ai.Streaming;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;

namespace BranchOps.Ai.Middleware;

public sealed class AuditAndEventMiddleware(
    IReplenishmentAuditWriter audit,
    AgentEventChannel events,
    ISequenceCounter sequence,
    IRunContext runContext,
    IOptions<AiOptions> options)
{
    private const int MaxAuditDetailsLength = 500;
    private const int MaxResultPreviewLength = 300;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async ValueTask<object?> HandleAsync(
        AIAgent agent,
        FunctionInvocationContext context,
        Func<FunctionInvocationContext, CancellationToken, ValueTask<object?>> next,
        CancellationToken cancellationToken)
    {
        if (context.Iteration > GetMaxToolIterations())
        {
            context.Terminate = true;
            return new { error = "Maximum tool-call iterations exceeded." };
        }

        var toolCallId = context.CallContent?.CallId ?? Guid.NewGuid().ToString("N");
        var toolName = context.Function.Name;
        var argumentsJson = JsonSerializer.Serialize(context.Arguments, JsonOptions);

        await events.Writer.WriteAsync(
            new ToolStartEvent(sequence.Next(), toolName, argumentsJson, toolCallId),
            cancellationToken);

        var sw = Stopwatch.StartNew();
        try
        {
            var result = await next(context, cancellationToken);
            sw.Stop();

            var preview = ToPreviewJson(result);
            await audit.WriteAsync(
                runContext.UserId,
                "AI.Tool.Completed",
                runContext.EntityType,
                runContext.RunId,
                BuildAuditDetails(toolName, toolCallId, argumentsJson, preview, failed: false, error: null),
                cancellationToken);

            await events.Writer.WriteAsync(
                new ToolEndEvent(sequence.Next(), toolCallId, sw.ElapsedMilliseconds, preview, false, null),
                cancellationToken);

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            await audit.WriteAsync(
                runContext.UserId,
                "AI.Tool.Failed",
                runContext.EntityType,
                runContext.RunId,
                BuildAuditDetails(toolName, toolCallId, argumentsJson, "null", failed: true, ex.Message),
                cancellationToken);

            await events.Writer.WriteAsync(
                new ToolEndEvent(sequence.Next(), toolCallId, sw.ElapsedMilliseconds, "null", true, ex.Message),
                cancellationToken);

            throw;
        }
    }

    private int GetMaxToolIterations()
        => string.Equals(runContext.EntityType, "AskBranchOps", StringComparison.OrdinalIgnoreCase)
            ? options.Value.AskBranchOps.MaxToolIterations
            : options.Value.Replenishment.MaxToolIterations;

    private static string ToPreviewJson(object? value)
    {
        var json = JsonSerializer.Serialize(value, JsonOptions);
        return json.Length <= MaxResultPreviewLength ? json : json[..MaxResultPreviewLength];
    }

    private static string BuildAuditDetails(
        string toolName,
        string toolCallId,
        string argumentsJson,
        string resultJsonPreview,
        bool failed,
        string? error)
    {
        var details = JsonSerializer.Serialize(new
        {
            toolName,
            toolCallId,
            argumentsJson,
            resultJsonPreview,
            failed,
            error
        }, JsonOptions);

        return details.Length <= MaxAuditDetailsLength
            ? details
            : details[..MaxAuditDetailsLength];
    }
}
