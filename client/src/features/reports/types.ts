export interface DailySalesRow {
    date: string;
    orderCount: number;
    totalSales: number;
    averageOrderValue: number;
    totalItemsSold: number;
    cancelledOrders: number;
}

export interface DailySalesReport {
    fromDate: string;
    toDate: string;
    branchId: string | null;
    branchName: string | null;
    grandTotalSales: number;
    grandTotalOrders: number;
    grandTotalItemsSold: number;
    grandTotalCancelled: number;
    rows: DailySalesRow[];
}

export interface BranchSalesRow {
    branchId: string;
    branchName: string;
    totalSales: number;
    orderCount: number;
    employeeCount: number;
    lowStockItems: number;
}

export interface TopProductRow {
    productId: string;
    productName: string;
    categoryName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}
