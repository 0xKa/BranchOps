using BranchOps.Ai.Streaming;

namespace BranchOps.Api.Dtos;

public sealed record BranchOpsAgentRequest(
    string? Message,
    Guid? BranchId,
    IReadOnlyList<BranchOpsAgentHistoryMessage>? History);

public sealed record BranchOpsAgentHistoryMessage(
    string Role,
    string Content);

public sealed record BranchOpsAgentSsePayload(
    int Sequence,
    string Type,
    object Data)
{
    public static BranchOpsAgentSsePayload FromEvent(AgentEvent evt)
        => evt switch
        {
            TextDeltaEvent e => new(e.Sequence, "text-delta", new { e.Text }),
            ToolStartEvent e => new(e.Sequence, "tool-start", new
            {
                e.ToolName,
                e.ArgumentsJson,
                e.ToolCallId
            }),
            ToolEndEvent e => new(e.Sequence, "tool-end", new
            {
                e.ToolCallId,
                e.DurationMs,
                e.ResultJsonPreview,
                e.Failed,
                e.Error
            }),
            RunCompletedEvent e => new(e.Sequence, "answer-completed", new
            {
                CorrelationId = e.RunId,
                Answer = e.Summary,
                e.DurationMs
            }),
            RunFailedEvent e => new(e.Sequence, "answer-failed", new
            {
                CorrelationId = e.RunId,
                e.Error
            }),
            _ => new(evt.Sequence, "unknown", new { })
        };
}
