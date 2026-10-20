"use client";
import HeroSection from "../components/hero-section";
import WhoItsForSection from "../components/who-its-for-section";
import WhyNextvibeSection from "../components/why-nextvibe-section";
import HowItWorksSection from "../components/how-it-works-section";
import CtaBanner from "../components/cta-banner";
import CommissionSection from "../components/commission-section";
import FaqSection from "../components/faq-section";

export default function AffiliateContent() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <main>
        <HeroSection />
        <WhoItsForSection />
        <WhyNextvibeSection />
        <HowItWorksSection />
        <CtaBanner />
        <CommissionSection />
        <FaqSection />
      </main>
    </div>
  );
}
