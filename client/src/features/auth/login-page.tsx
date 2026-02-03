import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/locales/language-toggle";
import { Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "./useLogin";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onError: (err) => {
        console.log("Login failed:", err.message);
        // TODO: USE TOAST NOTIFCATION
      },
      onSuccess: () => {
        navigate("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-muted/10 p-4">
      <div className="absolute top-4 right-4 flex items-center gap-3 ltr:flex-row-reverse ">
        <LanguageToggle className="h-10 w-20" />
        <ModeToggle className="h-10 w-10" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-6" />
          </div>
          <CardTitle className="text-2xl">Welcome to BranchOps</CardTitle>
          <CardDescription>Log in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error?.message}
              </div>
            )}
            <div className="space-y-2 ">
              <div className="flex items-end justify-between">
                <Label htmlFor="username" className="text-xs">
                  Username
                </Label>
                {errors.username && (
                  <span className="text-xs text-destructive">
                    {errors.username.message}
                  </span>
                )}
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                {...register("username")}
                aria-invalid={errors.username ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                {errors.password ? (
                  <span className="text-xs text-destructive">
                    {errors.password.message}
                  </span>
                ) : (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-8 mt-4"
              disabled={isPending}
            >
              {isPending ? "Logging In..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
