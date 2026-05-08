namespace BranchOps.Ai.Abstractions;

public interface IRunContext
{
    Guid? RunId { get; }
    Guid? UserId { get; }
    Guid? BranchId { get; }
}
