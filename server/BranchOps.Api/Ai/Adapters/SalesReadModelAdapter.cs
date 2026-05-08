using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;
using BranchOps.Api.Data;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Ai.Adapters;

public sealed class SalesReadModelAdapter(
    ReportsService reports,
    BranchOpsDbContext db) : ISalesReadModel
{
    public async Task<IReadOnlyList<TopProductRow>> GetTopProductsAsync(
        Guid branchId,
        int days,
        int count,
        CancellationToken ct)
    {
        var rows = await reports.GetTopProductsAsync(count, days, branchId, ct);
        return rows
            .Select(row => new TopProductRow(
                row.ProductId,
                row.ProductName,
                row.TotalQuantitySold,
                row.TotalRevenue))
            .ToList();
    }

    public async Task<SalesVelocityRow> GetSalesVelocityAsync(
        Guid branchId,
        Guid productId,
        int days,
        CancellationToken ct)
    {
        var totalUnits = await GetUnitsSoldAsync(branchId, productId, days, ct);
        return new SalesVelocityRow(
            productId,
            days,
            totalUnits,
            days <= 0 ? 0 : totalUnits / (double)days);
    }

    public async Task<DaysOfStockRow> GetDaysOfStockAsync(
        Guid branchId,
        Guid productId,
        int lookbackDays,
        CancellationToken ct)
    {
        var velocity = await GetSalesVelocityAsync(branchId, productId, lookbackDays, ct);
        var currentStock = await db.BranchStocks
            .AsNoTracking()
            .Where(s => s.BranchId == branchId && s.ProductId == productId)
            .Select(s => s.Quantity)
            .FirstOrDefaultAsync(ct);

        var daysOfStock = velocity.AverageUnitsPerDay > 0
            ? currentStock / velocity.AverageUnitsPerDay
            : (double?)null;

        return new DaysOfStockRow(
            productId,
            currentStock,
            velocity.AverageUnitsPerDay,
            daysOfStock);
    }

    private async Task<int> GetUnitsSoldAsync(Guid branchId, Guid productId, int days, CancellationToken ct)
    {
        var from = DateTime.UtcNow.AddDays(-days);

        return await db.OrderItems
            .AsNoTracking()
            .Where(item =>
                item.ProductId == productId &&
                item.Order.BranchId == branchId &&
                item.Order.Status == OrderStatus.Paid &&
                item.Order.CreatedAt >= from)
            .SumAsync(item => (int?)item.Quantity, ct) ?? 0;
    }
}
