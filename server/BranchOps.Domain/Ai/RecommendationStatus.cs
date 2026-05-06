namespace BranchOps.Domain.Ai;

/// <summary>
/// Approval state of a single AI-proposed reorder recommendation.
/// Approving never mutates inventory directly — it only flips this status
/// and records who/when. Physical restocking remains the existing manual flow.
/// </summary>
public enum RecommendationStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}
