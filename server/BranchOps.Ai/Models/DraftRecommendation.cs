using BranchOps.Domain.Ai;

namespace BranchOps.Ai.Models;

/// <summary>
/// In-memory draft produced by RecommendationDraftTools.ProposeReorder during a run.
/// Drafts are NOT persisted by the tool itself; the orchestrator validates and
/// persists them as ReplenishmentRecommendation rows at end-of-run.
/// </summary>
public sealed record DraftRecommendation(
    Guid BranchId,
    Guid ProductId,
    int SuggestedQty,
    RecommendationUrgency Urgency,
    string Rationale,
    decimal Confidence);

/// <summary>Tool-acknowledgement returned to the agent after a successful ProposeReorder call.</summary>
public sealed record DraftAck(bool Accepted, int DraftCount);
