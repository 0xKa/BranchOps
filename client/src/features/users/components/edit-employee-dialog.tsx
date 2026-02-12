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
import type { Branch } from "@/features/branches/hooks/use-branches";
import type { Employee, EmployeeUpdateRequest } from "../types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  branchId: z.string().min(1, "Branch is required"),
  fullName: z.string().min(1, "Full name is required").max(200),
  phone: z.string().max(20).or(z.literal("")).optional(),
  jobTitle: z.string().max(100).or(z.literal("")).optional(),
  notes: z.string().max(1000).or(z.literal("")).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  branches: Branch[];
  isPending: boolean;
  onSubmit: (data: EmployeeUpdateRequest) => void;
}

export default function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  branches,
  isPending,
  onSubmit,
}: EditEmployeeDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: employee
      ? {
          userId: employee.userId,
          branchId: employee.branchId,
          fullName: employee.fullName,
          phone: employee.phone ?? "",
          jobTitle: employee.jobTitle ?? "",
          notes: employee.notes ?? "",
          isActive: employee.isActive,
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
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      notes: data.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the employee's information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-fullName">Full Name</Label>
              <Input id="edit-fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-branchId">Branch</Label>
              <Controller
                control={control}
                name="branchId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-branchId">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.displayName}
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" {...register("phone")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-jobTitle">Job Title</Label>
              <Input id="edit-jobTitle" {...register("jobTitle")} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={2} {...register("notes")} />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
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
