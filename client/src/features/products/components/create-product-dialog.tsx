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
import { useCategories } from "../categories/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { ProductCreateRequest } from "../hooks/use-create-product";

const schema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    categoryId: z.string().min(1, "Category is required"),
    price: z.number().min(0, "Price must be 0 or more"),
    cost: z.number().min(0, "Cost must be 0 or more").optional(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CreateProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    onSubmit: (data: ProductCreateRequest) => void;
}

export default function CreateProductDialog({
    open,
    onOpenChange,
    isPending,
    onSubmit,
}: CreateProductDialogProps) {
    const { data: categories } = useCategories();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            categoryId: "",
            price: 0,
            cost: undefined,
            isActive: true,
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit({
            name: data.name,
            categoryId: data.categoryId,
            price: data.price,
            cost: data.cost ?? null,
            isActive: data.isActive,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                    <DialogDescription>Create a new product.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="product-name">Name</Label>
                        <Input id="product-name" {...register("name")} />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label>Category</Label>
                        <Controller
                            control={control}
                            name="categoryId"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categoryId && (
                            <p className="text-xs text-destructive">
                                {errors.categoryId.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="product-price">Price</Label>
                            <Input
                                id="product-price"
                                type="number"
                                step="0.001"
                                min="0"
                                {...register("price", { valueAsNumber: true })}
                            />
                            {errors.price && (
                                <p className="text-xs text-destructive">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="product-cost">Cost</Label>
                            <Input
                                id="product-cost"
                                type="number"
                                step="0.001"
                                min="0"
                                {...register("cost", { valueAsNumber: true })}
                            />
                            {errors.cost && (
                                <p className="text-xs text-destructive">
                                    {errors.cost.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="accent-primary size-4"
                                    />
                                    Active
                                </label>
                            )}
                        />
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
                            {isPending ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
