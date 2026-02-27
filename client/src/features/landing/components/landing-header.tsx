import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageToggle } from "@/locales/language-toggle";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GitBranch } from "lucide-react";

export function LandingHeader() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <GitBranch className="size-5 text-primary" />
                    <span className="text-sm font-semibold">{t("appName")}</span>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageToggle className="w-15 h-8" />
                    <ModeToggle className="w-8 h-8" />
                    <Button
                        variant="default"
                        className="ms-2 w-25 h-8"
                        onClick={() => navigate("/login")}
                    >
                        {t("login.logIn")}
                    </Button>
                </div>
            </div>
        </header>
    );
}
