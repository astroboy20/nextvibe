"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Rocket,
  Mail,
  Calendar,
  Sparkles,
  Users,
  Zap,
  Music,
  Camera,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useWaitlistMutation } from "@/app/provider/api/launchApi";
import { Spinner } from "@/components/ui/spinner";

function useCountdown(targetDate: Date) {
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - new Date().getTime();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative flex flex-col items-center justify-center rounded-2xl bg-white/60 glass p-6 sm:p-8 w-20 sm:w-28 md:w-32 shadow-elevated"
    >
      <div className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-primary tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </motion.div>
  );
}

const teaserFeatures = [
  {
    icon: Calendar,
    label: "Event Discovery",
    desc: "Find events that match your vibe",
  },
  {
    icon: Camera,
    label: "Memory Bank",
    desc: "Capture and share event memories",
  },
  {
    icon: Gamepad2,
    label: "Play Games",
    desc: "Trivia, puzzles & live leaderboards",
  },
  { icon: Music, label: "VibeTags", desc: "Curated music & event moments" },
  { icon: Users, label: "Connect", desc: "Meet your tribe at events" },
  { icon: Zap, label: "Rewards", desc: "Earn points and unlock perks" },
];

export default function LaunchLanding() {
  const launchDate = new Date("2026-07-01T00:00:00");
  const timeLeft = useCountdown(launchDate);
  const [email, setEmail] = useState("");

  const [waitlistMutation, { isLoading }] = useWaitlistMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed) {
      toast.warning("Please enter your email address");
      return;
    }
    if (!emailRegex.test(trimmed)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    try {
      await waitlistMutation({ email: trimmed }).unwrap();
      toast.success("You're on the list! 🎉 We'll notify you at launch.");
      setEmail("");
    } catch (error: any) {
      const msg =
        error?.data?.message ??
        error?.data?.error?.message ??
        error?.message ??
        "Something went wrong. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="container mx-auto max-w-5xl flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Something big is coming
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight"
            >
              Nextvibe is
              <br />
              <span className="text-gradient">launching soon</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg sm:text-xl text-muted-foreground"
            >
              The ultimate event discovery and memory platform. Discover, play,
              capture, and connect — all in one place.
            </motion.p>

            {/* Countdown */}
            <motion.div
              id="countdown"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
              <CountdownUnit value={timeLeft.days} label="Days" />
              <CountdownUnit value={timeLeft.hours} label="Hours" />
              <CountdownUnit value={timeLeft.minutes} label="Minutes" />
              <CountdownUnit value={timeLeft.seconds} label="Seconds" />
            </motion.div>

            {/* Date label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm text-[#5b1a57] font-bold "
            >
              Launching July 1, 2026
            </motion.p>

            {/* Notify Me */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 w-full max-w-md"
            >
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-white/70 backdrop-blur border-border/50 focus-visible:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Adding you…
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Notify Me
                    </>
                  )}
                </Button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Be the first to know. No spam, ever.
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            id="features"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="container mx-auto max-w-5xl mt-24 mb-12 px-4"
          >
            <h2 className="text-center font-display text-2xl sm:text-3xl font-bold mb-10">
              What&apos;s <span className="text-gradient">coming</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {teaserFeatures.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl bg-white/60 glass p-6 text-left shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">
                    {feature.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA to Pledge page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container mx-auto max-w-2xl px-4 mb-16 text-center"
          >
            <div className="rounded-3xl bg-linear-to-br from-primary/10 to-vibe-purple/10 border border-primary/20 p-8 sm:p-10">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                Back us before launch
              </h3>
              <p className="text-muted-foreground mb-6">
                Get exclusive early-backer tiers, 3× bundles for the price of 1,
                and become a founding member of NextVibe.
              </p>
              <Button asChild size="lg" className="rounded-xl px-8 h-12">
                <Link href="/pledge">
                  View pledge tiers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
