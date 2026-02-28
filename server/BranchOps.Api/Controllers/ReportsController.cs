using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,BranchManager")]
public class ReportsController(ReportsService reportsService) : ControllerBase
{
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
        var report = await reportsService.GetDailySalesAsync(fromDate, toDate, branchId, ct);
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
        var data = await reportsService.GetSalesByBranchAsync(days, ct);
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

        var products = await reportsService.GetTopProductsAsync(count, days, branchId, ct);
        return Ok(products);
    }
}
