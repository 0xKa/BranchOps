using BranchOps.Api.Dtos;
using BranchOps.Api.Security;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,BranchManager")]
public class ReportsController(
    ReportsService reportsService,
    SalesExportService salesExportService,
    AuditLogService auditLogService) : ControllerBase
{
    /// <summary>
    /// Export sales data as a CSV file for a date range.
    /// Admin can export for any branch or all branches; BranchManager is scoped to their own branch.
    /// </summary>
    /// <param name="fromDate">Start date (inclusive, required)</param>
    /// <param name="toDate">End date (inclusive, required)</param>
    /// <param name="branchId">Optional branch filter (ignored for BranchManager)</param>
    /// <param name="status">Optional order status filter (Paid, Cancelled)</param>
    /// <param name="granularity">OrderSummary (one row per order) or ItemDetail (one row per item)</param>
    [HttpGet("export/sales")]
    public async Task ExportSalesCsv(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        [FromQuery] Guid? branchId = null,
        [FromQuery] OrderStatus? status = null,
        [FromQuery] ExportGranularity granularity = ExportGranularity.OrderSummary,
        CancellationToken ct = default)
    {
        if (fromDate > toDate || (toDate - fromDate).TotalDays > 366)
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsJsonAsync(
                new ApiError("fromDate must be <= toDate and the range must not exceed 366 days."), ct);
            return;
        }

        var effectiveBranchId = User.GetEffectiveBranchId(branchId);

        // Build descriptive filename
        var branchLabel = "all";
        if (effectiveBranchId.HasValue)
        {
            branchLabel = await salesExportService.GetBranchCodeAsync(effectiveBranchId.Value, ct)
                          ?? effectiveBranchId.Value.ToString()[..8];
        }

        var filename = $"sales_{granularity}_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}_{branchLabel}.csv";

        Response.ContentType = "text/csv; charset=utf-8";
        Response.Headers.ContentDisposition = $"attachment; filename=\"{filename}\"";

        await salesExportService.WriteSalesCsvAsync(
            Response.Body, fromDate, toDate, effectiveBranchId, status, granularity, ct);

        // Audit log
        var userId = User.GetUserId();
        var details = $"Exported {granularity} CSV: {fromDate:yyyy-MM-dd} to {toDate:yyyy-MM-dd}, " +
                      $"branch={branchLabel}, status={status?.ToString() ?? "All"}";
        await auditLogService.LogAsync(userId, "Export", "SalesCsv", null, details, ct);
    }

    /// <summary>
    /// Daily sales breakdown for a date range, optionally filtered by branch.
    /// Defaults to the last 30 days when no dates are provided.
    /// </summary>
    [HttpGet("daily-sales")]
    public async Task<ActionResult<DailySalesReportDto>> GetDailySales(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] Guid? branchId = null,
        CancellationToken ct = default)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var report = await reportsService.GetDailySalesAsync(fromDate, toDate, effectiveBranchId, ct);
        return Ok(report);
    }

    /// <summary>
    /// Sales and operational metrics per active branch within a rolling window.
    /// </summary>
    /// <param name="days">Rolling window in days (default 30, null = all time)</param>
    [HttpGet("sales-by-branch")]
    public async Task<ActionResult<IReadOnlyList<BranchPerformanceDto>>> GetSalesByBranch(
        [FromQuery] int? days = 30,
        CancellationToken ct = default)
    {
        var branchId = User.GetEffectiveBranchId(null);
        var data = await reportsService.GetSalesByBranchAsync(days, ct, branchId);
        return Ok(data);
    }

    /// <summary>
    /// Top selling products by revenue within a rolling window,
    /// optionally filtered by branch.
    /// </summary>
    /// <param name="count">Number of products (default 10, max 50)</param>
    /// <param name="days">Rolling window in days (default 30, null = all time)</param>
    /// <param name="branchId">Optional branch filter</param>
    [HttpGet("top-products")]
    public async Task<ActionResult<IReadOnlyList<TopSellingProductDto>>> GetTopProducts(
        [FromQuery] int count = 10,
        [FromQuery] int? days = 30,
        [FromQuery] Guid? branchId = null,
        CancellationToken ct = default)
    {
        if (count is < 1 or > 50) count = 10;

        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var products = await reportsService.GetTopProductsAsync(count, days, effectiveBranchId, ct);
        return Ok(products);
    }
}
