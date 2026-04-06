using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class ReportsService(BranchOpsDbContext db)
{
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

        rows = [.. rows.OrderByDescending(r => r.Date)];

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

    public async Task<IReadOnlyList<BranchPerformanceDto>> GetSalesByBranchAsync(
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
