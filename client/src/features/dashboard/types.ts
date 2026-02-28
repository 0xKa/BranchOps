// ── Summary ────────────────────────────────────────────────────
export interface DashboardSummary {
    totalSales: number;
    totalSalesToday: number;
    totalOrders: number;
    totalOrdersToday: number;
    totalBranches: number;
    activeBranches: number;
    totalProducts: number;
    activeProducts: number;
    totalEmployees: number;
    totalCategories: number;
}

// ── Sales Chart ────────────────────────────────────────────────
export interface SalesDataPoint {
    date: string;
    totalSales: number;
    orderCount: number;
}

export interface SalesChart {
    period: string;
    totalSales: number;
    totalOrders: number;
    dataPoints: SalesDataPoint[];
}

// ── Recent Orders ──────────────────────────────────────────────
export interface RecentOrder {
    id: string;
    branchId: string;
    branchName: string;
    createdByUserName: string;
    total: number;
    status: string;
    paymentMethod: string;
    itemCount: number;
    createdAt: string;
}

// ── Top Selling Products ───────────────────────────────────────
export interface TopSellingProduct {
    productId: string;
    productName: string;
    categoryName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}

// ── Branch Performance ─────────────────────────────────────────
export interface BranchPerformance {
    branchId: string;
    branchName: string;
    totalSales: number;
    orderCount: number;
    employeeCount: number;
    lowStockItems: number;
}

// ── Low Stock Alerts ───────────────────────────────────────────
export interface LowStockAlert {
    branchStockId: string;
    branchId: string;
    branchName: string;
    productId: string;
    productName: string;
    quantity: number;
    lowStockThreshold: number;
}

// ── Combined Overview ──────────────────────────────────────────
export interface DashboardOverview {
    summary: DashboardSummary;
    todaySales: SalesChart;
    weeklySales: SalesChart;
    monthlySales: SalesChart;
    recentOrders: RecentOrder[];
    topProducts: TopSellingProduct[];
    branchPerformance: BranchPerformance[];
    lowStockAlerts: LowStockAlert[];
}
