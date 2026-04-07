import DeleteConfirmDialog from "@/components/shared/delete-confirm-dialog";
import { UserCardTrigger } from "@/components/shared/user-card-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/features/users/employee/hooks";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import CreateSalaryDialog from "./components/create-salary-dialog";
import EditSalaryDialog from "./components/edit-salary-dialog";
import {
    useCreateSalary,
    useDeleteSalary,
    useSalaries,
    useUpdateSalary,
} from "./hooks";
import type { EmployeeSalary } from "./types";

export default function EmployeeSalariesPage() {
    const { data: salaries, isLoading } = useSalaries();
    const { data: employees } = useEmployees();
    const createMutation = useCreateSalary();
    const updateMutation = useUpdateSalary();
    const deleteMutation = useDeleteSalary();

    const [createOpen, setCreateOpen] = useState(false);
    const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(null);
    const [deletingSalary, setDeletingSalary] = useState<EmployeeSalary | null>(null);

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);

    const isActive = (salary: EmployeeSalary) => {
        const now = new Date();
        const from = new Date(salary.effectiveFrom);
        const to = salary.effectiveTo ? new Date(salary.effectiveTo) : null;
        return from <= now && (!to || to >= now);
    };

    return (
        <PageContainer>
            <PageHeader title="Employee Salaries" description="Manage employee salary records">
                <Button className="neon-glow" onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4 me-2" />
                    Add Salary
                </Button>
            </PageHeader>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Effective From</TableHead>
                                <TableHead>Effective To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salaries && salaries.length > 0 ? (
                                salaries.map((salary) => (
                                    <TableRow key={salary.id}>
                                        <TableCell className="font-medium">
                                            {salary.employeeName}
                                        </TableCell>
                                        <TableCell>{formatCurrency(salary.amount, salary.currency)}</TableCell>
                                        <TableCell>{salary.currency}</TableCell>
                                        <TableCell>
                                            {new Date(salary.effectiveFrom).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {salary.effectiveTo
                                                ? new Date(salary.effectiveTo).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={isActive(salary) ? "default" : "secondary"}>
                                                {isActive(salary) ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-50 truncate">
                                            {salary.notes ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {(() => {
                                                    const emp = employees?.find((e) => e.id === salary.employeeId);
                                                    return emp ? (
                                                        <UserCardTrigger
                                                            data={{
                                                                kind: "employee",
                                                                fullName: emp.fullName,
                                                                username: emp.username,
                                                                phone: emp.phone,
                                                                jobTitle: emp.jobTitle,
                                                                role: emp.role,
                                                                isActive: emp.isActive,
                                                                hiredAt: emp.hiredAt,
                                                                notes: emp.notes,
                                                                createdAt: emp.createdAt,
                                                                updatedAt: emp.updatedAt,
                                                            }}
                                                        />
                                                    ) : null;
                                                })()}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingSalary(salary)}>
                                                            <Pencil className="size-4 me-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => setDeletingSalary(salary)}
                                                        >
                                                            <Trash2 className="size-4 me-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No salary records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CreateSalaryDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                employees={employees ?? []}
                isPending={createMutation.isPending}
                onSubmit={(data) =>
                    createMutation.mutate(data, {
                        onSuccess: () => setCreateOpen(false),
                    })
                }
            />

            <EditSalaryDialog
                open={!!editingSalary}
                onOpenChange={(open) => !open && setEditingSalary(null)}
                salary={editingSalary}
                employees={employees ?? []}
                isPending={updateMutation.isPending}
                onSubmit={(data) =>
                    editingSalary &&
                    updateMutation.mutate(
                        { id: editingSalary.id, data },
                        { onSuccess: () => setEditingSalary(null) },
                    )
                }
            />

            <DeleteConfirmDialog
                open={!!deletingSalary}
                onOpenChange={(open) => !open && setDeletingSalary(null)}
                title="Delete Salary Record"
                name={deletingSalary?.employeeName ?? ""}
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deletingSalary &&
                    deleteMutation.mutate(deletingSalary.id, {
                        onSuccess: () => setDeletingSalary(null),
                    })
                }
            />
        </PageContainer>
    );
}
