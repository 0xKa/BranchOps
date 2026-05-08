using BranchOps.Ai.Models;

namespace BranchOps.Ai.Abstractions;

public interface IAskBranchOpsReadModel
{
    Task<AskBranchInfo?> GetBranchAsync(Guid branchId, CancellationToken ct);
    Task<IReadOnlyList<AskBranchInfo>> ListBranchesAsync(Guid? branchId, int max, CancellationToken ct);
    Task<AskDashboardSummary> GetDashboardSummaryAsync(Guid? branchId, CancellationToken ct);
    Task<AskSalesChart> GetSalesChartAsync(string period, Guid? branchId, CancellationToken ct);
    Task<AskDailySalesReport> GetDailySalesAsync(DateTime fromDate, DateTime toDate, Guid? branchId, int maxRows, CancellationToken ct);
    Task<AskTopProductsReport> GetTopProductsAsync(int count, int days, Guid? branchId, CancellationToken ct);
    Task<AskBranchPerformanceReport> GetSalesByBranchAsync(int days, Guid? branchId, int maxRows, CancellationToken ct);
    Task<AskLowStockReport> GetLowStockAlertsAsync(Guid? branchId, int maxRows, CancellationToken ct);
    Task<AskRecentOrdersReport> GetRecentOrdersAsync(int count, Guid? branchId, CancellationToken ct);
}
