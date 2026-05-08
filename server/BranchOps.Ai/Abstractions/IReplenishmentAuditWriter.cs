namespace BranchOps.Ai.Abstractions;

/// <summary>
/// Thin abstraction over AuditLogService.LogAsync, declared inside BranchOps.Ai
/// so the function-calling middleware (which lives here) can write audit rows
/// without creating a reverse project reference back to BranchOps.Api.
/// </summary>
public interface IReplenishmentAuditWriter
{
    Task WriteAsync(
        Guid? userId,
        string action,
        string entityType,
        Guid? entityId,
        string details,
        CancellationToken ct);
}
