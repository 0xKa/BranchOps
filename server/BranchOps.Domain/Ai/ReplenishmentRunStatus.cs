namespace BranchOps.Domain.Ai;

/// <summary>
/// Lifecycle status of a single replenishment-advisor run.
/// </summary>
public enum ReplenishmentRunStatus
{
    Running = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4
}
