namespace BranchOps.Ai.Models;

public sealed record AskBranchInfo(
    Guid Id,
    string DisplayName,
    string? City,
    bool IsActive);

public sealed record AskScopeInfo(
    Guid? BranchId,
    string BranchScope);

public sealed record AskDashboardSummary(
    AskScopeInfo Scope,
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

public sealed record AskSalesDataPoint(
    DateTime Date,
    decimal TotalSales,
    int OrderCount);

public sealed record AskSalesChart(
    AskScopeInfo Scope,
    string Period,
    DateTime FromUtc,
    DateTime ToUtc,
    decimal TotalSales,
    int TotalOrders,
    IReadOnlyList<AskSalesDataPoint> DataPoints);

public sealed record AskDailySalesReport(
    AskScopeInfo Scope,
    DateTime FromDate,
    DateTime ToDate,
    decimal GrandTotalSales,
    int GrandTotalOrders,
    int GrandTotalItemsSold,
    int GrandTotalCancelled,
    IReadOnlyList<AskDailySalesRow> Rows);

public sealed record AskDailySalesRow(
    DateTime Date,
    int OrderCount,
    decimal TotalSales,
    decimal AverageOrderValue,
    int TotalItemsSold,
    int CancelledOrders);

public sealed record AskTopProductRow(
    Guid ProductId,
    string ProductName,
    string CategoryName,
    int TotalQuantitySold,
    decimal TotalRevenue);

public sealed record AskTopProductsReport(
    AskScopeInfo Scope,
    int Days,
    DateTime FromUtc,
    DateTime ToUtc,
    IReadOnlyList<AskTopProductRow> Rows);

public sealed record AskBranchPerformanceRow(
    Guid BranchId,
    string BranchName,
    decimal TotalSales,
    int OrderCount,
    int EmployeeCount,
    int LowStockItems);

public sealed record AskBranchPerformanceReport(
    AskScopeInfo Scope,
    int Days,
    DateTime FromUtc,
    DateTime ToUtc,
    IReadOnlyList<AskBranchPerformanceRow> Rows);

public sealed record AskLowStockAlert(
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    int Quantity,
    int LowStockThreshold);

public sealed record AskLowStockReport(
    AskScopeInfo Scope,
    DateTime AsOfUtc,
    IReadOnlyList<AskLowStockAlert> Rows);

public sealed record AskRecentOrder(
    Guid Id,
    Guid BranchId,
    string BranchName,
    string CreatedByUserName,
    decimal Total,
    string Status,
    string PaymentMethod,
    int ItemCount,
    DateTime CreatedAt);

public sealed record AskRecentOrdersReport(
    AskScopeInfo Scope,
    DateTime AsOfUtc,
    IReadOnlyList<AskRecentOrder> Rows);
