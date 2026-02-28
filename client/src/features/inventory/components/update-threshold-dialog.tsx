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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { BranchStock, UpdateThresholdRequest } from "../types";

const schema = z.object({
    lowStockThreshold: z.number().int().min(0, "Threshold must be 0 or more"),
});

type FormValues = z.infer<typeof schema>;

interface UpdateThresholdDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stock: BranchStock | null;
    isPending: boolean;
    onSubmit: (data: UpdateThresholdRequest) => void;
}

export default function UpdateThresholdDialog({
    open,
    onOpenChange,
    stock,
    isPending,
    onSubmit,
}: UpdateThresholdDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            lowStockThreshold: 10,
        },
    });

    useEffect(() => {
        if (stock && open) {
            reset({
                lowStockThreshold: stock.lowStockThreshold,
            });
        }
    }, [stock, open, reset]);

    const handleOpenChange = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Update Threshold</DialogTitle>
                    <DialogDescription>
                        {stock && (
                            <>
                                Update the low stock threshold for{" "}
                                <span className="font-semibold">{stock.productName}</span> at{" "}
                                <span className="font-semibold">{stock.branchName}</span>.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="threshold-value">Low Stock Threshold</Label>
                        <Input
                            id="threshold-value"
                            type="number"
                            min="0"
                            {...register("lowStockThreshold", { valueAsNumber: true })}
                        />
                        {errors.lowStockThreshold && (
                            <p className="text-xs text-destructive">
                                {errors.lowStockThreshold.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
