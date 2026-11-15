"use client";
import { useEffect, useState } from "react";
import { Clock, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetChristmasStatsQuery } from "@/features/campaigns/api/campaign-api";

const DEADLINE = new Date("2026-12-25T00:00:00.000Z");

const included = [
  "Full VibeTags — one link for every guest, no app download",
  "Postcards from every guest to the host",
  "Full gamification suite with live leaderboards",
  "VibePod guest social layer",
  "Permanent photo and video gallery",
  "Host analytics dashboard",
];

const offerFacts = [
  "$5 (USD) or ₦5,000 (NGN) — same price, every tier",
  "Code arrives by email right after payment confirms",
  "Use it when you are ready to publish your event",
  "Code is locked to the tier you purchase",
  "Offer closes Christmas Day or when 1,000 spots are claimed",
  "Guests pay nothing and install nothing",
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
  const { data: stats } = useGetChristmasStatsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const spotsLeft = stats?.spotsRemaining ?? 1000;
  const isFull = stats?.isFull ?? false;

  const countdownBoxes = [
    { value: days, label: "days" },
    { value: hours, label: "hrs" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];

  return (
    <section id="pricing" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Clock className="size-4" />
              {spotsLeft} spots left · closes Christmas Day
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              The Christmas Campaign Package
            </h2>
            <p className="mt-3 text-4xl font-extrabold md:text-5xl">
              <span className="text-primary">$5</span>
              <span className="mx-2 text-muted-foreground text-2xl">/</span>
              <span className="text-primary">₦5,000</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              One payment. Full MEGA bundle. Guests pay nothing, ever.
            </p>
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
              Offer closes Christmas Day
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

          {/* CTA */}
          <Button
            size="lg"
            className="mt-6 w-full gap-2"
            onClick={onScrollToFunnel}
            disabled={isFull}
          >
            {isFull ? "Campaign fully booked" : "Claim my Christmas spot"}
            {!isFull && <ArrowRight className="size-4" />}
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-primary" />
            Secure checkout via Bachs · Code arrives by email
          </p>

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
