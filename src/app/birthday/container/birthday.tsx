"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Cake,
  Tag,
  Gamepad2,
  Camera,
  Users,
  BarChart3,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Heart,
  Music,
  Briefcase,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SPOTS_TOTAL = 1000;
const SPOTS_TAKEN = 736;
const DEADLINE = new Date("2026-09-30T23:59:59+01:00");

const categories = [
  { id: "birthday", label: "Birthday", icon: Cake, note: "Most popular" },
  { id: "wedding", label: "Wedding", icon: Heart },
  { id: "concert", label: "Concert", icon: Music },
  { id: "corporate", label: "Corporate", icon: Briefcase },
  { id: "house-party", label: "House Party", icon: PartyPopper },
  { id: "other", label: "Something else", icon: Sparkles },
];

const features = [
  {
    icon: Tag,
    title: "VibeTags",
    desc: "Your digital Aso-Ebi. One trackable tag replaces the hashtag nobody remembers.",
  },
  {
    icon: Gamepad2,
    title: "NextVibePilot",
    desc: 'AI trivia like "How well do you know the celebrant?" — hype starts days before.',
  },
  {
    icon: Camera,
    title: "NextVibePulse",
    desc: "A permanent gallery of every postcard your guests capture. Nothing gets lost.",
  },
  {
    icon: Users,
    title: "VibePod",
    desc: "Guests meet and chat before they even arrive. No awkward corners.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "See who came, who vibed, and who to invite next year.",
  },
  {
    icon: ShieldCheck,
    title: "Secured Spot",
    desc: "Locked-in ₦5,000 price for life on this event package.",
  },
];

const included = [
  "Pre-event VibeTag (custom designed)",
  "Postcards from every guest",
  "Full gamification suite with live leaderboards",
  "VibePod guest social layer",
  "Permanent Pulse gallery",
  "Host analytics dashboard",
];

const testimonials = [
  {
    name: "Femi A.",
    role: "30th in Lekki",
    quote: "I got 214 photos from my guests. Last year I got 9 on WhatsApp.",
  },
  {
    name: "Adaeze O.",
    role: "Surprise party host",
    quote: "The trivia had everybody screaming. Best ₦5,000 I have ever spent.",
  },
  {
    name: "Zainab M.",
    role: "Twins' birthday",
    quote: "Setup took 4 minutes. The gallery still makes me cry.",
  },
];

const faqs = [
  {
    q: "What exactly do I pay for?",
    a: "One full NextVibe event package — VibeTag, postcards, gamification, VibePod and analytics — at ₦5,000 instead of ₦10,000.",
  },
  {
    q: "Why is it 50% off?",
    a: "We are onboarding our first 1,000 paying hosts. You get founder pricing, we get real Lagos events to grow with.",
  },
  {
    q: "When does the price go back up?",
    a: "The moment the 1,000th spot is claimed, or at the deadline — whichever comes first.",
  },
  {
    q: "Do I need my event date now?",
    a: "Yes, an approximate date is enough. It lets us time your setup reminders and event-day support.",
  },
  {
    q: "Do my guests need to pay or install anything?",
    a: "No. They open your VibeTag link in any browser and start capturing.",
  },
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

export default function BirthdayFunnel() {
  const router = useRouter();
  const { days, hours, minutes, seconds } = useCountdown(DEADLINE);

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const spotsLeft = SPOTS_TOTAL - SPOTS_TAKEN;
  const claimedPct = useMemo(() => (SPOTS_TAKEN / SPOTS_TOTAL) * 100, []);

  const scrollToFunnel = () =>
    document.getElementById("funnel")?.scrollIntoView({ behavior: "smooth" });

  const pickCategory = (id: string) => {
    setCategory(id);
    setStep(2);
    scrollToFunnel();
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !name.trim()) {
      toast.error("Add your name and a real email so we can send your VibeTag");
      return;
    }
    setStep(3);
  };

  const submitDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) {
      toast.error("Pick your event date — it sets up your reminders");
      return;
    }
    setStep(4);
  };

  const pay = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success("Spot reserved. Checkout opens once payment goes live.");
    setTimeout(() => router.push("/auth"), 1200);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Image
            src="/logos/new/logo_black_text.png"
            alt="NextVibe"
            width={120}
            height={48}
            className="h-12 w-auto"
          />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-primary sm:inline">
              {spotsLeft} spots left
            </span>
            <Button size="sm" variant="hero" onClick={scrollToFunnel}>
              Claim ₦5,000
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vibe-plum-light via-background to-vibe-pink/10" />
        <div className="absolute -left-10 top-10 size-64 rounded-full bg-vibe-purple/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 size-64 rounded-full bg-vibe-cyan/20 blur-3xl" />

        <div className="container mx-auto relative px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Cake className="size-4" />
              First 1,000 birthdays only — 50% off
            </span>

            <h1 className="font-display text-5xl font-extrabold leading-[1.03] md:text-7xl lg:text-8xl">
              Your event deserves
              <br />
              <span className="text-gradient">more than 9 photos.</span>
            </h1>

            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              NextVibe turns your party into a memory bank — every guest
              capturing, playing and posting under one VibeTag. Set it up in 4
              minutes.
            </p>

            <div className="flex flex-col items-center gap-2">
              <p className="font-display text-3xl font-bold md:text-4xl">
                <span className="text-muted-foreground line-through">
                  ₦10,000
                </span>{" "}
                <span className="text-primary">₦5,000</span>
              </p>
              <p className="text-sm text-muted-foreground">
                One event. Everything included. No card saved.
              </p>
            </div>

            <Button
              variant="hero"
              size="xl"
              onClick={scrollToFunnel}
              className="w-full sm:w-auto"
            >
              Secure My Spot
              <ArrowRight className="size-5" />
            </Button>

            {/* Urgency block */}
            <div className="w-full max-w-xl rounded-2xl bg-card p-5 shadow-card">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                <Clock className="size-4" />
                Offer closes in
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { v: days, l: "Days" },
                  { v: hours, l: "Hrs" },
                  { v: minutes, l: "Min" },
                  { v: seconds, l: "Sec" },
                ].map((t) => (
                  <div key={t.l} className="rounded-xl bg-secondary/60 py-3">
                    <p className="font-display text-2xl font-bold md:text-3xl">
                      {String(t.v).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.l}</p>
                  </div>
                ))}
              </div>
              <Progress value={claimedPct} className="mt-4" />
              <p className="mt-2 text-sm text-muted-foreground">
                {SPOTS_TAKEN} of {SPOTS_TOTAL} spots claimed — only{" "}
                <span className="font-semibold text-primary">
                  {spotsLeft} left
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Funnel */}
      <section
        id="funnel"
        className="border-y border-border/50 bg-secondary/40 py-20 md:py-28"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-display text-4xl font-bold md:text-5xl">
              Secure your spot in <span className="text-gradient">4 steps</span>
            </h2>

            <div className="mt-8 flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    step >= s ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Step {step} of 4
            </p>

            <div className="mt-8 rounded-3xl bg-card p-6 shadow-elevated md:p-10">
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <h3 className="font-display text-2xl font-bold md:text-3xl">
                    What are you celebrating?
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((c) => {
                      const Icon = c.icon;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => pickCategory(c.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-card-hover",
                            category === c.id && "border-primary bg-primary/5"
                          )}
                        >
                          <Icon className="size-6 text-primary" />
                          <span className="font-semibold">{c.label}</span>
                          {c.note && (
                            <span className="text-xs font-medium text-primary">
                              {c.note}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={submitDetails} className="flex flex-col gap-6">
                  <h3 className="font-display text-2xl font-bold md:text-3xl">
                    Where do we send your VibeTag?
                  </h3>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="funnel-name">Your name</Label>
                    <Input
                      id="funnel-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Similoluwa"
                      className="h-14 text-base"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="funnel-email">Email</Label>
                    <Input
                      id="funnel-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="h-14 text-base"
                    />
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="size-5" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={submitDate} className="flex flex-col gap-6">
                  <h3 className="font-display text-2xl font-bold md:text-3xl">
                    When is the party?
                  </h3>
                  <p className="text-muted-foreground">
                    We time your setup reminders and event-day support around
                    this date.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="funnel-date">Event date</Label>
                    <Input
                      id="funnel-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="h-14 text-base"
                    />
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="size-5" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <h3 className="font-display text-2xl font-bold md:text-3xl">
                    Confirm and lock ₦5,000
                  </h3>
                  <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Celebration</span>
                      <span className="font-semibold capitalize">
                        {categories.find((c) => c.id === category)?.label ??
                          "Birthday"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Email</span>
                      <span className="truncate font-semibold">{email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Event date</span>
                      <span className="font-semibold">{eventDate}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                      <span className="text-muted-foreground">Total today</span>
                      <span className="font-display text-2xl font-bold text-primary">
                        ₦5,000
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {included.map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </div>
                        <p>{i}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="hero"
                    size="xl"
                    onClick={pay}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Reserving..."
                      : "Pay ₦5,000 & Secure My Spot"}
                  </Button>
                  <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Secure local checkout via Ercaspay
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold md:text-6xl">
              What ₦5,000{" "}
              <span className="text-gradient">actually gets you</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              The full stack. No add-ons, no upsells, no watermark.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex gap-4 rounded-2xl bg-card p-6 shadow-card"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border/50 bg-secondary/40 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-4xl font-bold md:text-6xl">
            Hosts who <span className="text-gradient">already vibed</span>
          </h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-card"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-lg italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-primary">— {t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-display text-4xl font-bold md:text-5xl">
              Quick answers
            </h2>
            <Accordion type="single" collapsible className="mt-10">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-3xl bg-gradient-vibe p-8 text-center shadow-elevated md:p-12">
            <h2 className="font-display text-4xl font-extrabold text-primary-foreground md:text-5xl">
              {spotsLeft} spots. Then it's ₦10,000.
            </h2>
            <p className="text-lg text-primary-foreground/90 md:text-xl">
              Lock founder pricing for your next celebration. Setup takes 4
              minutes.
            </p>
            <Button
              variant="secondary"
              size="xl"
              onClick={scrollToFunnel}
              className="w-full sm:w-auto"
            >
              Secure My Spot
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border/50 bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold leading-none text-primary">
            ₦5,000
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {spotsLeft} spots left
          </p>
        </div>
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          onClick={scrollToFunnel}
        >
          Secure My Spot
        </Button>
      </div>
    </div>
  );
}
