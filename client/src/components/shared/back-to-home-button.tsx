import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

interface BackToHomeButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "link" | "secondary" | "destructive" | null | undefined
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
}

export function BackToHomeButton({ className, variant, size }: BackToHomeButtonProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={() => navigate("/")}
        >
            <ArrowLeft className="size-3.5" />
            {t("landing.backToHome")}
        </Button>
    );
}
