import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../hooks/use-scroll-animation";

export function CtaSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ref = useScrollAnimation(0.15);

  return (
    <section className="relative py-24 sm:py-32">
      {/* Top divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className="animate-on-scroll relative overflow-hidden rounded-3xl glass-strong p-10 text-center sm:p-16"
        >
          {/* Background glow */}
          <div
            className="pointer-events-none absolute top-[-50%] start-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-15 blur-[100px]"
            style={{ background: "radial-gradient(circle, var(--neon) 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {t("landing.cta.heading")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("landing.cta.subheading")}
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="mt-8 h-12 px-8 text-sm font-semibold"
            >
              {t("landing.cta.button")}
              <ArrowRight className="ms-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
