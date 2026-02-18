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
import type { Branch } from "../types";
import type { BranchUpdateRequest } from "../hooks/use-update-branch";

const schema = z.object({
  code: z.string().min(1, "Code is required").max(30),
  displayName: z.string().min(1, "Display name is required").max(120),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  isPending: boolean;
  onSubmit: (data: BranchUpdateRequest) => void;
}

export default function EditBranchDialog({
  open,
  onOpenChange,
  branch,
  isPending,
  onSubmit,
}: EditBranchDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      displayName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (branch && open) {
      reset({
        code: branch.code,
        displayName: branch.displayName,
        addressLine1: branch.addressLine1 ?? "",
        addressLine2: branch.addressLine2 ?? "",
        city: branch.city ?? "",
        country: branch.country ?? "",
        isActive: branch.isActive,
      });
    }
  }, [branch, open, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      code: data.code,
      displayName: data.displayName,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      country: data.country || null,
      isActive: data.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
          <DialogDescription>Update branch information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-branch-code">Code</Label>
              <Input id="edit-branch-code" {...register("code")} />
              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-branch-displayName">Display Name</Label>
              <Input
                id="edit-branch-displayName"
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="text-xs text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-branch-addressLine1">Address Line 1</Label>
            <Input
              id="edit-branch-addressLine1"
              {...register("addressLine1")}
            />
            {errors.addressLine1 && (
              <p className="text-xs text-destructive">
                {errors.addressLine1.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-branch-addressLine2">Address Line 2</Label>
            <Input
              id="edit-branch-addressLine2"
              {...register("addressLine2")}
            />
            {errors.addressLine2 && (
              <p className="text-xs text-destructive">
                {errors.addressLine2.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-branch-city">City</Label>
              <Input id="edit-branch-city" {...register("city")} />
              {errors.city && (
                <p className="text-xs text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-branch-country">Country</Label>
              <Input id="edit-branch-country" {...register("country")} />
              {errors.country && (
                <p className="text-xs text-destructive">
                  {errors.country.message}
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
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
