import { LandingHeader } from "./components/landing-header";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { LandingFooter } from "./components/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
