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
import { useBranches } from "@/features/branches/hooks/use-branches";
import { useProducts } from "@/features/products/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { SetStockRequest } from "../types";

const schema = z.object({
    branchId: z.string().min(1, "Branch is required"),
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().int().min(0, "Quantity must be 0 or more"),
    lowStockThreshold: z.number().int().min(0, "Threshold must be 0 or more"),
});

type FormValues = z.infer<typeof schema>;

interface SetStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    onSubmit: (data: SetStockRequest) => void;
}

export default function SetStockDialog({
    open,
    onOpenChange,
    isPending,
    onSubmit,
}: SetStockDialogProps) {
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
            quantity: 0,
            lowStockThreshold: 10,
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Set Stock Level</DialogTitle>
                    <DialogDescription>
                        Set or update the stock level for a product at a branch.
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

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="stock-quantity">Quantity</Label>
                            <Input
                                id="stock-quantity"
                                type="number"
                                min="0"
                                {...register("quantity", { valueAsNumber: true })}
                            />
                            {errors.quantity && (
                                <p className="text-xs text-destructive">
                                    {errors.quantity.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="stock-threshold">Low Stock Threshold</Label>
                            <Input
                                id="stock-threshold"
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
