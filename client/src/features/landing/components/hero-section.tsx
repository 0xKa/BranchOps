import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../hooks/use-scroll-animation";

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ref = useScrollAnimation(0.1);

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Background: gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        {/* Main neon glow — top center */}
        <div
          className="absolute top-[-20%] start-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, #00FF88 0%, transparent 70%)" }}
        />
        {/* Secondary glow — bottom left */}
        <div
          className="absolute bottom-[-10%] start-[-10%] h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, #00FF88 0%, transparent 70%)" }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div
        ref={ref}
        className="animate-on-scroll relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <Badge
          variant="outline"
          className="mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary stagger-1"
        >
          <span className="me-1.5 inline-block size-1.5 rounded-full bg-[#00FF88] animate-pulse" />
          {t("landing.badge")}
        </Badge>

        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {t("landing.headline")}
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("landing.subheadline")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="h-12 px-8 text-sm font-semibold neon-glow"
          >
            {t("landing.getStarted")}
            <ArrowRight className="ms-2 size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-12 px-8 text-sm font-semibold"
          >
            {t("landing.learnMore")}
          </Button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
