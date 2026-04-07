import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

export function BackToHomeButton() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-full border border-border/60 bg-background/50 text-foreground/90 hover:bg-primary/15"
            onClick={() => navigate("/")}
        >
            <ArrowLeft className="size-3.5" />
            {t("landing.backToHome")}
        </Button>
    );
}
