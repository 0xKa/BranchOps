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
import type { EmployeeSalaryCreateRequest } from "../types";

const schema = z.object({
    employeeId: z.string().min(1, "Employee is required"),
    amount: z.number().min(0, "Amount must be positive"),
    currency: z.string().min(1).max(3),
    effectiveFrom: z.string().min(1, "Effective from is required"),
    effectiveTo: z.string().optional(),
    notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateSalaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employees: Employee[];
    isPending: boolean;
    onSubmit: (data: EmployeeSalaryCreateRequest) => void;
}

export default function CreateSalaryDialog({
    open,
    onOpenChange,
    employees,
    isPending,
    onSubmit,
}: CreateSalaryDialogProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            employeeId: "",
            amount: 0,
            currency: "OMR",
            effectiveFrom: "",
            effectiveTo: "",
            notes: "",
        },
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
                    <DialogTitle>Add Salary Record</DialogTitle>
                    <DialogDescription>
                        Create a new salary record for an employee.
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
                            {isPending ? "Creating…" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
