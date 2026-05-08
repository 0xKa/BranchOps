using BranchOps.Ai.Models;

namespace BranchOps.Ai.Streaming;

public abstract record AgentEvent(int Sequence);

public sealed record TextDeltaEvent(int Sequence, string Text) : AgentEvent(Sequence);

public sealed record ToolStartEvent(
    int Sequence,
    string ToolName,
    string ArgumentsJson,
    string ToolCallId) : AgentEvent(Sequence);

public sealed record ToolEndEvent(
    int Sequence,
    string ToolCallId,
    long DurationMs,
    string ResultJsonPreview,
    bool Failed,
    string? Error) : AgentEvent(Sequence);

public sealed record RecommendationAddedEvent(
    int Sequence,
    DraftRecommendation Recommendation) : AgentEvent(Sequence);

public sealed record RunCompletedEvent(
    int Sequence,
    Guid RunId,
    string Summary,
    int RecommendationCount,
    long DurationMs) : AgentEvent(Sequence);

public sealed record RunFailedEvent(
    int Sequence,
    Guid RunId,
    string Error) : AgentEvent(Sequence);
