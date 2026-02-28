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
import { useBranches } from "@/features/branches/hooks/use-branches";
import { useProducts } from "@/features/products/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { STOCK_ADJUSTMENT_TYPE, type AdjustStockRequest, type StockAdjustmentType } from "../types";

const schema = z.object({
    branchId: z.string().min(1, "Branch is required"),
    productId: z.string().min(1, "Product is required"),
    type: z.number().int().min(1).max(6),
    quantityChange: z.number().int().refine((v) => v !== 0, "Quantity change cannot be 0"),
    notes: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface AdjustStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    onSubmit: (data: AdjustStockRequest) => void;
}

export default function AdjustStockDialog({
    open,
    onOpenChange,
    isPending,
    onSubmit,
}: AdjustStockDialogProps) {
    const { data: branches } = useBranches();
    const { data: productsData } = useProducts({ pageSize: 200 });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            branchId: "",
            productId: "",
            type: 1,
            quantityChange: 0,
            notes: "",
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit({
            branchId: data.branchId,
            productId: data.productId,
            type: data.type as StockAdjustmentType,
            quantityChange: data.quantityChange,
            notes: data.notes || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adjust Stock</DialogTitle>
                    <DialogDescription>
                        Record a stock adjustment. Use positive values for additions and negative for deductions.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Branch</Label>
                        <Controller
                            control={control}
                            name="branchId"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches?.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.branchId && (
                            <p className="text-xs text-destructive">
                                {errors.branchId.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label>Product</Label>
                        <Controller
                            control={control}
                            name="productId"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productsData?.items.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.productId && (
                            <p className="text-xs text-destructive">
                                {errors.productId.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label>Adjustment Type</Label>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <Select
                                    value={String(field.value)}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STOCK_ADJUSTMENT_TYPE).map(
                                            ([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.type && (
                            <p className="text-xs text-destructive">
                                {errors.type.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="adjust-quantity">Quantity Change</Label>
                        <Input
                            id="adjust-quantity"
                            type="number"
                            {...register("quantityChange", { valueAsNumber: true })}
                        />
                        {errors.quantityChange && (
                            <p className="text-xs text-destructive">
                                {errors.quantityChange.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="adjust-notes">Notes</Label>
                        <Textarea
                            id="adjust-notes"
                            placeholder="Optional notes..."
                            {...register("notes")}
                        />
                        {errors.notes && (
                            <p className="text-xs text-destructive">
                                {errors.notes.message}
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
                            {isPending ? "Adjusting..." : "Adjust Stock"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
