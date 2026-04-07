import { useTranslation } from "react-i18next";

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="relative border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <img src="/avocado.svg" alt={t("appName")} className="size-5" />
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("appName")}
          </span>
          <span className="hidden text-xs text-muted-foreground/50 sm:inline">
            &mdash; {t("landing.footerTagline")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("landing.rights")}
        </p>
      </div>
    </footer>
  );
}
