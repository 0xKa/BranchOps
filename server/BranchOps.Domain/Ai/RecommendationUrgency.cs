namespace BranchOps.Domain.Ai;

/// <summary>
/// Urgency classification the agent assigns to a reorder recommendation.
/// Mapping (from system prompt rules):
///   Critical -- days-of-stock &lt;= 2
///   High     -- days-of-stock &lt;= 5
///   Medium   -- days-of-stock &lt;= 10
///   Low      -- otherwise (or zero recent sales)
/// </summary>
public enum RecommendationUrgency
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}
