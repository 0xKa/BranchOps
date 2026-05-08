namespace BranchOps.Ai.Abstractions;

public sealed class RunContext : IRunContext
{
    public Guid? RunId { get; private set; }
    public Guid? UserId { get; private set; }
    public Guid? BranchId { get; private set; }
    public string EntityType { get; private set; } = "ReplenishmentRun";

    public void Set(Guid runId, Guid userId, Guid branchId)
        => Set(runId, userId, branchId, "ReplenishmentRun");

    public void Set(Guid runId, Guid userId, Guid? branchId, string entityType)
    {
        RunId = runId;
        UserId = userId;
        BranchId = branchId;
        EntityType = string.IsNullOrWhiteSpace(entityType) ? "ReplenishmentRun" : entityType.Trim();
    }
}
