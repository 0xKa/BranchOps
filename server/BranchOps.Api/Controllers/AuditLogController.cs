using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AuditLogController(AuditLogService auditLogService) : ControllerBase
{
    /// <summary>
    /// Paginated list of audit-log entries with optional filters.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] string? entityType = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken ct = default)
    {
        var result = await auditLogService.GetAllAsync(
            pagination, userId, action, entityType, fromDate, toDate, ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns the distinct Action values present in the log, for filter dropdowns.
    /// </summary>
    [HttpGet("actions")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetActions(CancellationToken ct)
    {
        var actions = await auditLogService.GetDistinctActionsAsync(ct);
        return Ok(actions);
    }

    /// <summary>
    /// Returns the distinct EntityType values present in the log, for filter dropdowns.
    /// </summary>
    [HttpGet("entity-types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetEntityTypes(CancellationToken ct)
    {
        var entityTypes = await auditLogService.GetDistinctEntityTypesAsync(ct);
        return Ok(entityTypes);
    }
}
