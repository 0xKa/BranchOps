export interface Product {
    id: string;
    name: string;
    categoryId: string;
    categoryName: string;
    price: number;
    cost: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    isActive: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}
