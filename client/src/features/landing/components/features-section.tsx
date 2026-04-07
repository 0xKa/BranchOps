import { useTranslation } from "react-i18next";
import {
  GitBranch,
  ShoppingCart,
  Package,
  BarChart3,
} from "lucide-react";
import { useScrollAnimation } from "../hooks/use-scroll-animation";

const featureIcons = [GitBranch, ShoppingCart, Package, BarChart3];

function FeatureCard({
  title,
  description,
  icon: Icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
}) {
  const ref = useScrollAnimation(0.15);

  return (
    <div
      ref={ref}
      className={`animate-on-scroll stagger-${index + 1} group relative overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:border-primary/20`}
    >
      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,255,136,0.04), transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon className="size-5" />
        </div>
        <h3 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();
  const headingRef = useScrollAnimation(0.15);

  const features = (
    t("landing.features", { returnObjects: true }) as {
      title: string;
      description: string;
    }[]
  ).map((feature, i) => ({
    ...feature,
    icon: featureIcons[i],
  }));

  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Subtle top divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <div ref={headingRef} className="animate-on-scroll mb-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("landing.featuresHeading")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {t("landing.featuresSubheading")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map(({ title, description, icon }, index) => (
            <FeatureCard
              key={title}
              title={title}
              description={description}
              icon={icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
