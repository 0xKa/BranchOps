namespace BranchOps.Ai.Abstractions;

public interface IRunContext
{
    Guid? RunId { get; }
    Guid? UserId { get; }
    Guid? BranchId { get; }
    string EntityType { get; }

    void Set(Guid runId, Guid userId, Guid branchId);
    void Set(Guid runId, Guid userId, Guid? branchId, string entityType);
}
