"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useInitiatePledgeMutation } from "@/app/provider/api/pledgeApi";

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
    id: "vibesupporter",
    name: "The Vibe Supporter",
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
    id: "vibefan",
    name: "The Vibe Fan",
    tagline: "Rally your squad with mid-size events",
    priceUsd: 25,
    bundles: "3 × Small Mega Bundle (51–200)",
    normalValue: 37,
    savingsPct: 33,
    icon: Users,
    rewards: ["3 Small Mega Bundles", "VIP badge on profile"],
  },
  {
    id: "vibeenthusiast",
    name: "The Vibe Enthusiast",
    tagline: "Conduct medium-scale experiences",
    priceUsd: 50,
    bundles: "3 × Medium Mega Bundle (201–500)",
    normalValue: 75,
    savingsPct: 33,
    icon: Award,
    rewards: ["3 Medium Mega Bundles", "VIP badge & Hall of Fame"],
  },
  {
    id: "vibechampion",
    name: "The Vibe Champion",
    tagline: "Blueprint for serious organizers",
    priceUsd: 100,
    bundles: "3 × Large Mega Bundle (501–2,000)",
    normalValue: 150,
    savingsPct: 33,
    icon: Rocket,
    highlight: true,
    badge: "Most Popular",
    rewards: ["3 Large Mega Bundles", "Founder's Club T-shirt"],
  },
  {
    id: "vibepatron",
    name: "The Vibe Patron",
    tagline: "Architect city-scale events",
    priceUsd: 150,
    bundles: "3 × Enterprise Mega Bundle (2,001+)",
    normalValue: 225,
    savingsPct: 33,
    icon: Star,
    rewards: ["3 Enterprise Mega Bundles", "Full Merch Kit & Social Shoutout"],
  },
  {
    id: "vibemaestro",
    name: "The Vibe Maestro",
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
    bundles: "Everything in Maestro + bespoke perks",
    normalValue: 845,
    savingsPct: 41,
    icon: Crown,
    badge: "Limited",
    rewards: [
      "Everything in Vibe Maestro Tier",
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
  isPledging,
}: {
  tier: Tier;
  qty: number;
  setQty: (n: number) => void;
  onPledge: () => void;
  isPledging: boolean;
}) {
  const Icon = tier.icon;
  const total = tier.priceUsd * qty;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative flex flex-col h-full rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-card-hover transition-shadow ${
        tier.highlight
          ? "bg-linear-to-br from-primary to-vibe-purple text-primary-foreground border-2 border-primary"
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
        disabled={isPledging}
        variant={tier.highlight ? "secondary" : "default"}
        className="w-full rounded-xl"
      >
        {isPledging ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing…
          </>
        ) : (
          <>Pledge {formatUsd(total)}</>
        )}
      </Button>
    </motion.div>
  );
}

export default function RewardTiers() {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(TIERS.map((t) => [t.id, 1]))
  );
  const [pledgingId, setPledgingId] = useState<string | null>(null);
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [initiatePledge] = useInitiatePledgeMutation();

  const submitPledge = async (
    tier: Tier,
    opts: { name: string; email: string }
  ) => {
    const qty = quantities[tier.id];
    setPledgingId(tier.id);
    try {
      const res = await initiatePledge({
        tierId: tier.id as any,
        quantity: qty,
        name: opts.name,
        email: opts.email,
      }).unwrap();

      console.log(res)

      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingPledgeId", res?.data?.pledgeId);
      }
      window.location.href = res?.data?.checkoutUrl;
    } catch (err: any) {
      const msg =
        err?.data?.message ?? err?.message ?? "Failed to initiate pledge.";
      toast.error(msg);
      setPledgingId(null);
    }
  };

  const handlePledge = (tier: Tier) => {
    // Always show the guest details modal
    setPendingTier(tier);
  };

  const handleGuestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingTier) return;

    const name = guestName.trim();
    const email = guestEmail.trim();

    if (!name || !email) {
      toast.error("Please enter your name and email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setPendingTier(null);
    submitPledge(pendingTier, { name, email });
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
              isPledging={pledgingId === tier.id}
            />
          </motion.div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground max-w-xl mx-auto">
        Prices in USD. NGN equivalent at ₦{USD_TO_NGN.toLocaleString()}/$1.
        Secure checkout powered by Ercaspay.
      </p>

      {/* ── Guest details modal ───────────────────────────────────────────── */}
      <Dialog
        open={!!pendingTier}
        onOpenChange={(open) => {
          if (!open && pledgingId === null) setPendingTier(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete your pledge</DialogTitle>
            <DialogDescription>
              Enter your details so we can send your confirmation and keep you
              updated on the campaign.
            </DialogDescription>
          </DialogHeader>

          {/* Selected tier summary */}
          {pendingTier && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between text-sm">
              <span className="font-medium">{pendingTier.name}</span>
              <span className="font-bold text-primary">
                ${pendingTier.priceUsd * (quantities[pendingTier.id] ?? 1)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (
                  {formatNgn(
                    pendingTier.priceUsd * (quantities[pendingTier.id] ?? 1)
                  )}
                  )
                </span>
              </span>
            </div>
          )}

          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pledge-name">
                Full name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="pledge-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Kingsley Daprime"
                  className="pl-9"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pledge-email">
                Email address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="pledge-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll send your receipt and pledge updates here.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setPendingTier(null)}
                disabled={pledgingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={pledgingId !== null}
              >
                {pledgingId !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing…
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}