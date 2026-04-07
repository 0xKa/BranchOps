import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageToggle } from "@/locales/language-toggle";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export function LandingHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="/avocado.svg" alt={t("appName")} className="size-7" />
          <span className="font-display text-base font-bold tracking-tight">
            {t("appName")}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle className="h-8 w-15" />
          <ModeToggle className="h-8 w-8" />
          <Button
            variant="default"
            className="ms-2 h-8 px-5 text-sm font-semibold"
            onClick={() => navigate("/login")}
          >
            {t("login.logIn")}
          </Button>
        </div>
      </div>
    </header>
  );
}
