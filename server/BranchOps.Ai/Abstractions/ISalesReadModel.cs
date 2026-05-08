using BranchOps.Ai.Models;

namespace BranchOps.Ai.Abstractions;

/// <summary>
/// Sales-side analytics the replenishment agent needs:
///   - "what sells well" (top products),
///   - "how fast does this product move" (velocity per day),
///   - "how long will current stock last" (days of stock).
///
/// The first method maps to ReportsService; the latter two are derived
/// computations the adapter performs from Order/OrderItem + BranchStock data.
/// </summary>
public interface ISalesReadModel
{
    Task<IReadOnlyList<TopProductRow>> GetTopProductsAsync(
        Guid branchId, int days, int count, CancellationToken ct);

    Task<SalesVelocityRow> GetSalesVelocityAsync(
        Guid branchId, Guid productId, int days, CancellationToken ct);

    Task<DaysOfStockRow> GetDaysOfStockAsync(
        Guid branchId, Guid productId, int lookbackDays, CancellationToken ct);
}
