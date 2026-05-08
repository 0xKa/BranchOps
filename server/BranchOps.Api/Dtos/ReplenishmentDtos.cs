using BranchOps.Ai.Models;
using BranchOps.Ai.Streaming;
using BranchOps.Domain.Ai;

namespace BranchOps.Api.Dtos;

public record StartRunRequest(string? UserPrompt);

public record DecisionRequest(string? Notes);

public record ReplenishmentRunSummaryDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    ReplenishmentRunStatus Status,
    string ModelId,
    string? Summary,
    string? ErrorMessage,
    DateTime StartedAt,
    DateTime? CompletedAt,
    Guid TriggeredByUserId,
    string TriggeredByUsername,
    int RecommendationCount);

public record ReplenishmentRunDetailDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    ReplenishmentRunStatus Status,
    string ModelId,
    string? Summary,
    string? ErrorMessage,
    DateTime StartedAt,
    DateTime? CompletedAt,
    Guid TriggeredByUserId,
    string TriggeredByUsername,
    IReadOnlyList<ReplenishmentRecommendationDto> Recommendations);

public record ReplenishmentRecommendationDto(
    Guid Id,
    Guid RunId,
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    int CurrentStock,
    int SuggestedQty,
    RecommendationUrgency Urgency,
    string Rationale,
    decimal Confidence,
    RecommendationStatus Status,
    Guid? DecidedByUserId,
    string? DecidedByUsername,
    DateTime? DecidedAt,
    string? DecisionNotes);

public record ReplenishmentSsePayload(
    int Sequence,
    string Type,
    object Data)
{
    public static ReplenishmentSsePayload FromEvent(AgentEvent evt)
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
            RecommendationAddedEvent e => new(e.Sequence, "recommendation-added", new
            {
                Recommendation = ToDraftDto(e.Recommendation)
            }),
            RunCompletedEvent e => new(e.Sequence, "run-completed", new
            {
                e.RunId,
                e.Summary,
                e.RecommendationCount,
                e.DurationMs
            }),
            RunFailedEvent e => new(e.Sequence, "run-failed", new
            {
                e.RunId,
                e.Error
            }),
            _ => new(evt.Sequence, "unknown", new { })
        };

    private static object ToDraftDto(DraftRecommendation draft)
        => new
        {
            draft.BranchId,
            draft.ProductId,
            draft.SuggestedQty,
            draft.Urgency,
            draft.Rationale,
            draft.Confidence
        };
}
