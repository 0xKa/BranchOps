namespace BranchOps.Ai.Models;

public sealed record BranchOpsAgentBranchInfo(
    Guid Id,
    string DisplayName,
    string? City,
    bool IsActive);

public sealed record BranchOpsAgentScopeInfo(
    Guid? BranchId,
    string BranchScope);

public sealed record BranchOpsAgentDashboardSummary(
    BranchOpsAgentScopeInfo Scope,
    DateTime AsOfUtc,
    decimal TotalSales,
    decimal TotalSalesToday,
    int TotalOrders,
    int TotalOrdersToday,
    int TotalBranches,
    int ActiveBranches,
    int TotalProducts,
    int ActiveProducts,
    int TotalEmployees,
    int TotalCategories);

public sealed record BranchOpsAgentSalesDataPoint(
    DateTime Date,
    decimal TotalSales,
    int OrderCount);

public sealed record BranchOpsAgentSalesChart(
    BranchOpsAgentScopeInfo Scope,
    string Period,
    DateTime FromUtc,
    DateTime ToUtc,
    decimal TotalSales,
    int TotalOrders,
    IReadOnlyList<BranchOpsAgentSalesDataPoint> DataPoints);

public sealed record BranchOpsAgentDailySalesReport(
    BranchOpsAgentScopeInfo Scope,
    DateTime FromDate,
    DateTime ToDate,
    decimal GrandTotalSales,
    int GrandTotalOrders,
    int GrandTotalItemsSold,
    int GrandTotalCancelled,
    IReadOnlyList<BranchOpsAgentDailySalesRow> Rows);

public sealed record BranchOpsAgentDailySalesRow(
    DateTime Date,
    int OrderCount,
    decimal TotalSales,
    decimal AverageOrderValue,
    int TotalItemsSold,
    int CancelledOrders);

public sealed record BranchOpsAgentTopProductRow(
    Guid ProductId,
    string ProductName,
    string CategoryName,
    int TotalQuantitySold,
    decimal TotalRevenue);

public sealed record BranchOpsAgentTopProductsReport(
    BranchOpsAgentScopeInfo Scope,
    int Days,
    DateTime FromUtc,
    DateTime ToUtc,
    IReadOnlyList<BranchOpsAgentTopProductRow> Rows);

public sealed record BranchOpsAgentBranchPerformanceRow(
    Guid BranchId,
    string BranchName,
    decimal TotalSales,
    int OrderCount,
    int EmployeeCount,
    int LowStockItems);

public sealed record BranchOpsAgentBranchPerformanceReport(
    BranchOpsAgentScopeInfo Scope,
    int Days,
    DateTime FromUtc,
    DateTime ToUtc,
    IReadOnlyList<BranchOpsAgentBranchPerformanceRow> Rows);

public sealed record BranchOpsAgentLowStockAlert(
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    int Quantity,
    int LowStockThreshold);

public sealed record BranchOpsAgentLowStockReport(
    BranchOpsAgentScopeInfo Scope,
    DateTime AsOfUtc,
    IReadOnlyList<BranchOpsAgentLowStockAlert> Rows);

public sealed record BranchOpsAgentRecentOrder(
    Guid Id,
    Guid BranchId,
    string BranchName,
    string CreatedByUserName,
    decimal Total,
    string Status,
    string PaymentMethod,
    int ItemCount,
    DateTime CreatedAt);

public sealed record BranchOpsAgentRecentOrdersReport(
    BranchOpsAgentScopeInfo Scope,
    DateTime AsOfUtc,
    IReadOnlyList<BranchOpsAgentRecentOrder> Rows);
