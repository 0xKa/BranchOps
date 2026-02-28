using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize(Roles = "Admin,BranchManager")]
public class DashboardController(DashboardService dashboardService) : ControllerBase
{
    /// <summary>
    /// Returns a combined overview for the dashboard initial load.
    /// Includes summary stats, sales charts, recent orders, top products,
    /// branch performance, and low-stock alerts in a single call.
    /// </summary>
    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverviewDto>> GetOverview(
        CancellationToken ct)
    {
        var overview = await dashboardService.GetOverviewAsync(ct);
        return Ok(overview);
    }

    /// <summary>
    /// Aggregate counts: total sales, orders, branches, products, employees, etc.
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(
        CancellationToken ct)
    {
        var summary = await dashboardService.GetSummaryAsync(ct);
        return Ok(summary);
    }

    /// <summary>
    /// Sales data points grouped by day (or month for yearly view).
    /// </summary>
    /// <param name="period">today | week | month | year</param>
    /// <param name="branchId">Optional branch filter</param>
    [HttpGet("sales-chart")]
    public async Task<ActionResult<SalesChartDto>> GetSalesChart(
        [FromQuery] string period = "today",
        [FromQuery] Guid? branchId = null,
        CancellationToken ct = default)
    {
        var chart = await dashboardService.GetSalesChartAsync(period, branchId, ct);
        return Ok(chart);
    }

    /// <summary>
    /// Most recent orders across all branches (or filtered by branch).
    /// </summary>
    /// <param name="count">Number of orders to return (default 10, max 50)</param>
    /// <param name="branchId">Optional branch filter</param>
    [HttpGet("recent-orders")]
    public async Task<ActionResult<IReadOnlyList<RecentOrderDto>>> GetRecentOrders(
        [FromQuery] int count = 10,
        [FromQuery] Guid? branchId = null,
        CancellationToken ct = default)
    {
        if (count is < 1 or > 50) count = 10;

        var orders = await dashboardService.GetRecentOrdersAsync(count, branchId, ct);
        return Ok(orders);
    }

    /// <summary>
    /// Top selling products by revenue within a rolling window.
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

        var products = await dashboardService.GetTopSellingProductsAsync(count, days, branchId, ct);
        return Ok(products);
    }

    /// <summary>
    /// Sales and operational metrics per active branch.
    /// </summary>
    /// <param name="days">Rolling window in days (default 30, null = all time)</param>
    [HttpGet("branch-performance")]
    public async Task<ActionResult<IReadOnlyList<BranchPerformanceDto>>> GetBranchPerformance(
        [FromQuery] int? days = 30,
        CancellationToken ct = default)
    {
        var performance = await dashboardService.GetBranchPerformanceAsync(days, ct);
        return Ok(performance);
    }

    /// <summary>
    /// Products that have reached or fallen below their low-stock threshold.
    /// </summary>
    /// <param name="branchId">Optional branch filter</param>
    [HttpGet("low-stock-alerts")]
    public async Task<ActionResult<IReadOnlyList<LowStockAlertDto>>> GetLowStockAlerts(
        [FromQuery] Guid? branchId = null,
        CancellationToken ct = default)
    {
        var alerts = await dashboardService.GetLowStockAlertsAsync(branchId, ct);
        return Ok(alerts);
    }
}
