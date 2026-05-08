using BranchOps.Ai.Abstractions;
using BranchOps.Api.Services;

namespace BranchOps.Api.Ai.Adapters;

public sealed class AuditLogWriterAdapter(AuditLogService auditLog) : IReplenishmentAuditWriter
{
    public Task WriteAsync(
        Guid? userId,
        string action,
        string entityType,
        Guid? entityId,
        string details,
        CancellationToken ct)
        => auditLog.LogAsync(userId, action, entityType, entityId, details, ct);
}
