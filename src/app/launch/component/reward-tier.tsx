"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Check,
  Crown,
  Sparkles,
  Zap,
  Users,
  Award,
  Rocket,
  Star,
  Gem,
} from "lucide-react";
import { toast } from "sonner";

const USD_TO_NGN = 1500;

export type Tier = {
  id: string;
  name: string;
  tagline: string;
  priceUsd: number;
  bundles: string;
  normalValue: number | null;
  savingsPct: number | null;
  rewards: string[];
  icon: typeof Crown;
  highlight?: boolean;
  badge?: string;
};

export const TIERS: Tier[] = [
  {
    id: "vibewatcher",
    name: "The Vibe Watcher",
    tagline: "Believe in us — be part of the story",
    priceUsd: 5,
    bundles: "Supporter tier",
    normalValue: null,
    savingsPct: null,
    icon: Sparkles,
    rewards: [
      "Thank you on website",
      "Exclusive launch event wallpaper",
      "Updates during campaign",
    ],
  },
  {
    id: "vibespark",
    name: "The Vibe Spark",
    tagline: "Start the spark for small gatherings",
    priceUsd: 10,
    bundles: "3 × Micro Mega Bundle (1–50)",
    normalValue: 15,
    savingsPct: 33,
    icon: Zap,
    rewards: [
      "3 separate event packages",
      "Use for own events or gift to friends",
    ],
  },
  {
    id: "vibesquad",
    name: "The Vibe Squad",
    tagline: "Rally your squad with mid-size events",
    priceUsd: 20,
    bundles: "3 × Small Mega Bundle (51–200)",
    normalValue: 30,
    savingsPct: 33,
    icon: Users,
    rewards: ["3 Small Mega Bundles", "VIP badge on profile"],
  },
  {
    id: "vibemaestro",
    name: "The Vibe Maestro",
    tagline: "Conduct medium-scale experiences",
    priceUsd: 40,
    bundles: "3 × Medium Mega Bundle (201–500)",
    normalValue: 60,
    savingsPct: 33,
    icon: Award,
    rewards: ["3 Medium Mega Bundles", "VIP badge & Hall of Fame"],
  },
  {
    id: "vibeblueprint",
    name: "The Vibe Blueprint",
    tagline: "Blueprint for serious organizers",
    priceUsd: 65,
    bundles: "3 × Large Mega Bundle (501–2,000)",
    normalValue: 114,
    savingsPct: 43,
    icon: Rocket,
    highlight: true,
    badge: "Most Popular",
    rewards: ["3 Large Mega Bundles", "Founder's Club T-shirt"],
  },
  {
    id: "vibearchitect",
    name: "The Vibe Architect",
    tagline: "Architect city-scale events",
    priceUsd: 100,
    bundles: "3 × Enterprise Mega Bundle (2,001+)",
    normalValue: 195,
    savingsPct: 49,
    icon: Star,
    rewards: ["3 Enterprise Mega Bundles", "Full Merch Kit & Social Shoutout"],
  },
  {
    id: "vibeicon",
    name: "The Vibe Icon",
    tagline: "Become an icon of the movement",
    priceUsd: 250,
    bundles: "15 bundles across all 5 tiers",
    normalValue: 445,
    savingsPct: 44,
    icon: Gem,
    rewards: [
      "All 5 Tier Bundles (15 total)",
      "Full Merch Kit & 10 Referrals",
      "Founders Wall & Private Group",
    ],
  },
  {
    id: "vibeking",
    name: "The Vibe King",
    tagline: "Rule the vibe — top of the throne",
    priceUsd: 500,
    bundles: "Everything in Icon + bespoke perks",
    normalValue: 845,
    savingsPct: 41,
    icon: Crown,
    badge: "Limited",
    rewards: [
      "Everything in Vibe Icon Tier",
      "Dedicated Onboarding & Strategy",
    ],
  },
];

function formatUsd(v: number) {
  return `$${v.toLocaleString()}`;
}
function formatNgn(usd: number) {
  return `₦${(usd * USD_TO_NGN).toLocaleString()}`;
}

function TierCard({
  tier,
  qty,
  setQty,
  onPledge,
}: {
  tier: Tier;
  qty: number;
  setQty: (n: number) => void;
  onPledge: () => void;
}) {
  const Icon = tier.icon;
  const total = tier.priceUsd * qty;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative flex flex-col h-full rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-card-hover transition-shadow ${
        tier.highlight
          ? "bg-gradient-to-br from-primary to-vibe-purple text-primary-foreground border-2 border-primary"
          : "bg-white/70 glass border border-border/40"
      }`}
    >
      {tier.badge && (
        <span
          className={`absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            tier.highlight
              ? "bg-white text-primary"
              : "bg-primary text-primary-foreground"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          {tier.badge}
        </span>
      )}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${
          tier.highlight ? "bg-white/20" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-display text-xl font-bold mb-1">{tier.name}</h3>
      <p
        className={`text-sm mb-4 ${
          tier.highlight
            ? "text-primary-foreground/80"
            : "text-muted-foreground"
        }`}
      >
        {tier.tagline}
      </p>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl sm:text-4xl font-bold tabular-nums">
            {formatUsd(tier.priceUsd)}
          </span>
          <span
            className={`text-sm ${
              tier.highlight
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            }`}
          >
            ({formatNgn(tier.priceUsd)})
          </span>
        </div>
        {tier.savingsPct !== null && tier.normalValue !== null && (
          <p
            className={`mt-1 text-xs ${
              tier.highlight
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            }`}
          >
            <span className="line-through opacity-60">
              {formatUsd(tier.normalValue)}
            </span>{" "}
            <span className="font-semibold">Save {tier.savingsPct}%</span>
          </p>
        )}
      </div>

      <p
        className={`text-sm font-medium mb-3 ${
          tier.highlight ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        {tier.bundles}
      </p>

      <ul className="flex-1 space-y-2 mb-5">
        {tier.rewards.map((r) => (
          <li key={r} className="flex items-start gap-2 text-sm">
            <Check
              className={`h-4 w-4 mt-0.5 shrink-0 ${
                tier.highlight ? "text-primary-foreground" : "text-primary"
              }`}
            />
            <span
              className={
                tier.highlight
                  ? "text-primary-foreground/95"
                  : "text-foreground/90"
              }
            >
              {r}
            </span>
          </li>
        ))}
      </ul>

      {/* Quantity */}
      <div
        className={`flex items-center justify-between rounded-xl p-2 mb-3 ${
          tier.highlight ? "bg-white/15" : "bg-muted/60"
        }`}
      >
        <span
          className={`text-xs font-medium uppercase tracking-wider px-2 ${
            tier.highlight
              ? "text-primary-foreground/90"
              : "text-muted-foreground"
          }`}
        >
          Qty
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
              tier.highlight
                ? "bg-white/20 hover:bg-white/30 text-primary-foreground"
                : "bg-background hover:bg-primary/10 text-foreground"
            }`}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-display font-bold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty(Math.min(99, qty + 1))}
            disabled={qty >= 99}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
              tier.highlight
                ? "bg-white/20 hover:bg-white/30 text-primary-foreground"
                : "bg-background hover:bg-primary/10 text-foreground"
            }`}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div
        className={`flex items-center justify-between text-sm mb-3 ${
          tier.highlight
            ? "text-primary-foreground/90"
            : "text-muted-foreground"
        }`}
      >
        <span>Total</span>
        <span className="font-display text-lg font-bold tabular-nums">
          {formatUsd(total)}{" "}
          <span className="text-xs opacity-70">({formatNgn(total)})</span>
        </span>
      </div>

      <Button
        type="button"
        onClick={onPledge}
        size="lg"
        variant={tier.highlight ? "secondary" : "default"}
        className="w-full rounded-xl"
      >
        Pledge {formatUsd(total)}
      </Button>
    </motion.div>
  );
}

export default function RewardTiers() {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(TIERS.map((t) => [t.id, 1]))
  );

  const handlePledge = (tier: Tier) => {
    const qty = quantities[tier.id];
    const total = tier.priceUsd * qty;
    toast.success(`Pledge reserved: ${tier.name}`);
  };

  return (
    <section
      id="reward-tiers"
      className="container mx-auto max-w-7xl px-4 py-16 sm:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
          <Rocket className="h-4 w-4" />
          Back the launch
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4">
          Pick your <span className="text-gradient">vibe tier</span>
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
          Help us launch NextVibe across Nigeria. Every backer gets exclusive
          bundles, perks, and lifetime savings on event packages.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            className="h-full"
          >
            <TierCard
              tier={tier}
              qty={quantities[tier.id]}
              setQty={(n) => setQuantities((q) => ({ ...q, [tier.id]: n }))}
              onPledge={() => handlePledge(tier)}
            />
          </motion.div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground max-w-xl mx-auto">
        Prices shown in USD with NGN equivalents at ₦
        {USD_TO_NGN.toLocaleString()}/$1. Payment gateway integration coming
        soon — pledge now to reserve your tier and we&apos;ll email you when
        checkout opens.
      </p>
    </section>
  );
}
