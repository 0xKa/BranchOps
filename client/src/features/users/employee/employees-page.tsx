import DeleteConfirmDialog from "@/components/shared/delete-confirm-dialog";
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
import { useBranches } from "@/features/branches/hooks/use-branches";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import CreateEmployeeDialog from "./components/create-employee-dialog";
import EditEmployeeDialog from "./components/edit-employee-dialog";
import {
    useCreateEmployee,
    useDeleteEmployee,
    useEmployees,
    useUpdateEmployee,
} from "./hooks";
import type { Employee } from "./types";

export default function EmployeesPage() {
    const { data: employees, isLoading } = useEmployees();
    const { data: branches } = useBranches();
    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee();
    const deleteMutation = useDeleteEmployee();

    const [createOpen, setCreateOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
        null,
    );

    return (
        <PageContainer>
            <PageHeader title="Employees" description="Manage employee accounts">
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4 me-2" />
                    Add Employee
                </Button>
            </PageHeader>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Hired At</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees && employees.length > 0 ? (
                                employees.map((emp) => (
                                    <EmployeeRow
                                        key={emp.id}
                                        employee={emp}
                                        onEdit={setEditingEmployee}
                                        onDelete={setDeletingEmployee}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CreateEmployeeDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                branches={branches ?? []}
                isPending={createMutation.isPending}
                onSubmit={(data) =>
                    createMutation.mutate(data, {
                        onSuccess: () => setCreateOpen(false),
                    })
                }
            />

            <EditEmployeeDialog
                open={!!editingEmployee}
                onOpenChange={(open) => !open && setEditingEmployee(null)}
                employee={editingEmployee}
                branches={branches ?? []}
                isPending={updateMutation.isPending}
                onSubmit={(data) =>
                    editingEmployee &&
                    updateMutation.mutate(
                        { id: editingEmployee.id, data },
                        { onSuccess: () => setEditingEmployee(null) },
                    )
                }
            />

            <DeleteConfirmDialog
                open={!!deletingEmployee}
                onOpenChange={(open) => !open && setDeletingEmployee(null)}
                title="Delete Employee"
                name={deletingEmployee?.fullName ?? ""}
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deletingEmployee &&
                    deleteMutation.mutate(deletingEmployee.id, {
                        onSuccess: () => setDeletingEmployee(null),
                    })
                }
            />
        </PageContainer>
    );
}

function EmployeeRow({
    employee,
    onEdit,
    onDelete,
}: {
    employee: Employee;
    onEdit: (emp: Employee) => void;
    onDelete: (emp: Employee) => void;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{employee.fullName}</TableCell>
            <TableCell>{employee.username}</TableCell>
            <TableCell>{employee.jobTitle ?? "—"}</TableCell>
            <TableCell>{employee.phone ?? "—"}</TableCell>
            <TableCell>
                <Badge variant="outline">{employee.role}</Badge>
            </TableCell>
            <TableCell>
                <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? "Active" : "Inactive"}
                </Badge>
            </TableCell>
            <TableCell>
                {employee.hiredAt
                    ? new Date(employee.hiredAt).toLocaleDateString()
                    : "—"}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                            <Pencil className="size-4 me-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(employee)}
                        >
                            <Trash2 className="size-4 me-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
