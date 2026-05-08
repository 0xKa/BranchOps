using System.Diagnostics;
using System.Text;
using System.Threading.Channels;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Agents;
using BranchOps.Ai.Configuration;
using BranchOps.Ai.Streaming;
using BranchOps.Ai.Tools;
using BranchOps.Api.Dtos;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;

namespace BranchOps.Api.Ai.Orchestration;

public sealed class BranchOpsAgentRunOrchestrator(
    BranchOpsAgent agentFactory,
    BranchOpsAgentTools tools,
    AgentEventChannel events,
    ISequenceCounter sequence,
    IRunContext runContext,
    IBranchOpsAgentReadModel readModel,
    IOptions<AiOptions> options,
    ILogger<BranchOpsAgentRunOrchestrator> logger)
{
    public async Task<BranchOpsAgentRunStream> StartAsync(
        Guid userId,
        Guid? branchId,
        string message,
        IReadOnlyList<BranchOpsAgentHistoryMessage>? history,
        CancellationToken cancellationToken)
    {
        var correlationId = Guid.NewGuid();
        var branchScope = "All accessible branches";

        if (branchId.HasValue)
        {
            var branch = await readModel.GetBranchAsync(branchId.Value, cancellationToken);
            if (branch is null || !branch.IsActive)
                throw new BranchOpsAgentRunException("Branch not found or inactive.");

            branchScope = branch.DisplayName;
        }

        runContext.Set(correlationId, userId, branchId, "BranchOpsAgent");

        var task = ExecuteAsync(correlationId, branchId, branchScope, message, history, cancellationToken);
        return new BranchOpsAgentRunStream(correlationId, events.Reader, task);
    }

    private async Task ExecuteAsync(
        Guid correlationId,
        Guid? branchId,
        string branchScope,
        string message,
        IReadOnlyList<BranchOpsAgentHistoryMessage>? history,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        var answer = new StringBuilder();

        try
        {
            var agent = agentFactory.Build(branchId, branchScope, tools);
            var messages = BuildMessages(message, history);

            await foreach (var update in agent.RunStreamingAsync(messages, cancellationToken: cancellationToken))
            {
                if (string.IsNullOrEmpty(update.Text))
                    continue;

                answer.Append(update.Text);
                await events.Writer.WriteAsync(
                    new TextDeltaEvent(sequence.Next(), update.Text),
                    cancellationToken);
            }

            sw.Stop();
            var finalAnswer = Truncate(answer.ToString().Trim(), 4000);
            await events.Writer.WriteAsync(
                new RunCompletedEvent(
                    sequence.Next(),
                    correlationId,
                    string.IsNullOrWhiteSpace(finalAnswer) ? "No answer was returned." : finalAnswer,
                    0,
                    sw.ElapsedMilliseconds),
                cancellationToken);
        }
        catch (OperationCanceledException)
        {
            await events.Writer.WriteAsync(
                new RunFailedEvent(sequence.Next(), correlationId, "Answer cancelled."),
                CancellationToken.None);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "BranchOps Agent answer {CorrelationId} failed.", correlationId);
            await events.Writer.WriteAsync(
                new RunFailedEvent(sequence.Next(), correlationId, "BranchOps Agent failed. Please retry later."),
                CancellationToken.None);
        }
        finally
        {
            events.Writer.TryComplete();
        }
    }

    private IReadOnlyList<ChatMessage> BuildMessages(
        string message,
        IReadOnlyList<BranchOpsAgentHistoryMessage>? history)
    {
        var maxHistory = Math.Clamp(options.Value.BranchOpsAgent.MaxHistoryMessages, 0, 20);
        var maxLength = Math.Clamp(options.Value.BranchOpsAgent.MaxMessageLength, 100, 4000);
        var messages = new List<ChatMessage>();

        foreach (var item in (history ?? []).TakeLast(maxHistory))
        {
            var content = Truncate(item.Content, maxLength);
            if (string.IsNullOrWhiteSpace(content))
                continue;

            var role = item.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase)
                ? ChatRole.Assistant
                : ChatRole.User;

            messages.Add(new ChatMessage(role, content));
        }

        messages.Add(new ChatMessage(ChatRole.User, Truncate(message, maxLength)));
        return messages;
    }

    private static string Truncate(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var trimmed = value.Trim();
        return trimmed.Length <= max ? trimmed : trimmed[..max];
    }
}

public sealed record BranchOpsAgentRunStream(
    Guid CorrelationId,
    ChannelReader<AgentEvent> Events,
    Task Completion);

public sealed class BranchOpsAgentRunException(string message) : Exception(message);
