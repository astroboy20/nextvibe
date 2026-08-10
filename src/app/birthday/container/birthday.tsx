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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:h-16">
          <Image
            src="/logos/new/logo_black_text.png"
            alt="NextVibe"
            width={100}
            height={40}
            className="h-8 w-auto md:h-10"
          />
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              {spotsLeft} spots left
            </span>
            <Button size="sm" onClick={scrollToFunnel}>
              Claim spot
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/50 py-12 md:py-20 lg:py-32">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center md:gap-10"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              <Cake className="size-3.5" />
              Limited to first 1,000 hosts
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            >
              Your birthday deserves more than 9 photos
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              NextVibe turns your party into a memory bank. Every guest captures, plays, and posts under one VibeTag. Setup takes 4 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-medium text-muted-foreground line-through md:text-xl">
                  ₦10,000
                </span>
                <span className="text-3xl font-bold text-primary md:text-4xl">
                  ₦5,000
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                One event · Everything included · No card needed
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <Button
                size="lg"
                onClick={scrollToFunnel}
                className="w-full sm:w-auto"
              >
                Secure my spot
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>

            {/* Urgency card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 w-full max-w-md rounded-xl border border-border bg-card p-4 md:mt-8 md:p-6"
            >
              <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium text-primary">
                <Clock className="size-3.5" />
                Offer ends in
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: days, l: "Days" },
                  { v: hours, l: "Hrs" },
                  { v: minutes, l: "Min" },
                  { v: seconds, l: "Sec" },
                ].map((t, i) => (
                  <motion.div
                    key={t.l}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.05, duration: 0.3 }}
                    className="rounded-lg border border-border bg-secondary/40 py-2.5"
                  >
                    <p className="text-xl font-bold tabular-nums md:text-2xl">
                      {String(t.v).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t.l}
                    </p>
                  </motion.div>
                ))}
              </div>
              <Progress value={claimedPct} className="mt-4" />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{spotsLeft}</span> of {SPOTS_TOTAL} spots remaining
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Funnel */}
      <section
        id="funnel"
        className="border-b border-border/50 bg-secondary/20 py-12 md:py-20 lg:py-32"
      >
        <div className="container mx-auto max-w-lg px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            Secure your spot in 4 steps
          </motion.h2>

          <div className="mb-4 flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <motion.div
                key={s}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: s * 0.1, duration: 0.3 }}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors origin-left",
                  step >= s ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>
          <p className="mb-6 text-center text-xs text-muted-foreground">
            Step {step} of 4
          </p>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border bg-card p-5 md:p-8"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  What are you celebrating?
                </h3>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {categories.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <motion.button
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => pickCategory(c.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 text-center transition-all hover:border-primary hover:bg-primary/5",
                          category === c.id && "border-primary bg-primary/5 ring-1 ring-primary/20"
                        )}
                      >
                        <Icon className="size-5 text-primary" />
                        <span className="text-xs font-medium">{c.label}</span>
                        {c.note && (
                          <span className="text-[10px] font-medium text-primary">
                            {c.note}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={submitDetails} className="space-y-5">
                <h3 className="text-lg font-semibold">
                  Where do we send your VibeTag?
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="funnel-name" className="text-xs">Your name</Label>
                  <Input
                    id="funnel-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Similoluwa"
                    className="h-11 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="funnel-email" className="text-xs">Email</Label>
                  <Input
                    id="funnel-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 text-sm"
                  />
                </div>
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="w-24"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={submitDate} className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">When is the party?</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We'll time your setup reminders and event-day support around this date.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="funnel-date" className="text-xs">Event date</Label>
                  <Input
                    id="funnel-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(2)}
                    className="w-24"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold">
                  Confirm and lock ₦5,000
                </h3>
                
                <div className="space-y-2.5 rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Celebration</span>
                    <span className="font-medium capitalize">
                      {categories.find((c) => c.id === category)?.label ?? "Birthday"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Email</span>
                    <span className="truncate font-medium">{email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Event date</span>
                    <span className="font-medium">{eventDate}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2.5">
                    <span className="text-xs text-muted-foreground">Total today</span>
                    <span className="text-xl font-bold text-primary">₦5,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {included.map((i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5" />
                      </div>
                      <p className="text-xs leading-relaxed">{i}</p>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  onClick={pay}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Reserving..." : "Pay ₦5,000 & secure my spot"}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Secure checkout via Ercaspay
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(3)}
                  className="mx-auto"
                >
                  Back
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center md:mb-16"
          >
            <h2 className="text-xl font-bold md:text-3xl">
              What ₦5,000 gets you
            </h2>
            <p className="mt-2 text-xs text-muted-foreground md:text-sm">
              The full stack. No add-ons, no upsells, no watermark.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex gap-3.5 rounded-lg border border-border bg-card p-4 md:p-5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/50 bg-secondary/20 py-12 md:py-20 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center text-xl font-bold md:mb-16 md:text-3xl"
          >
            Hosts who already vibed
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:p-5"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + idx * 0.05, duration: 0.3 }}
                    >
                      <Star className="size-3.5 fill-primary text-primary" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs italic leading-relaxed text-foreground">
                  "{t.quote}"
                </p>
                <div className="mt-1">
                  <p className="text-xs font-semibold text-primary">— {t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            Quick answers
          </motion.h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <AccordionItem
                  value={f.q}
                  className="rounded-lg border border-border bg-card px-4"
                >
                  <AccordionTrigger className="text-left text-xs font-medium hover:no-underline md:text-sm">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-12 md:pb-20 lg:pb-32">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-5 rounded-xl border border-primary/30 bg-primary p-8 text-center md:gap-6 md:p-10"
          >
            <h2 className="text-xl font-bold text-primary-foreground md:text-2xl">
              {spotsLeft} spots left. Then it's ₦10,000.
            </h2>
            <p className="text-xs text-primary-foreground/80 md:text-sm">
              Lock founder pricing for your next celebration. Setup takes 4 minutes.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={scrollToFunnel}
              className="w-full sm:w-auto"
            >
              Secure my spot
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background p-3 md:hidden">
        <div className="min-w-0">
          <p className="text-sm font-bold leading-none text-primary">₦5,000</p>
          <p className="text-[10px] text-muted-foreground">{spotsLeft} left</p>
        </div>
        <Button size="lg" className="flex-1" onClick={scrollToFunnel}>
          Secure my spot
        </Button>
      </div>
    </div>
  );
}
