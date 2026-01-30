import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface LangToggleProps {
  className?: string;
  variant?:
    | "secondary"
    | "link"
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | null;
  size?:
    | "sm"
    | "lg"
    | "icon"
    | "default"
    | "xs"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg"
    | null
    | undefined;
}

export function LangToggle({
  variant = "outline",
  className,
  size,
}: LangToggleProps) {
  const { t, i18n } = useTranslation();

  const current = (i18n.resolvedLanguage as "en" | "ar") ?? "en";
  const next = current === "en" ? "ar" : "en";

  const onToggle = async () => {
    await i18n.changeLanguage(next);
    // localStorage.setItem("lng", next); // Handled by i18next-browser-languagedetector in i18n.ts
  };

  return (
    <Button
      variant={variant}
      onClick={onToggle}
      className={className}
      size={size}
    >
      {current === "en" ? t("switchToArabic") : t("switchToEnglish")}
    </Button>
  );
}
