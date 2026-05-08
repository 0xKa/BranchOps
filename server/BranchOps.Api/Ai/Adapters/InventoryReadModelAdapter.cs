using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;
using BranchOps.Api.Dtos;
using BranchOps.Api.Services;

namespace BranchOps.Api.Ai.Adapters;

public sealed class InventoryReadModelAdapter(StockService stock) : IInventoryReadModel
{
    public async Task<IReadOnlyList<StockSnapshot>> GetLowStockAsync(Guid branchId, CancellationToken ct)
    {
        var rows = await stock.GetLowStockAlertsAsync(branchId, ct);
        return rows.Select(Map).ToList();
    }

    public async Task<StockSnapshot?> GetCurrentStockAsync(Guid branchId, Guid productId, CancellationToken ct)
    {
        var row = await stock.GetByBranchAndProductAsync(branchId, productId, ct);
        return row is null ? null : Map(row);
    }

    public async Task<IReadOnlyList<StockSnapshot>> ListStockByBranchAsync(Guid branchId, int max, CancellationToken ct)
    {
        var rows = await stock.GetAllAsync(
            new PaginationQuery { Page = 1, PageSize = max },
            branchId: branchId,
            cancellationToken: ct);

        return rows.Items.Select(Map).ToList();
    }

    private static StockSnapshot Map(BranchOps.Domain.BranchStock stock)
        => new(
            stock.Id,
            stock.BranchId,
            stock.ProductId,
            stock.Product.Name,
            stock.Quantity,
            stock.LowStockThreshold);
}
