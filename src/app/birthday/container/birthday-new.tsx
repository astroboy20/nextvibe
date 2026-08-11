"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import {
  Cake, Tag, Gamepad2, Camera, Users, BarChart3, Check, Star,
  Sparkles, ShieldCheck, ArrowRight, Clock, Heart, Music, Briefcase, PartyPopper,
  Play, Timer, Smartphone, Link2, Archive, Lock, Images, MessageSquareHeart,
  Loader2, CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type CampaignTier,
  type TierQuote,
  useGetBirthdayStatsQuery,
  useLazyGetBirthdayQuoteQuery,
  useSignupBirthdayMutation,
} from "@/app/provider/api/campaignApi";

// ─── Constants ────────────────────────────────────────────────────────────────
const SPOTS_TOTAL = 1000;
// Deadline = 30 days from the moment the module first loads
const DEADLINE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const YOUTUBE_ID = "pAJ23LBFBOQ";
const VIDEO_DURATION = "2";
const CTA_LABEL = "Secure my birthday Vibe";

// ─── Tier definitions ─────────────────────────────────────────────────────────
interface TierDef {
  id: CampaignTier;
  label: string;
  capacity: string;
  tagline: string;
}

const TIERS: TierDef[] = [
  { id: "MICRO",      label: "Micro",      capacity: "Up to 50 guests",    tagline: "Intimate gathering" },
  { id: "SMALL",      label: "Small",      capacity: "Up to 200 guests",   tagline: "Most popular" },
  { id: "MEDIUM",     label: "Medium",     capacity: "Up to 500 guests",   tagline: "Mid-size event" },
  { id: "LARGE",      label: "Large",      capacity: "Up to 1,000 guests", tagline: "Big celebration" },
  { id: "ENTERPRISE", label: "Enterprise", capacity: "1,000+ guests",      tagline: "Mega event" },
];

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const categories = [
  { id: "birthday",    label: "Birthday",       icon: Cake,        note: "Most popular" },
  { id: "wedding",     label: "Wedding",         icon: Heart },
  { id: "concert",     label: "Concert",         icon: Music },
  { id: "corporate",   label: "Corporate",       icon: Briefcase },
  { id: "house-party", label: "House Party",     icon: PartyPopper },
  { id: "other",       label: "Something else",  icon: Sparkles },
];

const proofStrip = [
  { icon: Timer,      label: "Setup takes about 4 minutes" },
  { icon: Smartphone, label: "Guests install nothing" },
  { icon: Link2,      label: "One VibeTag for the whole celebration" },
  { icon: Archive,    label: "Photos and messages stay together after the day" },
];

const steps = [
  { n: "01", title: "Create your birthday Vibe",     desc: "Set up the celebration and customise the experience in a few minutes.", icon: Cake },
  { n: "02", title: "Share one VibeTag",              desc: "Send one simple tag or link to guests before and during the birthday.",  icon: Tag },
  { n: "03", title: "Keep every memory together",    desc: "Guest photos, videos, postcards and interactions land in one organised memory bank.", icon: Images },
];

const hostBenefits = [
  "One organised memory bank",
  "More guest photos and videos",
  "Birthday trivia and engagement",
  "Guest activity insights",
  "Permanent access to the celebration",
];

const guestBenefits = [
  "No app installation",
  "Simple photo and video sharing",
  "Birthday trivia and games",
  "Postcards and personal messages",
  "A way to connect before and during the event",
];

const features = [
  { icon: Camera,     title: "Permanent birthday gallery", brand: "NextVibePulse", desc: "Every guest photo, video and postcard stays together in one lasting memory bank." },
  { icon: Tag,        title: "One memorable sharing tag",  brand: "VibeTags",      desc: "Replace scattered WhatsApp uploads and forgotten hashtags with one trackable tag." },
  { icon: Gamepad2,   title: "Birthday trivia",            brand: "NextVibePilot", desc: "Build excitement with questions like \"How well do you know the celebrant?\"" },
  { icon: Users,      title: "Guest conversations",        brand: "VibePod",       desc: "Give guests a place to meet and interact before the celebration begins." },
  { icon: BarChart3,  title: "Event insights",             brand: "Analytics",     desc: "See participation and engagement from the people who joined the Vibe." },
  { icon: ShieldCheck,title: "Founder pricing",            brand: "Secured Spot",  desc: "Lock the promotional price for this birthday package, per the offer terms." },
];

const included = [
  "Pre-event VibeTag (custom designed)",
  "Unlimited postcards from every guest",
  "Full gamification suite with live leaderboards",
  "VibePod guest social layer",
  "Permanent Pulse gallery",
  "Host analytics dashboard",
  "Redemption code to publish your event free",
];

const offerFacts = [
  "Pay 50% deposit now to lock your spot",
  "Get a redemption code instantly",
  "Use the code to publish your event free",
  "An approximate event date is required",
  "Guests pay nothing and install nothing",
  "Offer ends at the deadline or when 1,000 spots are claimed",
];

const testimonials = [
  { name: "Femi A.",   role: "30th birthday host",   location: "Lekki, Lagos",  quote: "I collected 214 photos from my guests. The previous year, I only received nine through WhatsApp.", initials: "FA" },
  { name: "Adaeze O.", role: "Surprise party host",  location: "Yaba, Lagos",   quote: "The trivia had everybody screaming. Best ₦5,000 I have ever spent on a party.",                   initials: "AO" },
  { name: "Zainab M.", role: "Twins' birthday host", location: "Ikoyi, Lagos",  quote: "Setup took four minutes. The gallery still makes me cry every time I open it.",                    initials: "ZM" },
];

const faqs = [
  { q: "What exactly do I pay today?",            a: "A 50% deposit of your chosen tier's event package price. Your redemption code locks in the remaining 50% — you pay nothing more when you publish your event." },
  { q: "How do I use my redemption code?",        a: "When you're ready to publish your event on NextVibe, enter your redemption code at checkout. It makes the event free to publish — one use, same tier you paid for." },
  { q: "Why is it 50% off?",                      a: "We are onboarding our first 1,000 paying hosts. You get founder pricing, we get real celebrations to grow with." },
  { q: "When does the price go back up?",         a: "The moment the 1,000th spot is claimed, or at the deadline shown on this page — whichever comes first." },
  { q: "Do I need my event date now?",            a: "An approximate date is enough. It lets us time your setup reminders and event-day support." },
  { q: "Do guests need to pay or install anything?", a: "No. They open your VibeTag link in any browser and start capturing." },
  { q: "Is my birthday gallery private?",         a: "Yes. Your gallery is tied to your VibeTag and only people with the link can view or contribute." },
  { q: "How do guests join?",                     a: "You share one VibeTag link — on WhatsApp, an invite card or a QR code at the venue. One tap and they are in." },
  { q: "Can guests upload videos?",               a: "Yes. Photos and short videos are both supported as postcards." },
  { q: "Is there an upload or guest limit?",      a: "Guests are based on pricing tier. Each guest can add up to 20 postcards per event so the gallery stays browsable." },
  { q: "What happens to the gallery after the birthday?", a: "It stays live as your permanent memory bank — you keep access and can revisit or download it later." },
  { q: "What is the cancellation or refund policy?", a: "Cancel before your VibeTag is designed and we refund in full. After setup begins we can move your date instead." },
];

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BirthdayFunnel() {
  const { days, hours, minutes, seconds } = useCountdown(DEADLINE);

  // Live campaign stats
  const { data: stats } = useGetBirthdayStatsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const spotsLeft  = stats?.spotsRemaining ?? (SPOTS_TOTAL - 736);
  const signedUp   = stats?.signedUp       ?? 736;
  const claimedPct = Math.min(100, (signedUp / SPOTS_TOTAL) * 100);
  const isFull     = stats?.isFull         ?? false;

  // Funnel state
  const [step, setStep]               = useState(1);
  const [category, setCategory]       = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<CampaignTier | null>(null);
  const [tierQuote, setTierQuote]     = useState<TierQuote | null>(null);
  const [email, setEmail]             = useState("");
  const [name, setName]               = useState("");
  const [eventDate, setEventDate]     = useState<Date | undefined>(undefined);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const totalSteps = 5;
  const heroRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // RTK hooks
  const [triggerQuote, { isFetching: quoteLoading }] = useLazyGetBirthdayQuoteQuery();
  const [signupBirthday, { isLoading: submitting }]  = useSignupBirthdayMutation();

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const scrollToFunnel = () => scrollTo("funnel");

  const pickCategory = (id: string) => {
    setCategory(id);
    setStep(2);
    scrollToFunnel();
  };

  const pickTier = async (tierId: CampaignTier) => {
    setSelectedTier(tierId);
    try {
      const q = await triggerQuote(tierId).unwrap();
      setTierQuote(q);
    } catch {
      toast.error("Could not load pricing — please try again");
      return;
    }
    setStep(3);
    scrollToFunnel();
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !name.trim()) {
      toast.error("Add your name and a real email so we can send your code");
      return;
    }
    setStep(4);
  };

  const submitDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) {
      toast.error("Pick your event date — it sets up your reminders");
      return;
    }
    setStep(5);
  };

  const pay = async () => {
    if (!selectedTier || !email || !eventDate) return;
    const eventDateStr = format(eventDate, "yyyy-MM-dd");
    try {
      const res = await signupBirthday({ email, tier: selectedTier, eventDate: eventDateStr }).unwrap();
      localStorage.setItem("bday_paymentId", res.paymentId);
      window.location.href = res.checkoutUrl;
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string }; message?: string };
      if (e?.status === 409) toast.error("This email already has a confirmed spot.");
      else if (e?.status === 400) toast.error("All 1,000 spots have been claimed!");
      else toast.error(e?.data?.message ?? e?.message ?? "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">

      {/* ── Header ── */}
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
            <Button size="sm" onClick={scrollToFunnel} disabled={isFull}>
              {isFull ? "Fully booked" : "Claim spot"}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="border-b border-border/50 py-12 md:py-20 lg:py-28">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center"
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl"
            >
              Your birthday celebration deserves more than 9 photos
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              Collect every photo, video, message and moment from your birthday in one private
              memory bank. Your guests join with one VibeTag — no app download required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-base font-medium text-muted-foreground line-through">Full price</span>
                <span className="text-2xl font-bold text-primary md:text-3xl">50% deposit</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pay 50% now · Get a redemption code · Publish your event free
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="flex flex-col items-center gap-3 sm:flex-row"
            >
              <Button size="lg" onClick={scrollToFunnel} disabled={isFull} className="w-full sm:w-auto">
                {CTA_LABEL}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo("video")}
                className="w-full sm:w-auto"
              >
                <Play className="size-4" />
                Watch how it works
              </Button>
            </motion.div>

            {/* Urgency card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="mt-4 w-full max-w-sm rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
                <Clock className="size-3.5" />
                Offer ends in
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: days,    l: "Days" },
                  { v: hours,   l: "Hrs" },
                  { v: minutes, l: "Min" },
                  { v: seconds, l: "Sec" },
                ].map((t) => (
                  <div key={t.l} className="rounded-lg border border-border bg-secondary/40 py-2.5 text-center">
                    <p className="text-xl font-bold tabular-nums md:text-2xl">
                      {String(t.v).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.l}</p>
                  </div>
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

      {/* ── Video ── */}
      <section id="video" className="border-b border-border/50 py-12 md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h2 className="text-xl font-bold md:text-2xl">See how NextVibe works</h2>
            <p className="mt-2 text-xs text-muted-foreground md:text-sm">
              From guest photos to birthday trivia — one VibeTag handles it all.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="relative aspect-video w-full bg-black">
              {/* Thumbnail / play state */}
              {!videoPlaying && (
                <button
                  type="button"
                  onClick={() => setVideoPlaying(true)}
                  aria-label="Play the NextVibe product tour"
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-3"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                    alt="NextVibe product tour thumbnail"
                    className="absolute inset-0 size-full object-cover opacity-70"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative flex size-16 items-center justify-center rounded-full border border-white/40 bg-white/90 text-primary shadow-md transition-transform group-hover:scale-105">
                    <Play className="size-6 translate-x-0.5 fill-current" />
                  </div>
                  <p className="relative text-sm font-semibold text-white drop-shadow-md">
                    Play the {VIDEO_DURATION}-minute product tour
                  </p>
                </button>
              )}

              {/* iframe — rendered but hidden until play so it can preload */}
              <iframe
                className={`absolute inset-0 size-full rounded-xl transition-opacity duration-300 ${videoPlaying ? "opacity-100" : "pointer-events-none opacity-0"}`}
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=${videoPlaying ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`}
                title="NextVibe product tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />

              {/* Pause overlay — shown when playing, click returns to thumbnail */}
              {videoPlaying && (
                <button
                  type="button"
                  onClick={() => setVideoPlaying(false)}
                  aria-label="Stop video"
                  className="group absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
                >
                  <span className="flex size-4 items-center justify-center">
                    <span className="flex gap-0.5">
                      <span className="h-3 w-1 rounded-sm bg-white" />
                      <span className="h-3 w-1 rounded-sm bg-white" />
                    </span>
                  </span>
                  Stop
                </button>
              )}
            </div>
          </motion.div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            No signup required to watch
          </p>
          <div className="mt-5 text-center">
            <Button size="lg" onClick={scrollToFunnel} disabled={isFull} className="w-full sm:w-auto">
              {CTA_LABEL}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Proof strip ── */}
      <section className="border-b border-border/50 py-8">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {proofStrip.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5">
                  <Icon className="size-4 shrink-0 text-primary" />
                  <p className="text-xs font-medium leading-snug">{p.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            How NextVibe works
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-border">{s.n}</span>
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Benefits split ── */}
      <section className="border-y border-border/50 bg-secondary/20 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            Why everyone joins in
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "For the birthday host", icon: Cake,               items: hostBenefits },
              { title: "For your guests",        icon: MessageSquareHeart, items: guestBenefits },
            ].map((col, i) => {
              const Icon = col.icon;
              return (
                <motion.div
                  key={col.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="text-sm font-semibold">{col.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-2.5" />
                        </div>
                        <span className="text-xs leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center md:mb-12"
          >
            <h2 className="text-xl font-bold md:text-2xl">Everything included</h2>
            <p className="mt-2 text-xs text-muted-foreground md:text-sm">
              The full stack. No add-ons, no upsells, no watermark.
            </p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex gap-3.5 rounded-lg border border-border bg-card p-4 md:p-5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      {f.title}{" "}
                      <span className="font-normal text-primary">— {f.brand}</span>
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-y border-border/50 bg-secondary/20 py-12 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            Hosts who already vibed
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:p-5"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="flex-1 text-xs italic leading-relaxed">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-2.5 border-t border-border pt-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold text-primary">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.role} · {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing + urgency ── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            Lock your spot before it&apos;s gone
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Offer details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 md:p-6"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                What you pay
              </p>
              <p className="text-2xl font-bold text-primary">50% deposit</p>
              <ul className="flex flex-col gap-2.5">
                {offerFacts.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-2.5" />
                    </div>
                    <span className="text-xs leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                Your gallery stays private to people with your VibeTag link.
              </p>
            </motion.div>

            {/* Countdown + included */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 md:p-6"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Clock className="size-3.5" />
                Offer closes in
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: days,    l: "Days" },
                  { v: hours,   l: "Hrs" },
                  { v: minutes, l: "Min" },
                  { v: seconds, l: "Sec" },
                ].map((t) => (
                  <div key={t.l} className="rounded-lg border border-border bg-secondary/40 py-2.5 text-center">
                    <p className="text-xl font-bold tabular-nums md:text-2xl">
                      {String(t.v).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.l}</p>
                  </div>
                ))}
              </div>
              <Progress value={claimedPct} />
              <p className="text-xs text-muted-foreground">
                {signedUp} of {SPOTS_TOTAL} spots claimed —{" "}
                <span className="font-semibold text-foreground">{spotsLeft} left</span>
              </p>
              <div className="flex flex-col gap-2">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check className="size-3.5 shrink-0 text-primary" />
                    <p className="text-xs">{item}</p>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={scrollToFunnel} disabled={isFull} className="mt-auto w-full">
                {isFull ? "Fully booked" : CTA_LABEL}
                {!isFull && <ArrowRight className="size-4" />}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Funnel ── */}
      <section id="funnel" className="border-y border-border/50 bg-secondary/20 py-12 md:py-20">
        <div className="container mx-auto max-w-lg px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-center text-xl font-bold md:mb-10 md:text-2xl"
          >
            Secure your spot in {totalSteps} steps
          </motion.h2>

              {/* Progress bar */}
              <div className="mb-3 flex items-center gap-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      step >= s ? "bg-primary" : "bg-border",
                    )}
                  />
                ))}
              </div>
              <p className="mb-6 text-center text-xs text-muted-foreground">
                Step {step} of {totalSteps}
              </p>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-border bg-card p-5 md:p-7"
              >
                {/* Step 1 — Category */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold">What are you celebrating?</h3>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {categories.map((c, i) => {
                        const Icon = c.icon;
                        return (
                          <motion.button
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05, duration: 0.25 }}
                            type="button"
                            onClick={() => pickCategory(c.id)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 text-center transition-all hover:border-primary hover:bg-primary/5",
                              category === c.id && "border-primary bg-primary/5 ring-1 ring-primary/20",
                            )}
                          >
                            <Icon className="size-4.5 text-primary" />
                            <span className="text-xs font-medium">{c.label}</span>
                            {c.note && (
                              <span className="text-[10px] font-medium text-primary">{c.note}</span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2 — Tier */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold">Pick your event size</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tier determines your deposit amount and locks in your package.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {TIERS.map((t, i) => (
                        <motion.button
                          key={t.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.25 }}
                          type="button"
                          disabled={quoteLoading && selectedTier === t.id}
                          onClick={() => pickTier(t.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3.5 text-left transition-all hover:border-primary hover:bg-primary/5",
                            selectedTier === t.id && "border-primary bg-primary/5 ring-1 ring-primary/20",
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.capacity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {t.tagline && (
                              <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                                {t.tagline}
                              </span>
                            )}
                            {quoteLoading && selectedTier === t.id ? (
                              <Loader2 className="size-4 animate-spin text-primary" />
                            ) : (
                              <ArrowRight className="size-4 text-muted-foreground" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)}>
                      Back
                    </Button>
                  </div>
                )}

                {/* Step 3 — Contact details */}
                {step === 3 && (
                  <form onSubmit={submitDetails} className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold">Where do we send your code?</h3>
                      {tierQuote && (
                        <div className="mt-2 inline-flex items-baseline gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                          <span>{formatNaira(tierQuote.amountDue)} deposit</span>
                          <span className="opacity-50">·</span>
                          <span className="line-through opacity-60">{formatNaira(tierQuote.baseAmount)} full price</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="funnel-name" className="text-xs">Your name</Label>
                      <Input
                        id="funnel-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Similoluwa"
                        className="h-10 text-sm"
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
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)} className="w-20">
                        Back
                      </Button>
                      <Button type="submit" size="sm" className="flex-1">
                        Continue
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 4 — Event date */}
                {step === 4 && (
                  <form onSubmit={submitDate} className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold">When is the party?</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        We&apos;ll time your setup reminders and event-day support around this date.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Event date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-10 w-full justify-start text-left text-sm font-normal",
                              !eventDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4 shrink-0" />
                            {eventDate
                              ? format(eventDate, "dd MMMM yyyy")
                              : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={eventDate}
                            onSelect={setEventDate}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const maxDate = new Date(2027, 8, 1);
                              return date < today || date > maxDate;
                            }}
                            fromDate={new Date()}
                            toDate={new Date(2027, 8, 1)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-2.5">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStep(3)} className="w-20">
                        Back
                      </Button>
                      <Button type="submit" size="sm" className="flex-1">
                        Continue
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 5 — Confirm & pay */}
                {step === 5 && (
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold">Confirm and pay deposit</h3>

                    <div className="space-y-2.5 rounded-lg border border-border bg-secondary/20 p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Celebration</span>
                        <span className="font-medium capitalize">
                          {categories.find((c) => c.id === category)?.label ?? "Birthday"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tier</span>
                        <span className="font-medium">
                          {TIERS.find((t) => t.id === selectedTier)?.label} —{" "}
                          {TIERS.find((t) => t.id === selectedTier)?.capacity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Email</span>
                        <span className="truncate font-medium">{email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Event date</span>
                        <span className="font-medium">
                          {eventDate ? format(eventDate, "dd MMMM yyyy") : "—"}
                        </span>
                      </div>
                      {tierQuote && (
                        <>
                          <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
                            <span className="text-muted-foreground">Full package value</span>
                            <span className="font-medium text-muted-foreground line-through">
                              {formatNaira(tierQuote.baseAmount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Deposit today ({tierQuote.depositPercent}%)
                            </span>
                            <span className="text-lg font-bold text-primary">
                              {formatNaira(tierQuote.amountDue)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      {included.map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-2.5" />
                          </div>
                          <p className="text-xs leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="lg"
                      onClick={pay}
                      disabled={submitting || isFull}
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Redirecting to checkout…
                        </>
                      ) : isFull ? (
                        "Campaign fully booked"
                      ) : (
                        <>
                          Pay {tierQuote ? formatNaira(tierQuote.amountDue) : "deposit"} &amp; secure my spot
                        </>
                      )}
                    </Button>

                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3.5" />
                      Secure checkout via Ercaspay
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(4)}
                      className="mx-auto flex"
                    >
                      Back
                    </Button>
                  </div>
                )}
              </motion.div>
          </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl"
          >
            Quick answers
          </motion.h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
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

      {/* ── Final CTA ── */}
      <section className="pb-12 md:pb-20">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-5 rounded-xl border border-primary/30 bg-primary p-8 text-center md:gap-6 md:p-10"
          >
            <h2 className="text-xl font-bold text-primary-foreground md:text-2xl">
              {isFull
                ? "All 1,000 spots are gone."
                : `${spotsLeft} spots left. Then it's full price.`}
            </h2>
            <p className="text-xs text-primary-foreground/80 md:text-sm">
              Lock your founder deposit for your next celebration. Setup takes 4 minutes.
            </p>
            {!isFull && (
              <Button
                variant="secondary"
                size="lg"
                onClick={scrollToFunnel}
                className="w-full sm:w-auto"
              >
                {CTA_LABEL}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Mobile sticky CTA ── */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 p-3 backdrop-blur-sm md:hidden">
          <div className="min-w-0">
            <p className="text-sm font-bold leading-none text-primary">50% deposit</p>
            <p className="text-[10px] text-muted-foreground">{spotsLeft} left</p>
          </div>
          <Button size="lg" className="flex-1" onClick={scrollToFunnel} disabled={isFull}>
            {isFull ? "Fully booked" : "Secure my spot"}
          </Button>
        </div>
      )}
    </div>
  );
}
