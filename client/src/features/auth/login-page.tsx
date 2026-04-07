import Aurora from "@/components/shared/aurora";
import { BackToHomeButton } from "@/components/shared/back-to-home-button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useLogin } from "./hooks/use-login";

const loginSchema = z.object({
  username: z.string().min(1, "login.usernameRequired"),
  password: z.string().min(4, "login.passwordMinLength"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-background p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0">
        <Aurora
          colorStops={["#001a0d", "#00FF88", "#003322"]}
          amplitude={0.5}
          blend={0.6}
          speed={0.4}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-5xl flex-col items-center justify-center">
        <div className="mb-5 flex items-center gap-3 rounded-full px-2 py-2 ltr:flex-row-reverse sm:absolute sm:right-0 sm:top-0 sm:mb-0">
          <BackToHomeButton className="h-10 w-30 bg-accent/15 text-secondary-foreground hover:bg-accent" />
          <LanguageToggle className="h-10 w-20" />
          <ModeToggle className="h-10 w-10" />
        </div>

        <Card className="surface-1 w-full max-w-md border-border/60 shadow-glow-subtle">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.35)]">
              <img
                src="/avocado.svg"
                alt="BranchOps logo"
                className="size-10"
              />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-display text-3xl">
                {t("login.title")}
              </CardTitle>
              <CardDescription>{t("login.description")}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/12 px-3 py-3 text-sm text-destructive">
                  {error?.message}
                </div>
              )}
              <div className="space-y-2 ">
                <div className="flex items-end justify-between">
                  <Label htmlFor="username" className="text-xs">
                    {t("login.username")}
                  </Label>
                  {errors.username && (
                    <span className="text-xs text-destructive">
                      {t(errors.username.message || "")}
                    </span>
                  )}
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("login.usernamePlaceholder")}
                  {...register("username")}
                  aria-invalid={errors.username ? "true" : "false"}
                  className="h-8.5"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <Label htmlFor="password" className="text-xs">
                    {t("login.password")}
                  </Label>
                  {errors.password && (
                    <span className="text-xs text-destructive">
                      {t(errors.password.message || "")}
                    </span>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                  className="h-8.5"
                />
              </div>
              <Button
                type="submit"
                className="mt-4 h-10 w-full"
                disabled={isPending}
              >
                {isPending ? t("login.loggingIn") : t("login.logIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
