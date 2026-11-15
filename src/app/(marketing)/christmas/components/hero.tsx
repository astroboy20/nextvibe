"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/** Christmas Day 2026 */
const DEADLINE = new Date("2026-12-25T00:00:00.000Z");

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-3 text-center min-w-[52px]">
      <p className="font-bold text-2xl tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </p>
      <p className="text-xs font-semibold uppercase text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  );
}

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

interface HeroProps {
  onScrollToFunnel: () => void;
}

export default function Hero({ onScrollToFunnel }: HeroProps) {
  const { days, hours, minutes, seconds } = useCountdown(DEADLINE);

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="container mx-auto relative px-4 pb-10 pt-12 md:pb-14 md:pt-18">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Gift className="size-4" />
            Limited to 1,000 spots · $5 / ₦5,000 · Christmas 2026
          </span>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            Make this Christmas{" "}
            <span className="text-primary">a memory worth keeping</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Claim one of 1,000 spots and unlock the full NextVibe MEGA bundle —
            VibeTags, Postcards, Gamification and VibePod — for your Christmas
            event. Pay once, publish free.
          </p>

          {/* Price */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-3xl font-bold md:text-4xl">
              <span className="text-primary">$5</span>
              <span className="mx-2 text-muted-foreground text-xl">/</span>
              <span className="text-primary">₦5,000</span>
            </p>
            <p className="text-sm text-muted-foreground">
              One spot. Full MEGA bundle. No further cost to publish your event.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Offer closes Christmas Day
            </p>
            <div className="flex items-center gap-2">
              <CountdownUnit value={days} label="days" />
              <span className="text-xl font-bold text-muted-foreground mb-1">:</span>
              <CountdownUnit value={hours} label="hrs" />
              <span className="text-xl font-bold text-muted-foreground mb-1">:</span>
              <CountdownUnit value={minutes} label="min" />
              <span className="text-xl font-bold text-muted-foreground mb-1">:</span>
              <CountdownUnit value={seconds} label="sec" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              onClick={onScrollToFunnel}
              className="w-full sm:w-auto gap-2"
            >
              Claim my Christmas spot
              <ArrowRight className="size-4" />
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              Secure checkout via Bachs · Code arrives by email after payment
            </p>
          </div>

          {/* Hero image */}
          <div className="mt-2 w-full overflow-hidden rounded-3xl border border-border shadow-lg">
            <Image
              src="/images/thanksgiving-hero.jpg"
              alt="A family celebrating Christmas together"
              width={1024}
              height={576}
              className="w-full object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
