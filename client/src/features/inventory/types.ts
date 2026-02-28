export type { PagedResult } from "../products/types";

export interface BranchStock {
    id: string;
    branchId: string;
    branchName: string;
    productId: string;
    productName: string;
    quantity: number;
    lowStockThreshold: number;
    isLowStock: boolean;
    createdAt: string;
    updatedAt: string;
}

export const STOCK_ADJUSTMENT_TYPE = {
    1: "Restock",
    2: "Sale",
    3: "Return",
    4: "Damage",
    5: "Manual Adjustment",
    6: "Transfer",
} as const;

export type StockAdjustmentType = keyof typeof STOCK_ADJUSTMENT_TYPE;

export interface StockAdjustment {
    id: string;
    branchStockId: string;
    branchId: string;
    branchName: string;
    productId: string;
    productName: string;
    type: StockAdjustmentType;
    quantityChange: number;
    quantityAfter: number;
    performedByUserId: string | null;
    performedByUserName: string | null;
    notes: string | null;
    createdAt: string;
}

export interface LowStockAlert {
    branchStockId: string;
    branchId: string;
    branchName: string;
    productId: string;
    productName: string;
    quantity: number;
    lowStockThreshold: number;
}

export interface SetStockRequest {
    branchId: string;
    productId: string;
    quantity: number;
    lowStockThreshold: number;
}

export interface AdjustStockRequest {
    branchId: string;
    productId: string;
    type: StockAdjustmentType;
    quantityChange: number;
    notes?: string;
}

export interface UpdateThresholdRequest {
    lowStockThreshold: number;
}
