import SoftAurora from "@/components/SoftAurora";
import { LandingHeader } from "./components/landing-header";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { StatsSection } from "./components/stats-section";
import { CtaSection } from "./components/cta-section";
import { LandingFooter } from "./components/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
        <SoftAurora
          color1="#00FF88"
          color2="#003322"
          speed={0.6}
          brightness={1.1}
          scale={1.2}
          bandHeight={0.7}
          bandSpread={1.9}
          enableMouseInteraction={false}
          noiseFrequency={3}
          noiseAmplitude={3.0}
          octaveDecay={0.1}
          layerOffset={5}
          colorSpeed={1.0}
        />
      </div>
      <LandingHeader />
      <main className="relative z-10 flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
