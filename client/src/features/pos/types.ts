import type { PagedResult } from "@/features/products/types";

export const ORDER_STATUS = {
    Paid: 1,
    Cancelled: 2,
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<number, string> = {
    [ORDER_STATUS.Paid]: "Paid",
    [ORDER_STATUS.Cancelled]: "Cancelled",
};

export const PAYMENT_METHOD = {
    Cash: 1,
    Card: 2,
    Mixed: 3,
} as const;

export type PaymentMethod =
    (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_LABELS: Record<number, string> = {
    [PAYMENT_METHOD.Cash]: "Cash",
    [PAYMENT_METHOD.Card]: "Card",
    [PAYMENT_METHOD.Mixed]: "Mixed",
};

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    id: string;
    branchId: string;
    branchName: string;
    createdByUserId: string;
    createdByUserName: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    paidAtUtc: string | null;
    cancelledByUserId: string | null;
    cancelledByUserName: string | null;
    notes: string | null;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderSummary {
    id: string;
    branchId: string;
    branchName: string;
    status: OrderStatus;
    total: number;
    paymentMethod: PaymentMethod;
    itemCount: number;
    createdAt: string;
}

export interface PlaceOrderRequest {
    branchId: string;
    items: { productId: string; quantity: number }[];
    discount: number;
    tax: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes?: string | null;
}

export type OrdersPagedResult = PagedResult<OrderSummary>;

/** Represents a product added to the POS cart (client-side only) */
export interface CartItem {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}
