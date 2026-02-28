using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class ReportsService(BranchOpsDbContext db)
{
    // ── Daily Sales ────────────────────────────────────────────────
    public async Task<DailySalesReportDto> GetDailySalesAsync(
        DateTime? fromDate = null, DateTime? toDate = null,
        Guid? branchId = null, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var from = DateTime.SpecifyKind(fromDate?.Date ?? now.Date.AddDays(-29), DateTimeKind.Utc);
        var to = DateTime.SpecifyKind((toDate?.Date ?? now.Date).AddDays(1), DateTimeKind.Utc); // inclusive end

        // Paid orders
        var paidQuery = db.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Paid
                        && o.CreatedAt >= from && o.CreatedAt < to);

        // Cancelled orders (for the cancelled count column)
        var cancelledQuery = db.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Cancelled
                        && o.CreatedAt >= from && o.CreatedAt < to);

        if (branchId.HasValue)
        {
            paidQuery = paidQuery.Where(o => o.BranchId == branchId.Value);
            cancelledQuery = cancelledQuery.Where(o => o.BranchId == branchId.Value);
        }

        // Fetch raw data then group in-memory (GroupBy is not translatable by Npgsql).
        var paidOrders = await paidQuery
            .Select(o => new { o.CreatedAt, o.Total, ItemCount = o.Items.Count })
            .ToListAsync(ct);

        var cancelledOrders = await cancelledQuery
            .Select(o => new { o.CreatedAt })
            .ToListAsync(ct);

        var cancelledByDate = cancelledOrders
            .GroupBy(o => o.CreatedAt.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var rows = paidOrders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g =>
            {
                var date = g.Key;
                var orderCount = g.Count();
                var totalSales = g.Sum(o => o.Total);
                var avgOrder = orderCount > 0 ? totalSales / orderCount : 0m;
                var totalItems = g.Sum(o => o.ItemCount);
                cancelledByDate.TryGetValue(date, out var cancelled);
                return new DailySalesRowDto(date, orderCount, totalSales,
                    Math.Round(avgOrder, 3), totalItems, cancelled);
            })
            .OrderByDescending(r => r.Date)
            .ToList();

        // Include dates that only have cancelled orders (no paid)
        foreach (var kvp in cancelledByDate)
        {
            if (!rows.Any(r => r.Date.Date == kvp.Key))
                rows.Add(new DailySalesRowDto(kvp.Key, 0, 0m, 0m, 0, kvp.Value));
        }

        rows = rows.OrderByDescending(r => r.Date).ToList();

        // Resolve branch name
        string? branchName = null;
        if (branchId.HasValue)
        {
            branchName = await db.Branches
                .Where(b => b.Id == branchId.Value)
                .Select(b => b.DisplayName)
                .FirstOrDefaultAsync(ct);
        }

        return new DailySalesReportDto(
            from, to.AddDays(-1),
            branchId, branchName,
            rows.Sum(r => r.TotalSales),
            rows.Sum(r => r.OrderCount),
            rows.Sum(r => r.TotalItemsSold),
            rows.Sum(r => r.CancelledOrders),
            rows);
    }

    // ── Sales by Branch ────────────────────────────────────────────
    public async Task<IReadOnlyList<BranchPerformanceDto>> GetSalesByBranchAsync(
        int? days = 30, CancellationToken ct = default, Guid? branchId = null)
    {
        var branchesQuery = db.Branches
            .AsNoTracking()
            .Where(b => b.IsActive);

        if (branchId.HasValue)
            branchesQuery = branchesQuery.Where(b => b.Id == branchId.Value);

        var branches = await branchesQuery.ToListAsync(ct);

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

    // ── Top Products ───────────────────────────────────────────────
    public async Task<IReadOnlyList<TopSellingProductDto>> GetTopProductsAsync(
        int count = 10, int? days = 30, Guid? branchId = null,
        CancellationToken ct = default)
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
}
