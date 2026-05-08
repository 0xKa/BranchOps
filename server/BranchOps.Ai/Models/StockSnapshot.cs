namespace BranchOps.Ai.Models;

/// <summary>
/// Per-branch on-hand stock snapshot for one product. Returned to the agent by inventory tools.
/// </summary>
public sealed record StockSnapshot(
    Guid BranchStockId,
    Guid BranchId,
    Guid ProductId,
    string ProductName,
    int Quantity,
    int LowStockThreshold)
{
    public bool IsLowStock => Quantity <= LowStockThreshold;
}
