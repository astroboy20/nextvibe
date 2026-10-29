"use client";
import { useRef } from "react";
import Hero from "./hero";
import ProofStrip from "./proof-strip";
import HowItWorks from "./how-it-works";
import Benefits from "./benefits";
import FeaturesIncluded from "./features-included";
import Testimonials from "./testimonials";
import Pricing from "./pricing";
import ReservationForm from "./reservation-form";
import FAQ from "./faq";

export default function ThanksgivingPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToFunnel = () => {
    document
      .getElementById("funnel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background font-[var(--font-nunito-sans)]">
      <Hero onScrollToFunnel={scrollToFunnel} />
      <ProofStrip />
      <HowItWorks />
      <Benefits />
      <FeaturesIncluded />
      <Testimonials />
      <Pricing onScrollToFunnel={scrollToFunnel} />
      <ReservationForm formRef={formRef} />
      <FAQ />
    </div>
  );
}
