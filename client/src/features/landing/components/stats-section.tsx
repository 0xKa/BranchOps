import { useTranslation } from "react-i18next";
import { useScrollAnimation } from "../hooks/use-scroll-animation";

const stats = [
  { key: "branches", value: "500+" },
  { key: "transactions", value: "50K+" },
  { key: "uptime", value: "99.9%" },
  { key: "reports", value: "10K+" },
];

function StatItem({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const ref = useScrollAnimation(0.15);

  return (
    <div
      ref={ref}
      className={`animate-on-scroll stagger-${index + 1} flex flex-col items-center gap-1 px-6 py-4`}
    >
      <span className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {value}
      </span>
      <span className="text-xs text-muted-foreground sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export function StatsSection() {
  const { t } = useTranslation();
  const headingRef = useScrollAnimation(0.15);

  return (
    <section className="relative py-20 sm:py-28">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, #00FF88 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div ref={headingRef} className="animate-on-scroll mb-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("landing.stats.heading")}
          </h2>
        </div>

        <div className="glass mx-auto max-w-3xl rounded-2xl">
          <div className="grid grid-cols-2 divide-x divide-border/50 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <StatItem
                key={stat.key}
                value={stat.value}
                label={t(`landing.stats.${stat.key}`)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
