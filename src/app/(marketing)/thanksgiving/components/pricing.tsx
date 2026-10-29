"use client";
import { useEffect, useState } from "react";
import { Clock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const SPOTS_TOTAL = 500;
const SPOTS_TAKEN = 312;
const STANDARD_PRICE = 58;
const FOUNDER_PRICE = 29;
const DEADLINE = new Date("2026-11-26T12:00:00-05:00");

const included = [
  "Pre-event VibeTag (custom designed)",
  "Unlimited postcards from every guest",
  "Full gamification suite with live leaderboards",
  "VibePod family social layer",
  "Permanent Pulse gallery",
  "Host analytics dashboard",
];

const offerFacts = [
  `Standard price $${STANDARD_PRICE} — you pay $${FOUNDER_PRICE} today`,
  "Payment is taken now to lock the spot",
  "An approximate date is required (US or Canadian Thanksgiving)",
  "Guests pay nothing and install nothing",
  "Locked-in pricing means this package stays $29 for your event",
  "Offer ends at Thanksgiving or when the 500th spot is claimed",
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface PricingProps {
  onScrollToFunnel: () => void;
}

export default function Pricing({ onScrollToFunnel }: PricingProps) {
  const { days, hours, minutes, seconds } = useCountdown(DEADLINE);
  const spotsLeft = SPOTS_TOTAL - SPOTS_TAKEN;
  const claimedPct = (SPOTS_TAKEN / SPOTS_TOTAL) * 100;

  const countdownBoxes = [
    { value: days, label: "days" },
    { value: hours, label: "hrs" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];

  return (
    <section id="pricing" className="py-12 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Clock className="size-4" />
              Founder pricing — first {SPOTS_TOTAL} hosts
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              The Thanksgiving Family Package
            </h2>
            <p className="mt-3 text-4xl font-extrabold md:text-5xl">
              <span className="text-muted-foreground line-through text-3xl">
                ${STANDARD_PRICE}
              </span>{" "}
              <span className="text-primary">${FOUNDER_PRICE}</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              One payment. Every feature. Guests pay nothing, ever.
            </p>
          </div>

          {/* Spots progress */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>
                {SPOTS_TAKEN} of {SPOTS_TOTAL} spots claimed
              </span>
              <span className="text-primary">{spotsLeft} left</span>
            </div>
            <Progress value={claimedPct} className="h-2.5" />
          </div>

          {/* Included list */}
          <ul className="mt-6 flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </div>
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          {/* Countdown */}
          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Offer closes on Thanksgiving Day
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {countdownBoxes.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <p className="text-2xl font-extrabold tabular-nums leading-none md:text-3xl">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="mt-6 w-full gap-2"
            onClick={onScrollToFunnel}
          >
            Reserve my Thanksgiving Vibe
            <ArrowRight className="size-4" />
          </Button>

          {/* Offer facts */}
          <ul className="mt-5 flex flex-col gap-2">
            {offerFacts.map((fact) => (
              <li
                key={fact}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
