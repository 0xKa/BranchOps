using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;
using BranchOps.Api.Services;

namespace BranchOps.Api.Ai.Adapters;

public sealed class AskBranchOpsReadModelAdapter(
    ReportsService reports,
    DashboardService dashboard,
    StockService stock,
    BranchService branches) : IAskBranchOpsReadModel
{
    public async Task<AskBranchInfo?> GetBranchAsync(Guid branchId, CancellationToken ct)
    {
        var branch = await branches.GetByIdAsync(branchId, ct);
        return branch is null
            ? null
            : new AskBranchInfo(branch.Id, branch.DisplayName, branch.City, branch.IsActive);
    }

    public async Task<IReadOnlyList<AskBranchInfo>> ListBranchesAsync(Guid? branchId, int max, CancellationToken ct)
    {
        var rows = await branches.GetAllAsync(ct);
        if (branchId.HasValue)
            rows = rows.Where(branch => branch.Id == branchId.Value).ToList();

        return rows
            .Where(branch => branch.IsActive)
            .Take(max)
            .Select(branch => new AskBranchInfo(branch.Id, branch.DisplayName, branch.City, branch.IsActive))
            .ToList();
    }

    public async Task<AskDashboardSummary> GetDashboardSummaryAsync(Guid? branchId, CancellationToken ct)
    {
        var summary = await dashboard.GetSummaryAsync(ct, branchId);
        return new AskDashboardSummary(
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

    public async Task<AskSalesChart> GetSalesChartAsync(string period, Guid? branchId, CancellationToken ct)
    {
        var normalized = NormalizePeriod(period);
        var chart = await dashboard.GetSalesChartAsync(normalized, branchId, ct);
        var now = DateTime.UtcNow;

        return new AskSalesChart(
            await GetScopeAsync(branchId, ct),
            chart.Period,
            GetPeriodStartUtc(normalized, now),
            now,
            chart.TotalSales,
            chart.TotalOrders,
            chart.DataPoints
                .Select(row => new AskSalesDataPoint(row.Date, row.TotalSales, row.OrderCount))
                .ToList());
    }

    public async Task<AskDailySalesReport> GetDailySalesAsync(
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
        return new AskDailySalesReport(
            await GetScopeAsync(branchId, ct),
            report.FromDate,
            report.ToDate,
            report.GrandTotalSales,
            report.GrandTotalOrders,
            report.GrandTotalItemsSold,
            report.GrandTotalCancelled,
            report.Rows
                .Take(maxRows)
                .Select(row => new AskDailySalesRow(
                    row.Date,
                    row.OrderCount,
                    row.TotalSales,
                    row.AverageOrderValue,
                    row.TotalItemsSold,
                    row.CancelledOrders))
                .ToList());
    }

    public async Task<AskTopProductsReport> GetTopProductsAsync(
        int count,
        int days,
        Guid? branchId,
        CancellationToken ct)
    {
        var rows = await reports.GetTopProductsAsync(count, days, branchId, ct);
        var now = DateTime.UtcNow;
        return new AskTopProductsReport(
            await GetScopeAsync(branchId, ct),
            days,
            now.AddDays(-days),
            now,
            rows.Select(row => new AskTopProductRow(
                    row.ProductId,
                    row.ProductName,
                    row.CategoryName,
                    row.TotalQuantitySold,
                    row.TotalRevenue))
                .ToList());
    }

    public async Task<AskBranchPerformanceReport> GetSalesByBranchAsync(
        int days,
        Guid? branchId,
        int maxRows,
        CancellationToken ct)
    {
        var rows = await reports.GetSalesByBranchAsync(days, ct, branchId);
        var now = DateTime.UtcNow;
        return new AskBranchPerformanceReport(
            await GetScopeAsync(branchId, ct),
            days,
            now.AddDays(-days),
            now,
            rows.Take(maxRows)
                .Select(row => new AskBranchPerformanceRow(
                    row.BranchId,
                    row.BranchName,
                    row.TotalSales,
                    row.OrderCount,
                    row.EmployeeCount,
                    row.LowStockItems))
                .ToList());
    }

    public async Task<AskLowStockReport> GetLowStockAlertsAsync(Guid? branchId, int maxRows, CancellationToken ct)
    {
        var rows = await stock.GetLowStockAlertsAsync(branchId, ct);
        return new AskLowStockReport(
            await GetScopeAsync(branchId, ct),
            DateTime.UtcNow,
            rows.Take(maxRows)
                .Select(row => new AskLowStockAlert(
                    row.BranchId,
                    row.Branch.DisplayName,
                    row.ProductId,
                    row.Product.Name,
                    row.Quantity,
                    row.LowStockThreshold))
                .ToList());
    }

    public async Task<AskRecentOrdersReport> GetRecentOrdersAsync(int count, Guid? branchId, CancellationToken ct)
    {
        var rows = await dashboard.GetRecentOrdersAsync(count, branchId, ct);
        return new AskRecentOrdersReport(
            await GetScopeAsync(branchId, ct),
            DateTime.UtcNow,
            rows.Select(row => new AskRecentOrder(
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

    private async Task<AskScopeInfo> GetScopeAsync(Guid? branchId, CancellationToken ct)
    {
        if (!branchId.HasValue)
            return new AskScopeInfo(null, "All accessible branches");

        var branch = await branches.GetByIdAsync(branchId.Value, ct);
        return new AskScopeInfo(branchId, branch?.DisplayName ?? "Selected branch");
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
