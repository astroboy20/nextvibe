"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LaunchFAQ from "@/app/launch/component/launch-faq";
import RewardTiers from "@/app/launch/component/reward-tier";
import WhyBackNextVibe from "@/app/launch/component/why-nextvibe";

export default function PledgeLanding() {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1 flex flex-col items-center px-4 py-12">
          <div className="container mx-auto max-w-5xl flex flex-col items-center text-center">
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="self-start mb-8"
            >
              <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Link href="/launch">
                  <ArrowLeft className="h-4 w-4" />
                  Back to launch
                </Link>
              </Button>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Pre-launch campaign
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
            >
              Back NextVibe.
              <br />
              <span className="text-gradient">Shape the future.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg sm:text-xl text-muted-foreground"
            >
              Early backers get 3× bundles for the price of 1, exclusive merch,
              and a permanent place in our Founders Wall.
            </motion.p>
          </div>

          {/* Why Back NextVibe (Manifesto) */}
          <WhyBackNextVibe />

          {/* Reward Tiers */}
          <RewardTiers />

          {/* FAQ */}
          <LaunchFAQ />
        </main>
      </div>
    </div>
  );
}
