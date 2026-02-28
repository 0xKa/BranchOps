using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class AuditLogService(BranchOpsDbContext db)
{
    // ── Query ──────────────────────────────────────────────────────
    public async Task<PagedResult<AuditLogDto>> GetAllAsync(
        PaginationQuery pagination,
        Guid? userId = null,
        string? action = null,
        string? entityType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken ct = default)
    {
        var query = db.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Utc);
            query = query.Where(a => a.Timestamp >= from);
        }

        if (toDate.HasValue)
        {
            var to = DateTime.SpecifyKind(toDate.Value.Date.AddDays(1), DateTimeKind.Utc);
            query = query.Where(a => a.Timestamp < to);
        }

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pagination.PageSize);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.UserId,
                a.User != null ? a.User.Username : null,
                a.Action,
                a.EntityType,
                a.EntityId,
                a.Details,
                a.Timestamp))
            .ToListAsync(ct);

        return new PagedResult<AuditLogDto>(items, pagination.Page, pagination.PageSize, totalCount, totalPages);
    }

    // ── Write ──────────────────────────────────────────────────────
    public async Task LogAsync(
        Guid? userId, string action, string entityType,
        Guid? entityId, string details, CancellationToken ct = default)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            Timestamp = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
    }

    // ── Distinct filter values ─────────────────────────────────────
    public async Task<IReadOnlyList<string>> GetDistinctActionsAsync(CancellationToken ct)
        => await db.AuditLogs.Select(a => a.Action).Distinct().OrderBy(a => a).ToListAsync(ct);

    public async Task<IReadOnlyList<string>> GetDistinctEntityTypesAsync(CancellationToken ct)
        => await db.AuditLogs.Select(a => a.EntityType).Distinct().OrderBy(e => e).ToListAsync(ct);
}
