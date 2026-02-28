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
