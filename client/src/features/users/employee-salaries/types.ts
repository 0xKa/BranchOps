export interface EmployeeSalary {
    id: string;
    employeeId: string;
    employeeName: string;
    amount: number;
    currency: string;
    effectiveFrom: string;
    effectiveTo: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeSalaryCreateRequest {
    employeeId: string;
    amount: number;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    notes?: string | null;
}

export interface EmployeeSalaryUpdateRequest {
    employeeId: string;
    amount: number;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    notes?: string | null;
}
