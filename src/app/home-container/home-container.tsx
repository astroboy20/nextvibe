"use client";

import InteractiveFeatures from "./container/interactive-features";
import HeroSection from "./container/hero-section";
import { FeaturesSection } from "./container/feature-section";
import StakeholdersSection from "./container/stakeholder-timeline-section";
import SocialProofSection from "./container/socialproof-section";
import JoinMovement from "./container/join-movement-section";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";

const HomeContainer = () => {
  return (
    <main className="min-h-screen pt-25">
      <Navbar />
      <InteractiveFeatures />
      <HeroSection />
      <FeaturesSection />
      <StakeholdersSection />
      <SocialProofSection />
      <JoinMovement />
      <Footer />
    </main>
  );
};

export default HomeContainer;
