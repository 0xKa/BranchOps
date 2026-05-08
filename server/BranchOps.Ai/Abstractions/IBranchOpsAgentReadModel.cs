using BranchOps.Ai.Models;

namespace BranchOps.Ai.Abstractions;

public interface IBranchOpsAgentReadModel
{
    Task<BranchOpsAgentBranchInfo?> GetBranchAsync(Guid branchId, CancellationToken ct);
    Task<IReadOnlyList<BranchOpsAgentBranchInfo>> ListBranchesAsync(Guid? branchId, int max, CancellationToken ct);
    Task<BranchOpsAgentDashboardSummary> GetDashboardSummaryAsync(Guid? branchId, CancellationToken ct);
    Task<BranchOpsAgentSalesChart> GetSalesChartAsync(string period, Guid? branchId, CancellationToken ct);
    Task<BranchOpsAgentDailySalesReport> GetDailySalesAsync(DateTime fromDate, DateTime toDate, Guid? branchId, int maxRows, CancellationToken ct);
    Task<BranchOpsAgentTopProductsReport> GetTopProductsAsync(int count, int days, Guid? branchId, CancellationToken ct);
    Task<BranchOpsAgentBranchPerformanceReport> GetSalesByBranchAsync(int days, Guid? branchId, int maxRows, CancellationToken ct);
    Task<BranchOpsAgentLowStockReport> GetLowStockAlertsAsync(Guid? branchId, int maxRows, CancellationToken ct);
    Task<BranchOpsAgentRecentOrdersReport> GetRecentOrdersAsync(int count, Guid? branchId, CancellationToken ct);
}
