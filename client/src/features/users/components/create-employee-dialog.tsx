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
import { USER_ROLES, USER_ROLE_LABELS } from "@/features/auth/types";
import type { Branch } from "@/features/branches/hooks/use-branches";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { EmployeeCreateRequest } from "../hooks/use-create-employee";

const EMPLOYEE_ROLES = Object.entries(USER_ROLES).filter(
  ([, value]) => value !== USER_ROLES.Admin,
);

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  email: z.email("Invalid email").or(z.literal("")).optional(),
  role: z.number().min(1).max(4),
  branchId: z.string().min(1, "Branch is required"),
  fullName: z.string().min(1, "Full name is required").max(200),
  phone: z.string().max(20).or(z.literal("")).optional(),
  jobTitle: z.string().max(100).or(z.literal("")).optional(),
  notes: z.string().max(1000).or(z.literal("")).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  isPending: boolean;
  onSubmit: (data: EmployeeCreateRequest) => void;
}

export default function CreateEmployeeDialog({
  open,
  onOpenChange,
  branches,
  isPending,
  onSubmit,
}: CreateEmployeeDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      role: USER_ROLES.Cashier,
      branchId: "",
      fullName: "",
      phone: "",
      jobTitle: "",
      notes: "",
      isActive: true,
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      role: data.role as EmployeeCreateRequest["role"],
      email: data.email || null,
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      notes: data.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Create a new user account and employee record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Account info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="create-username">Username</Label>
                <Input id="create-username" {...register("username")} />
                {errors.username && (
                  <p className="text-xs text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="create-email">Email</Label>
                <Input id="create-email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-role">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="create-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYEE_ROLES.map(([key, value]) => (
                          <SelectItem key={key} value={String(value)}>
                            {USER_ROLE_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-xs text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employee info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Employee Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="create-fullName">Full Name</Label>
                <Input id="create-fullName" {...register("fullName")} />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-branchId">Branch</Label>
                <Controller
                  control={control}
                  name="branchId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="create-branchId">
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
                <Label htmlFor="create-phone">Phone</Label>
                <Input id="create-phone" {...register("phone")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-jobTitle">Job Title</Label>
                <Input id="create-jobTitle" {...register("jobTitle")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="create-notes">Notes</Label>
              <Textarea id="create-notes" rows={2} {...register("notes")} />
            </div>
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
              {isPending ? "Creating…" : "Create Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
