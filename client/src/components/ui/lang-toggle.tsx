import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface LangToggleProps {
  variant?:
    | "secondary"
    | "link"
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | null;
  className?: string;
}

export function LangToggle({
  variant = "outline",
  className,
}: LangToggleProps) {
  const { t, i18n } = useTranslation();

  const current = (i18n.resolvedLanguage as "en" | "ar") ?? "en";
  const next = current === "en" ? "ar" : "en";

  const onToggle = async () => {
    await i18n.changeLanguage(next);
    localStorage.setItem("lng", next);
  };

  return (
    <Button variant={variant} onClick={onToggle} className={className}>
      {current === "en" ? t("switchToArabic") : t("switchToEnglish")}
    </Button>
  );
}
