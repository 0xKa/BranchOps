using System.ComponentModel;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;

namespace BranchOps.Ai.Tools;

public sealed class InventoryTools(IInventoryReadModel inventory)
{
    private Guid? _branchId;

    public InventoryTools BindBranch(Guid branchId)
    {
        _branchId = branchId;
        return this;
    }

    [Description("Get all products in the active branch where current stock is at or below the low-stock threshold.")]
    public Task<IReadOnlyList<StockSnapshot>> GetLowStockItems(CancellationToken ct = default)
        => inventory.GetLowStockAsync(GetBranchId(), ct);

    [Description("Get the current stock snapshot for one product in the active branch.")]
    public Task<StockSnapshot?> GetCurrentStock(
        [Description("The product id to inspect.")] Guid productId,
        CancellationToken ct = default)
        => inventory.GetCurrentStockAsync(GetBranchId(), productId, ct);

    [Description("List current stock rows for the active branch, capped by max.")]
    public Task<IReadOnlyList<StockSnapshot>> ListStockByBranch(
        [Description("Maximum number of rows to return.")] int max = 25,
        CancellationToken ct = default)
        => inventory.ListStockByBranchAsync(GetBranchId(), ClampMax(max), ct);

    private Guid GetBranchId()
        => _branchId ?? throw new InvalidOperationException("InventoryTools must be bound to a branch before use.");

    private static int ClampMax(int max)
        => Math.Clamp(max, 1, 100);
}
