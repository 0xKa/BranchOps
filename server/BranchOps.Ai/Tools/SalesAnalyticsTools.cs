using System.ComponentModel;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;

namespace BranchOps.Ai.Tools;

public sealed class SalesAnalyticsTools(ISalesReadModel sales)
{
    private Guid? _branchId;

    public SalesAnalyticsTools BindBranch(Guid branchId)
    {
        _branchId = branchId;
        return this;
    }

    [Description("Get the top-selling products for the active branch over a recent lookback window.")]
    public Task<IReadOnlyList<TopProductRow>> GetTopProducts(
        [Description("Lookback window in days.")] int days = 30,
        [Description("Maximum number of products to return.")] int count = 10,
        CancellationToken ct = default)
        => sales.GetTopProductsAsync(GetBranchId(), ClampDays(days), ClampCount(count), ct);

    [Description("Calculate recent sales velocity for one product in the active branch.")]
    public Task<SalesVelocityRow> GetSalesVelocity(
        [Description("The product id to analyze.")] Guid productId,
        [Description("Lookback window in days.")] int days = 30,
        CancellationToken ct = default)
        => sales.GetSalesVelocityAsync(GetBranchId(), productId, ClampDays(days), ct);

    [Description("Estimate days of stock remaining for one product using current stock and recent sales velocity.")]
    public Task<DaysOfStockRow> GetDaysOfStock(
        [Description("The product id to analyze.")] Guid productId,
        [Description("Lookback window in days.")] int lookbackDays = 30,
        CancellationToken ct = default)
        => sales.GetDaysOfStockAsync(GetBranchId(), productId, ClampDays(lookbackDays), ct);

    private Guid GetBranchId()
        => _branchId ?? throw new InvalidOperationException("SalesAnalyticsTools must be bound to a branch before use.");

    private static int ClampDays(int days)
        => Math.Clamp(days, 1, 365);

    private static int ClampCount(int count)
        => Math.Clamp(count, 1, 50);
}
