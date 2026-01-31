import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAppLanguage } from "@/hooks/use-app-language";

interface LanguageToggleProps {
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

export function LanguageToggle({
  variant = "outline",
  className,
  size,
}: LanguageToggleProps) {
  const { t } = useTranslation();
  const { lang, toggleLang } = useAppLanguage();

  return (
    <Button
      variant={variant}
      onClick={toggleLang}
      className={className}
      size={size}
    >
      {lang === "en" ? t("switchToArabic") : t("switchToEnglish")}
    </Button>
  );
}
