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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BranchCreateRequest } from "../hooks/use-create-branch";

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

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (data: BranchCreateRequest) => void;
}

export default function CreateBranchDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: CreateBranchDialogProps) {
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
          <DialogTitle>Add Branch</DialogTitle>
          <DialogDescription>Create a new branch location.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="branch-code">Code</Label>
              <Input id="branch-code" {...register("code")} />
              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="branch-displayName">Display Name</Label>
              <Input id="branch-displayName" {...register("displayName")} />
              {errors.displayName && (
                <p className="text-xs text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="branch-addressLine1">Address Line 1</Label>
            <Input id="branch-addressLine1" {...register("addressLine1")} />
            {errors.addressLine1 && (
              <p className="text-xs text-destructive">
                {errors.addressLine1.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="branch-addressLine2">Address Line 2</Label>
            <Input id="branch-addressLine2" {...register("addressLine2")} />
            {errors.addressLine2 && (
              <p className="text-xs text-destructive">
                {errors.addressLine2.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="branch-city">City</Label>
              <Input id="branch-city" {...register("city")} />
              {errors.city && (
                <p className="text-xs text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="branch-country">Country</Label>
              <Input id="branch-country" {...register("country")} />
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
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
