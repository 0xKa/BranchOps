import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center">
            <Badge variant="secondary" className="mb-4">
                {t("landing.badge")}
            </Badge>

            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                {t("landing.headline")}
            </h1>

            <p className="mt-4 max-w-lg text-sm text-muted-foreground">
                {t("landing.subheadline")}
            </p>

            <div className="mt-8 flex gap-2">
                <Button size="lg" onClick={() => navigate("/login")}>
                    {t("landing.getStarted")}
                    <ArrowRight className="ms-1 size-3.5" />
                </Button>
            </div>
        </section>
    );
}
