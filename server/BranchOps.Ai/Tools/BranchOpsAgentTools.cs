using System.ComponentModel;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Configuration;
using BranchOps.Ai.Models;
using Microsoft.Extensions.Options;

namespace BranchOps.Ai.Tools;

public sealed class BranchOpsAgentTools(
    IBranchOpsAgentReadModel readModel,
    IOptions<AiOptions> options)
{
    private Guid? _branchId;
    private string _branchScope = "All accessible branches";

    public BranchOpsAgentTools BindScope(Guid? branchId, string branchScope)
    {
        _branchId = branchId;
        _branchScope = string.IsNullOrWhiteSpace(branchScope) ? "All accessible branches" : branchScope;
        return this;
    }

    [Description("Return the active branch scope the assistant must use and mention in answers.")]
    public BranchOpsAgentScopeInfo GetCurrentBranchScope()
        => new(_branchId, _branchScope);

    [Description("List branches visible in the current request scope.")]
    public Task<IReadOnlyList<BranchOpsAgentBranchInfo>> ListAccessibleBranches(
        [Description("Maximum rows to return.")] int max = 10,
        CancellationToken ct = default)
        => readModel.ListBranchesAsync(_branchId, ClampRows(max), ct);

    [Description("Get high-level dashboard metrics for the current branch scope.")]
    public Task<BranchOpsAgentDashboardSummary> GetDashboardSummary(CancellationToken ct = default)
        => readModel.GetDashboardSummaryAsync(_branchId, ct);

    [Description("Get sales totals and order counts grouped for today, week, month, or year in the current branch scope.")]
    public Task<BranchOpsAgentSalesChart> GetSalesChart(
        [Description("Allowed values: today, week, month, year.")] string period = "month",
        CancellationToken ct = default)
        => readModel.GetSalesChartAsync(period, _branchId, ct);

    [Description("Get daily sales rows for an explicit date range in the current branch scope.")]
    public Task<BranchOpsAgentDailySalesReport> GetDailySales(
        [Description("Inclusive start date, yyyy-MM-dd.")] DateTime fromDate,
        [Description("Inclusive end date, yyyy-MM-dd.")] DateTime toDate,
        CancellationToken ct = default)
        => readModel.GetDailySalesAsync(fromDate, toDate, _branchId, MaxTableRows, ct);

    [Description("Get top-selling products by quantity and revenue for the current branch scope.")]
    public Task<BranchOpsAgentTopProductsReport> GetTopProducts(
        [Description("Maximum product rows to return.")] int count = 10,
        [Description("Lookback window in days.")] int days = 30,
        CancellationToken ct = default)
        => readModel.GetTopProductsAsync(ClampRows(count), ClampDays(days), _branchId, ct);

    [Description("Compare sales performance by branch. If scoped to one branch, returns that branch only.")]
    public Task<BranchOpsAgentBranchPerformanceReport> GetSalesByBranch(
        [Description("Lookback window in days.")] int days = 30,
        CancellationToken ct = default)
        => readModel.GetSalesByBranchAsync(ClampDays(days), _branchId, MaxTableRows, ct);

    [Description("Get products currently at or below low-stock threshold for the current branch scope.")]
    public Task<BranchOpsAgentLowStockReport> GetLowStockAlerts(CancellationToken ct = default)
        => readModel.GetLowStockAlertsAsync(_branchId, MaxTableRows, ct);

    [Description("Get recent orders for the current branch scope.")]
    public Task<BranchOpsAgentRecentOrdersReport> GetRecentOrders(
        [Description("Maximum orders to return.")] int count = 10,
        CancellationToken ct = default)
        => readModel.GetRecentOrdersAsync(ClampRows(count), _branchId, ct);

    private int MaxTableRows => Math.Clamp(options.Value.BranchOpsAgent.MaxTableRows, 1, 50);

    private int ClampRows(int count)
        => Math.Clamp(count, 1, MaxTableRows);

    private static int ClampDays(int days)
        => Math.Clamp(days, 1, 365);
}
