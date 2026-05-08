using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;
using BranchOps.Api.Services;

namespace BranchOps.Api.Ai.Adapters;

public sealed class BranchOpsAgentReadModelAdapter(
    ReportsService reports,
    DashboardService dashboard,
    StockService stock,
    BranchService branches) : IBranchOpsAgentReadModel
{
    public async Task<BranchOpsAgentBranchInfo?> GetBranchAsync(Guid branchId, CancellationToken ct)
    {
        var branch = await branches.GetByIdAsync(branchId, ct);
        return branch is null
            ? null
            : new BranchOpsAgentBranchInfo(branch.Id, branch.DisplayName, branch.City, branch.IsActive);
    }

    public async Task<IReadOnlyList<BranchOpsAgentBranchInfo>> ListBranchesAsync(Guid? branchId, int max, CancellationToken ct)
    {
        var rows = await branches.GetAllAsync(ct);
        if (branchId.HasValue)
            rows = rows.Where(branch => branch.Id == branchId.Value).ToList();

        return rows
            .Where(branch => branch.IsActive)
            .Take(max)
            .Select(branch => new BranchOpsAgentBranchInfo(branch.Id, branch.DisplayName, branch.City, branch.IsActive))
            .ToList();
    }

    public async Task<BranchOpsAgentDashboardSummary> GetDashboardSummaryAsync(Guid? branchId, CancellationToken ct)
    {
        var summary = await dashboard.GetSummaryAsync(ct, branchId);
        return new BranchOpsAgentDashboardSummary(
            await GetScopeAsync(branchId, ct),
            DateTime.UtcNow,
            summary.TotalSales,
            summary.TotalSalesToday,
            summary.TotalOrders,
            summary.TotalOrdersToday,
            summary.TotalBranches,
            summary.ActiveBranches,
            summary.TotalProducts,
            summary.ActiveProducts,
            summary.TotalEmployees,
            summary.TotalCategories);
    }

    public async Task<BranchOpsAgentSalesChart> GetSalesChartAsync(string period, Guid? branchId, CancellationToken ct)
    {
        var normalized = NormalizePeriod(period);
        var chart = await dashboard.GetSalesChartAsync(normalized, branchId, ct);
        var now = DateTime.UtcNow;

        return new BranchOpsAgentSalesChart(
            await GetScopeAsync(branchId, ct),
            chart.Period,
            GetPeriodStartUtc(normalized, now),
            now,
            chart.TotalSales,
            chart.TotalOrders,
            chart.DataPoints
                .Select(row => new BranchOpsAgentSalesDataPoint(row.Date, row.TotalSales, row.OrderCount))
                .ToList());
    }

    public async Task<BranchOpsAgentDailySalesReport> GetDailySalesAsync(
        DateTime fromDate,
        DateTime toDate,
        Guid? branchId,
        int maxRows,
        CancellationToken ct)
    {
        var from = DateTime.SpecifyKind(fromDate.Date, DateTimeKind.Utc);
        var to = DateTime.SpecifyKind(toDate.Date, DateTimeKind.Utc);
        if (to < from)
            (from, to) = (to, from);

        var report = await reports.GetDailySalesAsync(from, to, branchId, ct);
        return new BranchOpsAgentDailySalesReport(
            await GetScopeAsync(branchId, ct),
            report.FromDate,
            report.ToDate,
            report.GrandTotalSales,
            report.GrandTotalOrders,
            report.GrandTotalItemsSold,
            report.GrandTotalCancelled,
            report.Rows
                .Take(maxRows)
                .Select(row => new BranchOpsAgentDailySalesRow(
                    row.Date,
                    row.OrderCount,
                    row.TotalSales,
                    row.AverageOrderValue,
                    row.TotalItemsSold,
                    row.CancelledOrders))
                .ToList());
    }

    public async Task<BranchOpsAgentTopProductsReport> GetTopProductsAsync(
        int count,
        int days,
        Guid? branchId,
        CancellationToken ct)
    {
        var rows = await reports.GetTopProductsAsync(count, days, branchId, ct);
        var now = DateTime.UtcNow;
        return new BranchOpsAgentTopProductsReport(
            await GetScopeAsync(branchId, ct),
            days,
            now.AddDays(-days),
            now,
            rows.Select(row => new BranchOpsAgentTopProductRow(
                    row.ProductId,
                    row.ProductName,
                    row.CategoryName,
                    row.TotalQuantitySold,
                    row.TotalRevenue))
                .ToList());
    }

    public async Task<BranchOpsAgentBranchPerformanceReport> GetSalesByBranchAsync(
        int days,
        Guid? branchId,
        int maxRows,
        CancellationToken ct)
    {
        var rows = await reports.GetSalesByBranchAsync(days, ct, branchId);
        var now = DateTime.UtcNow;
        return new BranchOpsAgentBranchPerformanceReport(
            await GetScopeAsync(branchId, ct),
            days,
            now.AddDays(-days),
            now,
            rows.Take(maxRows)
                .Select(row => new BranchOpsAgentBranchPerformanceRow(
                    row.BranchId,
                    row.BranchName,
                    row.TotalSales,
                    row.OrderCount,
                    row.EmployeeCount,
                    row.LowStockItems))
                .ToList());
    }

    public async Task<BranchOpsAgentLowStockReport> GetLowStockAlertsAsync(Guid? branchId, int maxRows, CancellationToken ct)
    {
        var rows = await stock.GetLowStockAlertsAsync(branchId, ct);
        return new BranchOpsAgentLowStockReport(
            await GetScopeAsync(branchId, ct),
            DateTime.UtcNow,
            rows.Take(maxRows)
                .Select(row => new BranchOpsAgentLowStockAlert(
                    row.BranchId,
                    row.Branch.DisplayName,
                    row.ProductId,
                    row.Product.Name,
                    row.Quantity,
                    row.LowStockThreshold))
                .ToList());
    }

    public async Task<BranchOpsAgentRecentOrdersReport> GetRecentOrdersAsync(int count, Guid? branchId, CancellationToken ct)
    {
        var rows = await dashboard.GetRecentOrdersAsync(count, branchId, ct);
        return new BranchOpsAgentRecentOrdersReport(
            await GetScopeAsync(branchId, ct),
            DateTime.UtcNow,
            rows.Select(row => new BranchOpsAgentRecentOrder(
                    row.Id,
                    row.BranchId,
                    row.BranchName,
                    row.CreatedByUserName,
                    row.Total,
                    row.Status,
                    row.PaymentMethod,
                    row.ItemCount,
                    row.CreatedAt))
                .ToList());
    }

    private async Task<BranchOpsAgentScopeInfo> GetScopeAsync(Guid? branchId, CancellationToken ct)
    {
        if (!branchId.HasValue)
            return new BranchOpsAgentScopeInfo(null, "All accessible branches");

        var branch = await branches.GetByIdAsync(branchId.Value, ct);
        return new BranchOpsAgentScopeInfo(branchId, branch?.DisplayName ?? "Selected branch");
    }

    private static string NormalizePeriod(string period)
    {
        var normalized = period.Trim().ToLowerInvariant();
        return normalized is "today" or "week" or "month" or "year" ? normalized : "month";
    }

    private static DateTime GetPeriodStartUtc(string period, DateTime now)
        => period switch
        {
            "today" => now.Date,
            "week" => now.Date.AddDays(-(int)now.DayOfWeek),
            "month" => new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc),
            "year" => new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            _ => now.Date
        };
}
