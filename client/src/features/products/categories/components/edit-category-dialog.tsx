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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { ProductCategory } from "../../types";
import type { CategoryUpdateRequest } from "../hooks/use-update-category";

const schema = z.object({
    name: z.string().min(1, "Name is required").max(120),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: ProductCategory | null;
    isPending: boolean;
    onSubmit: (data: CategoryUpdateRequest) => void;
}

export default function EditCategoryDialog({
    open,
    onOpenChange,
    category,
    isPending,
    onSubmit,
}: EditCategoryDialogProps) {
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
            isActive: true,
        },
    });

    useEffect(() => {
        if (category && open) {
            reset({
                name: category.name,
                isActive: category.isActive,
            });
        }
    }, [category, open, reset]);

    const handleOpenChange = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit({
            name: data.name,
            isActive: data.isActive,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>Update category information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="edit-category-name">Name</Label>
                        <Input id="edit-category-name" {...register("name")} />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name.message}
                            </p>
                        )}
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
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
