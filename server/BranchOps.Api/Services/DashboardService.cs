using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class DashboardService(BranchOpsDbContext db)
{
    // ── Summary ────────────────────────────────────────────────────
    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var todayUtc = DateTime.UtcNow.Date;

        var totalSales = await db.Orders
            .Where(o => o.Status == OrderStatus.Paid)
            .SumAsync(o => (decimal?)o.Total, ct) ?? 0m;

        var totalSalesToday = await db.Orders
            .Where(o => o.Status == OrderStatus.Paid && o.CreatedAt >= todayUtc)
            .SumAsync(o => (decimal?)o.Total, ct) ?? 0m;

        var totalOrders = await db.Orders.CountAsync(ct);
        var totalOrdersToday = await db.Orders.CountAsync(o => o.CreatedAt >= todayUtc, ct);

        var totalBranches = await db.Branches.CountAsync(ct);
        var activeBranches = await db.Branches.CountAsync(b => b.IsActive, ct);

        var totalProducts = await db.Products.CountAsync(ct);
        var activeProducts = await db.Products.CountAsync(p => p.IsActive, ct);

        var totalEmployees = await db.Employees.CountAsync(e => e.IsActive, ct);
        var totalCategories = await db.ProductCategories.CountAsync(c => c.IsActive, ct);

        return new DashboardSummaryDto(
            totalSales, totalSalesToday,
            totalOrders, totalOrdersToday,
            totalBranches, activeBranches,
            totalProducts, activeProducts,
            totalEmployees, totalCategories);
    }

    // ── Sales Chart ────────────────────────────────────────────────
    public async Task<SalesChartDto> GetSalesChartAsync(
        string period, Guid? branchId = null, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        DateTime from;
        string label;

        switch (period.ToLowerInvariant())
        {
            case "today":
                from = now.Date;
                label = "today";
                break;
            case "week":
                from = now.Date.AddDays(-(int)now.DayOfWeek);
                label = "week";
                break;
            case "month":
                from = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                label = "month";
                break;
            case "year":
                from = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                label = "year";
                break;
            default:
                from = now.Date;
                label = "today";
                break;
        }

        var query = db.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Paid && o.CreatedAt >= from);

        if (branchId.HasValue)
            query = query.Where(o => o.BranchId == branchId.Value);

        // Fetch raw order data then group in-memory (GroupBy + constructor
        // projections are not translatable by the Npgsql EF Core provider).
        var rawOrders = await query
            .Select(o => new { o.CreatedAt, o.Total })
            .ToListAsync(ct);

        List<SalesDataPointDto> dataPoints;

        if (label == "year")
        {
            dataPoints = rawOrders
                .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                .Select(g => new SalesDataPointDto(
                    new DateTime(g.Key.Year, g.Key.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                    g.Sum(o => o.Total),
                    g.Count()))
                .OrderBy(d => d.Date)
                .ToList();
        }
        else
        {
            dataPoints = rawOrders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new SalesDataPointDto(
                    g.Key,
                    g.Sum(o => o.Total),
                    g.Count()))
                .OrderBy(d => d.Date)
                .ToList();
        }

        var totalSales = dataPoints.Sum(d => d.TotalSales);
        var totalOrders = dataPoints.Sum(d => d.OrderCount);

        return new SalesChartDto(label, totalSales, totalOrders, dataPoints);
    }

    // ── Recent Orders ──────────────────────────────────────────────
    public async Task<IReadOnlyList<RecentOrderDto>> GetRecentOrdersAsync(
        int count = 10, Guid? branchId = null, CancellationToken ct = default)
    {
        var query = db.Orders
            .AsNoTracking()
            .Include(o => o.Branch)
            .Include(o => o.CreatedByUser)
            .Include(o => o.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(o => o.BranchId == branchId.Value);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .ToListAsync(ct);

        return orders.Select(o => new RecentOrderDto(
            o.Id,
            o.BranchId,
            o.Branch.DisplayName,
            o.CreatedByUser.Username,
            o.Total,
            o.Status.ToString(),
            o.PaymentMethod.ToString(),
            o.Items.Count,
            o.CreatedAt)).ToList();
    }

    // ── Top Selling Products ───────────────────────────────────────
    public async Task<IReadOnlyList<TopSellingProductDto>> GetTopSellingProductsAsync(
        int count = 10, int? days = 30, Guid? branchId = null, CancellationToken ct = default)
    {
        var query = db.OrderItems
            .AsNoTracking()
            .Include(i => i.Product)
                .ThenInclude(p => p.Category)
            .Include(i => i.Order)
            .Where(i => i.Order.Status == OrderStatus.Paid);

        if (days.HasValue)
        {
            var from = DateTime.UtcNow.AddDays(-days.Value);
            query = query.Where(i => i.Order.CreatedAt >= from);
        }

        if (branchId.HasValue)
            query = query.Where(i => i.Order.BranchId == branchId.Value);

        // Fetch raw data then aggregate in-memory (GroupBy with navigation
        // property access in key is not translatable by Npgsql).
        var rawItems = await query
            .Select(i => new
            {
                i.ProductId,
                ProductName = i.Product.Name,
                CategoryName = i.Product.Category.Name,
                i.Quantity,
                i.LineTotal
            })
            .ToListAsync(ct);

        var products = rawItems
            .GroupBy(i => new { i.ProductId, i.ProductName, i.CategoryName })
            .Select(g => new TopSellingProductDto(
                g.Key.ProductId,
                g.Key.ProductName,
                g.Key.CategoryName,
                g.Sum(i => i.Quantity),
                g.Sum(i => i.LineTotal)))
            .OrderByDescending(p => p.TotalRevenue)
            .Take(count)
            .ToList();

        return products;
    }

    // ── Branch Performance ─────────────────────────────────────────
    public async Task<IReadOnlyList<BranchPerformanceDto>> GetBranchPerformanceAsync(
        int? days = 30, CancellationToken ct = default)
    {
        var branches = await db.Branches
            .AsNoTracking()
            .Where(b => b.IsActive)
            .ToListAsync(ct);

        DateTime? from = days.HasValue ? DateTime.UtcNow.AddDays(-days.Value) : null;

        var result = new List<BranchPerformanceDto>();

        foreach (var branch in branches)
        {
            var ordersQuery = db.Orders
                .AsNoTracking()
                .Where(o => o.BranchId == branch.Id && o.Status == OrderStatus.Paid);

            if (from.HasValue)
                ordersQuery = ordersQuery.Where(o => o.CreatedAt >= from.Value);

            var totalSales = await ordersQuery.SumAsync(o => (decimal?)o.Total, ct) ?? 0m;
            var orderCount = await ordersQuery.CountAsync(ct);

            var employeeCount = await db.Employees
                .CountAsync(e => e.BranchId == branch.Id && e.IsActive, ct);

            var lowStockItems = await db.BranchStocks
                .CountAsync(s => s.BranchId == branch.Id && s.Quantity <= s.LowStockThreshold, ct);

            result.Add(new BranchPerformanceDto(
                branch.Id, branch.DisplayName,
                totalSales, orderCount,
                employeeCount, lowStockItems));
        }

        return result.OrderByDescending(b => b.TotalSales).ToList();
    }

    // ── Low Stock Alerts ───────────────────────────────────────────
    public async Task<IReadOnlyList<LowStockAlertDto>> GetLowStockAlertsAsync(
        Guid? branchId = null, CancellationToken ct = default)
    {
        var query = db.BranchStocks
            .AsNoTracking()
            .Include(s => s.Branch)
            .Include(s => s.Product)
            .Where(s => s.Quantity <= s.LowStockThreshold);

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        var alerts = await query
            .OrderBy(s => s.Quantity)
            .Take(50)
            .ToListAsync(ct);

        return alerts.Select(s => new LowStockAlertDto(
            s.Id, s.BranchId, s.Branch.DisplayName,
            s.ProductId, s.Product.Name,
            s.Quantity, s.LowStockThreshold)).ToList();
    }

    // ── Combined Overview ──────────────────────────────────────────
    public async Task<DashboardOverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var summary = await GetSummaryAsync(ct);
        var todaySales = await GetSalesChartAsync("today", ct: ct);
        var weeklySales = await GetSalesChartAsync("week", ct: ct);
        var monthlySales = await GetSalesChartAsync("month", ct: ct);
        var recentOrders = await GetRecentOrdersAsync(ct: ct);
        var topProducts = await GetTopSellingProductsAsync(ct: ct);
        var branchPerformance = await GetBranchPerformanceAsync(ct: ct);
        var lowStockAlerts = await GetLowStockAlertsAsync(ct: ct);

        return new DashboardOverviewDto(
            summary,
            todaySales, weeklySales, monthlySales,
            recentOrders, topProducts,
            branchPerformance, lowStockAlerts);
    }
}
