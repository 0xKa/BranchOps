import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../hooks/use-scroll-animation";
import Aurora from "./aurora";

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ref = useScrollAnimation(0.1);

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Background: Aurora animation */}
      <div className="pointer-events-none absolute inset-0">
        {/* Aurora — spans the full hero, anchored to the top half */}
        <div className="absolute inset-x-0 top-0 h-[75%] opacity-60">
          <Aurora
            colorStops={["#001a0d", "#00FF88", "#003322"]}
            amplitude={2.5}
            blend={0.6}
            speed={0.4}
          />
        </div>
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
          className=" mb-6 border-primary/30 bg-primary/5 px-4 py-3.5 text-xs font-medium text-primary stagger-1"
        >
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
            className="h-12 px-8 text-sm font-semibold"
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
