using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class DashboardService(BranchOpsDbContext db)
{
    // ── Summary ────────────────────────────────────────────────────
    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default, Guid? branchId = null)
    {
        var todayUtc = DateTime.UtcNow.Date;

        var ordersQuery = db.Orders.AsQueryable();
        if (branchId.HasValue)
            ordersQuery = ordersQuery.Where(o => o.BranchId == branchId.Value);

        var totalSales = await ordersQuery
            .Where(o => o.Status == OrderStatus.Paid)
            .SumAsync(o => (decimal?)o.Total, ct) ?? 0m;

        var totalSalesToday = await ordersQuery
            .Where(o => o.Status == OrderStatus.Paid && o.CreatedAt >= todayUtc)
            .SumAsync(o => (decimal?)o.Total, ct) ?? 0m;

        var totalOrders = await ordersQuery.CountAsync(ct);
        var totalOrdersToday = await ordersQuery.CountAsync(o => o.CreatedAt >= todayUtc, ct);

        int totalBranches, activeBranches;
        if (branchId.HasValue)
        {
            totalBranches = await db.Branches.CountAsync(b => b.Id == branchId.Value, ct);
            activeBranches = await db.Branches.CountAsync(b => b.Id == branchId.Value && b.IsActive, ct);
        }
        else
        {
            totalBranches = await db.Branches.CountAsync(ct);
            activeBranches = await db.Branches.CountAsync(b => b.IsActive, ct);
        }

        var totalProducts = await db.Products.CountAsync(ct);
        var activeProducts = await db.Products.CountAsync(p => p.IsActive, ct);

        var employeesQuery = db.Employees.Where(e => e.IsActive);
        if (branchId.HasValue)
            employeesQuery = employeesQuery.Where(e => e.BranchId == branchId.Value);
        var totalEmployees = await employeesQuery.CountAsync(ct);

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

        // Fetch only date and total for grouping in-memory (GroupBy + constructor
        // projections are not translatable by the Npgsql EF Core provider).
        // Use OrderBy + date projection to keep the result set small.
        var rawOrders = await query
            .Select(o => new { Date = o.CreatedAt.Date, o.Total })
            .ToListAsync(ct);

        List<SalesDataPointDto> dataPoints;

        if (label == "year")
        {
            dataPoints = [.. rawOrders
                .GroupBy(o => new { o.Date.Year, o.Date.Month })
                .Select(g => new SalesDataPointDto(
                    new DateTime(g.Key.Year, g.Key.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                    g.Sum(o => o.Total),
                    g.Count()))
                .OrderBy(d => d.Date)];
        }
        else
        {
            dataPoints = [.. rawOrders
                .GroupBy(o => o.Date)
                .Select(g => new SalesDataPointDto(
                    g.Key,
                    g.Sum(o => o.Total),
                    g.Count()))
                .OrderBy(d => d.Date)];
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

        return [.. orders.Select(o => new RecentOrderDto(
            o.Id,
            o.BranchId,
            o.Branch?.DisplayName ?? string.Empty,
            o.CreatedByUser?.Username ?? string.Empty,
            o.Total,
            o.Status.ToString(),
            o.PaymentMethod.ToString(),
            o.Items.Count,
            o.CreatedAt))];
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
        int? days = 30, CancellationToken ct = default, Guid? branchId = null)
    {
        var branchesQuery = db.Branches
            .AsNoTracking()
            .Where(b => b.IsActive);

        if (branchId.HasValue)
            branchesQuery = branchesQuery.Where(b => b.Id == branchId.Value);

        var branches = await branchesQuery.ToListAsync(ct);
        var branchIds = branches.Select(b => b.Id).ToList();

        DateTime? from = days.HasValue ? DateTime.UtcNow.AddDays(-days.Value) : null;

        // Batch: sales aggregation per branch
        var ordersQuery = db.Orders.AsNoTracking()
            .Where(o => branchIds.Contains(o.BranchId) && o.Status == OrderStatus.Paid);
        if (from.HasValue)
            ordersQuery = ordersQuery.Where(o => o.CreatedAt >= from.Value);

        var salesByBranch = await ordersQuery
            .GroupBy(o => o.BranchId)
            .Select(g => new { BranchId = g.Key, TotalSales = g.Sum(o => o.Total), OrderCount = g.Count() })
            .ToDictionaryAsync(x => x.BranchId, ct);

        // Batch: employee counts per branch
        var employeeCounts = await db.Employees
            .Where(e => branchIds.Contains(e.BranchId) && e.IsActive)
            .GroupBy(e => e.BranchId)
            .Select(g => new { BranchId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.BranchId, x => x.Count, ct);

        // Batch: low stock counts per branch
        var lowStockCounts = await db.BranchStocks
            .Where(s => branchIds.Contains(s.BranchId) && s.Quantity <= s.LowStockThreshold)
            .GroupBy(s => s.BranchId)
            .Select(g => new { BranchId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.BranchId, x => x.Count, ct);

        var result = branches.Select(branch =>
        {
            salesByBranch.TryGetValue(branch.Id, out var sales);
            employeeCounts.TryGetValue(branch.Id, out var empCount);
            lowStockCounts.TryGetValue(branch.Id, out var lowStock);

            return new BranchPerformanceDto(
                branch.Id, branch.DisplayName,
                sales?.TotalSales ?? 0m, sales?.OrderCount ?? 0,
                empCount, lowStock);
        }).ToList();

        return [.. result.OrderByDescending(b => b.TotalSales)];
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

        return [.. alerts.Select(s => new LowStockAlertDto(
            s.Id, s.BranchId, s.Branch.DisplayName,
            s.ProductId, s.Product.Name,
            s.Quantity, s.LowStockThreshold))];
    }

    // ── Combined Overview ──────────────────────────────────────────
    public async Task<DashboardOverviewDto> GetOverviewAsync(CancellationToken ct = default, Guid? branchId = null)
    {
        var summary = await GetSummaryAsync(ct, branchId);
        var todaySales = await GetSalesChartAsync("today", branchId, ct);
        var weeklySales = await GetSalesChartAsync("week", branchId, ct);
        var monthlySales = await GetSalesChartAsync("month", branchId, ct);
        var recentOrders = await GetRecentOrdersAsync(ct: ct, branchId: branchId);
        var topProducts = await GetTopSellingProductsAsync(ct: ct, branchId: branchId);
        var branchPerformance = await GetBranchPerformanceAsync(ct: ct, branchId: branchId);
        var lowStockAlerts = await GetLowStockAlertsAsync(branchId, ct);

        return new DashboardOverviewDto(
            summary,
            todaySales, weeklySales, monthlySales,
            recentOrders, topProducts,
            branchPerformance, lowStockAlerts);
    }


}
