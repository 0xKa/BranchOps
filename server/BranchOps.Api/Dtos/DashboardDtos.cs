namespace BranchOps.Api.Dtos;

// ── Summary ────────────────────────────────────────────────────────
public record DashboardSummaryDto(
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

// ── Sales Chart ────────────────────────────────────────────────────
public record SalesDataPointDto(
    DateTime Date,
    decimal TotalSales,
    int OrderCount);

public record SalesChartDto(
    string Period,
    decimal TotalSales,
    int TotalOrders,
    IReadOnlyList<SalesDataPointDto> DataPoints);

// ── Recent Orders ──────────────────────────────────────────────────
public record RecentOrderDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    string CreatedByUserName,
    decimal Total,
    string Status,
    string PaymentMethod,
    int ItemCount,
    DateTime CreatedAt);

// ── Top Selling Products ───────────────────────────────────────────
public record TopSellingProductDto(
    Guid ProductId,
    string ProductName,
    string CategoryName,
    int TotalQuantitySold,
    decimal TotalRevenue);

// ── Branch Performance ─────────────────────────────────────────────
public record BranchPerformanceDto(
    Guid BranchId,
    string BranchName,
    decimal TotalSales,
    int OrderCount,
    int EmployeeCount,
    int LowStockItems);

// ── Combined Overview (initial load) ───────────────────────────
// NOTE: LowStockAlertDto is defined in StockDtos.cs and reused here.
public record DashboardOverviewDto(
    DashboardSummaryDto Summary,
    SalesChartDto TodaySales,
    SalesChartDto WeeklySales,
    SalesChartDto MonthlySales,
    IReadOnlyList<RecentOrderDto> RecentOrders,
    IReadOnlyList<TopSellingProductDto> TopProducts,
    IReadOnlyList<BranchPerformanceDto> BranchPerformance,
    IReadOnlyList<LowStockAlertDto> LowStockAlerts);
