import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Employee } from "@/features/users/employee/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { EmployeeSalary, EmployeeSalaryUpdateRequest } from "../types";

const schema = z.object({
    employeeId: z.string().min(1, "Employee is required"),
    amount: z.number().min(0, "Amount must be positive"),
    currency: z.string().min(1).max(3),
    effectiveFrom: z.string().min(1, "Effective from is required"),
    effectiveTo: z.string().optional(),
    notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditSalaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salary: EmployeeSalary | null;
    employees: Employee[];
    isPending: boolean;
    onSubmit: (data: EmployeeSalaryUpdateRequest) => void;
}

export default function EditSalaryDialog({
    open,
    onOpenChange,
    salary,
    employees,
    isPending,
    onSubmit,
}: EditSalaryDialogProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        values: salary
            ? {
                employeeId: salary.employeeId,
                amount: salary.amount,
                currency: salary.currency,
                effectiveFrom: salary.effectiveFrom.split("T")[0],
                effectiveTo: salary.effectiveTo?.split("T")[0] ?? "",
                notes: salary.notes ?? "",
            }
            : undefined,
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit({
            ...data,
            effectiveTo: data.effectiveTo || null,
            notes: data.notes || null,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Salary Record</DialogTitle>
                    <DialogDescription>
                        Update the salary record details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Employee */}
                    <div className="space-y-2">
                        <Label>Employee *</Label>
                        <Controller
                            control={control}
                            name="employeeId"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id}>
                                                {emp.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.employeeId && (
                            <p className="text-sm text-destructive">{errors.employeeId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                step="0.001"
                                min="0"
                                {...register("amount", { valueAsNumber: true })}
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">{errors.amount.message}</p>
                            )}
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Controller
                                control={control}
                                name="currency"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OMR">OMR</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Effective From */}
                        <div className="space-y-2">
                            <Label>Effective From *</Label>
                            <Input type="date" {...register("effectiveFrom")} />
                            {errors.effectiveFrom && (
                                <p className="text-sm text-destructive">{errors.effectiveFrom.message}</p>
                            )}
                        </div>

                        {/* Effective To */}
                        <div className="space-y-2">
                            <Label>Effective To</Label>
                            <Input type="date" {...register("effectiveTo")} />
                            {errors.effectiveTo && (
                                <p className="text-sm text-destructive">{errors.effectiveTo.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea rows={3} {...register("notes")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
