namespace BranchOps.Ai.Abstractions;

public sealed class RunContext : IRunContext
{
    public Guid? RunId { get; private set; }
    public Guid? UserId { get; private set; }
    public Guid? BranchId { get; private set; }

    public void Set(Guid runId, Guid userId, Guid branchId)
    {
        RunId = runId;
        UserId = userId;
        BranchId = branchId;
    }
}
