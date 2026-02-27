import { useTranslation } from "react-i18next";
import { GitBranch } from "lucide-react";

export function LandingFooter() {
    const { t } = useTranslation();

    return (
        <footer className="border-t">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GitBranch className="size-3.5" />
                    <span>
                        &copy; {new Date().getFullYear()} {t("appName")}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {t("landing.rights")}
                </p>
            </div>
        </footer>
    );
}
