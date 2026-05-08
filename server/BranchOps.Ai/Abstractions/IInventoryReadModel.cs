using BranchOps.Ai.Models;

namespace BranchOps.Ai.Abstractions;

/// <summary>
/// Read-only inventory access used by InventoryTools. Implemented in BranchOps.Api/Ai/Adapters/
/// against the existing StockService/DbContext, so branch scoping enforced by the
/// adapter layer is the single source of truth.
/// </summary>
public interface IInventoryReadModel
{
    Task<IReadOnlyList<StockSnapshot>> GetLowStockAsync(Guid branchId, CancellationToken ct);

    Task<StockSnapshot?> GetCurrentStockAsync(Guid branchId, Guid productId, CancellationToken ct);

    Task<IReadOnlyList<StockSnapshot>> ListStockByBranchAsync(Guid branchId, int max, CancellationToken ct);
}
