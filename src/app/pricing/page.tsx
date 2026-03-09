"use client";
import Navbar from "@/components/navbar/navbar";
import PricingContent from "./container/pricing";
import Footer from "@/components/footer";

export default function PricingPage() {
  return (
    <div className="h-screen">
      <Navbar />
      <PricingContent />
      <Footer />
    </div>
  );
}
