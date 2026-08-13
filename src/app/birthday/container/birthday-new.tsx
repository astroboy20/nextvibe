"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
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
  Play,
  Timer,
  Smartphone,
  Link2,
  Archive,
  Lock,
  Images,
  MessageSquareHeart,
  Loader2,
  CalendarIcon,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
const DEADLINE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const YOUTUBE_ID = "pAJ23LBFBOQ";
const VIDEO_DURATION = "3";
const CTA_LABEL = "Secure my birthday Vibe";

// ─── Tier definitions ─────────────────────────────────────────────────────────
interface TierDef {
  id: CampaignTier;
  label: string;
  capacity: string;
  tagline: string;
}

const TIERS: TierDef[] = [
  {
    id: "MICRO",
    label: "Micro",
    capacity: "Up to 50 guests",
    tagline: "Intimate gathering",
  },
  {
    id: "SMALL",
    label: "Small",
    capacity: "Up to 200 guests",
    tagline: "Most popular",
  },
  {
    id: "MEDIUM",
    label: "Medium",
    capacity: "Up to 500 guests",
    tagline: "Mid-size event",
  },
  {
    id: "LARGE",
    label: "Large",
    capacity: "Up to 1,000 guests",
    tagline: "Big celebration",
  },
  {
    id: "ENTERPRISE",
    label: "Enterprise",
    capacity: "1,000+ guests",
    tagline: "Mega event",
  },
];

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// ─── Static data (identical to template) ─────────────────────────────────────
const categories = [
  { id: "birthday", label: "Birthday", icon: Cake, note: "Selected" },
  { id: "wedding", label: "Wedding", icon: Heart },
  { id: "concert", label: "Concert", icon: Music },
  { id: "corporate", label: "Corporate", icon: Briefcase },
  { id: "house-party", label: "House Party", icon: PartyPopper },
  { id: "other", label: "Something else", icon: Sparkles },
];

const proofStrip = [
  { icon: Timer, label: "Setup takes about 4 minutes" },
  { icon: Smartphone, label: "Guests install nothing" },
  { icon: Link2, label: "One VibeTag for the whole celebration" },
  { icon: Archive, label: "Photos and messages stay together after the day" },
];

const steps = [
  {
    n: "01",
    title: "Create your birthday Vibe",
    desc: "Set up the celebration and customise the experience in a few minutes.",
    icon: Cake,
    video: "/creation-1.mp4",
  },
  {
    n: "02",
    title: "Share one VibeTag",
    desc: "Send one simple tag or link to guests before and during the birthday.",
    icon: Tag,
    video: "/qrcode-2.mp4",
  },
  {
    n: "03",
    title: "Keep every memory together",
    desc: "Guest photos, videos, postcards and interactions land in one organised memory bank.",
    icon: Images,
    video: "/vibe-post-4.mp4",
  },
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
  {
    icon: Camera,
    title: "Permanent birthday gallery",
    brand: "NextVibePulse",
    desc: "Every guest photo, video and postcard stays together in one lasting memory bank.",
  },
  {
    icon: Tag,
    title: "One memorable sharing tag",
    brand: "VibeTags",
    desc: "Replace scattered WhatsApp uploads and forgotten hashtags with one trackable tag.",
  },
  {
    icon: Gamepad2,
    title: "Birthday trivia",
    brand: "NextVibePilot",
    desc: 'Build excitement with questions like "How well do you know the celebrant?"',
  },
  {
    icon: Users,
    title: "Guest conversations",
    brand: "VibePod",
    desc: "Give guests a place to meet and interact before the celebration begins.",
  },
  {
    icon: BarChart3,
    title: "Event insights",
    brand: "Analytics",
    desc: "See participation and engagement from the people who joined the Vibe.",
  },
  {
    icon: ShieldCheck,
    title: "Founder pricing",
    brand: "Secured Spot",
    desc: "Lock the promotional ₦5,000 price for this birthday package, per the offer terms.",
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

const offerFacts = [
  "Standard price ₦10,000 — you pay ₦5,000 today",
  "Payment is taken now to lock the spot",
  "An approximate event date is required",
  "Guests pay nothing and install nothing",
  "Locked-in pricing means this package stays ₦5,000 for your event",
  "Offer ends at the deadline or when the 1,000th spot is claimed",
];

const testimonials = [
  {
    name: "Delightsome Asolo",
    role: "Event Organiser",
    location: "AWS Student Community Day",
    date: "26/06/2026",
    image: null as string | null,
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    quote:
      "We planned AWS Student Community Day with over 500 attendees in mind and NextVibe served as an all-in-one event management solution for us. The gamification feature we used on the event day was the perfect combination of seamless and fun. I particularly had fun watching our audience climb up the leaderboard. Thank you to the team at NextVibe.",
    initials: "DA",
  },
  {
    name: "Olayinka",
    role: "Birthday host",
    location: "",
    date: "12/07/2026",
    image: "/olajumoke.jpg",
    logo: null as string | null,
    quote:
      "I had such an amazing birthday experience with my community! 💜 It was so much fun bringing everyone together, and the giveaway made it even more exciting. Huge thanks to nextvibe for making the experience possible. 🎉 I can't wait to create more amazing memories like this!",
    initials: "OL",
  },
];

const faqs = [
  {
    q: "What exactly do I pay for?",
    a: "One full NextVibe birthday package — VibeTag, postcards, trivia, VibePod and analytics — at ₦5,000 instead of ₦10,000.",
  },
  {
    q: "Why is it 50% off?",
    a: "We are onboarding our first 1,000 paying hosts. You get founder pricing, we get real celebrations to grow with.",
  },
  {
    q: "When does the price go back up?",
    a: "The moment the 1,000th spot is claimed, or at the deadline shown on this page — whichever comes first.",
  },
  {
    q: "Do I need my event date now?",
    a: "An approximate date is enough. It lets us time your setup reminders and event-day support.",
  },
  {
    q: "Do guests need to pay or install anything?",
    a: "No. They open your VibeTag link in any browser and start capturing.",
  },
  {
    q: "Is my birthday gallery private?",
    a: "Yes. Your gallery is tied to your VibeTag and only people with the link can view or contribute.",
  },
  {
    q: "How do guests join?",
    a: "You share one VibeTag link — on WhatsApp, an invite card or a QR code at the venue. One tap and they are in.",
  },
  {
    q: "Can guests upload videos?",
    a: "Yes. Photos and short videos are both supported as postcards.",
  },
  {
    q: "Is there an upload or guest limit?",
    a: "The number of guests is based on the pricing tier. Each guest can add up to 20 postcards per event so the gallery stays browsable.",
  },
  {
    q: "What happens to the gallery after the birthday?",
    a: "It stays live as your permanent memory bank — you keep access and can revisit or download it later.",
  },
  {
    q: "Can I change my event date?",
    a: "Yes. Reply to your confirmation email and we will move your date at no extra cost.",
  },
  {
    q: "What is the cancellation or refund policy?",
    a: "Cancel before your VibeTag is designed and we refund in full. After setup begins we can move your date instead.",
  },
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
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BirthdayFunnel() {
  const router = useRouter();
  const { days, hours, minutes, seconds } = useCountdown(DEADLINE);

  // ── Live stats via RTK Query ──────────────────────────────────────────────
  const { data: stats } = useGetBirthdayStatsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const spotsLeft = stats?.spotsRemaining ?? SPOTS_TOTAL - 736;
  const signedUp = stats?.signedUp ?? 736;
  const claimedPct = useMemo(
    () => Math.min(100, (signedUp / SPOTS_TOTAL) * 100),
    [signedUp]
  );
  const isFull = stats?.isFull ?? false;

  // ── Funnel state ──────────────────────────────────────────────────────────
  // Template has 4 steps. We add a tier-selection step (new step 2) making it 5 total.
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string>("birthday");
  const [showOtherTypes, setShowOtherTypes] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CampaignTier | null>(null);
  const [tierQuote, setTierQuote] = useState<TierQuote | null>(null);
  const [isGift, setIsGift] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [giftEmail, setGiftEmail] = useState("");
  const [giftName, setGiftName] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // ── RTK mutations ─────────────────────────────────────────────────────────
  const [triggerQuote, { isFetching: quoteLoading }] =
    useLazyGetBirthdayQuoteQuery();
  const [signupBirthday, { isLoading: submitting }] =
    useSignupBirthdayMutation();

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" }
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
      toast.error("Add your name and a real email so we can send your VibeTag");
      return;
    }
    if (isGift && (!giftEmail.includes("@") || !giftName.trim())) {
      toast.error("Add the recipient's name and a valid email for the gift");
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
      const res = await signupBirthday({
        email,
        tier: selectedTier,
        eventDate: eventDateStr,
      }).unwrap();
      localStorage.setItem("bday_paymentId", res.paymentId);
      window.location.href = res.checkoutUrl;
    } catch (err: unknown) {
      const e = err as {
        status?: number;
        data?: { message?: string };
        message?: string;
      };
      if (e?.status === 409)
        toast.error("This email already has a confirmed spot.");
      else if (e?.status === 400)
        toast.error("All 1,000 spots have been claimed!");
      else
        toast.error(e?.data?.message ?? e?.message ?? "Something went wrong.");
    }
  };

  // Total steps = 5 (category → tier → details → date → confirm)
  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* 1. Minimal navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <Image
            src="/logos/new/logo_black_text.png"
            alt="NextVibe"
            width={120}
            height={48}
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-primary sm:inline">
              {spotsLeft} spots left
            </span>
            <Button size="default" onClick={scrollToFunnel} disabled={isFull}>
              {isFull ? "Fully booked" : "Secure my spot"}
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="w-full relative px-4 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
              <Cake className="size-4" />
              Limited to the first 1,000 hosts
            </span>

            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
              Your birthday celebration deserves
              <br />
              more than 9 photos
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Collect every photo, video, message and moment from your birthday
              in one private memory bank. Your guests join with one VibeTag — no
              app download required.
            </p>

            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl font-bold md:text-3xl">
                <span className="text-muted-foreground line-through">
                  ₦10,000
                </span>{" "}
                <span className="text-primary">₦5,000</span>
              </p>
              <p className="text-sm text-muted-foreground">
                One birthday event. Everything included. No guest payment
                required.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Button
                size="lg"
                onClick={scrollToFunnel}
                disabled={isFull}
                className="w-full sm:w-auto"
              >
                {CTA_LABEL}
                <ArrowRight className="size-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo("video")}
                className="w-full sm:w-auto"
              >
                <Play className="size-5" />
                Watch how Nextvibe works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Product video */}
      <section
        id="video"
        className="border-t border-border/50 bg-secondary/30 py-16 md:py-24"
      >
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold leading-tight md:text-4xl">
              See how NextVibe brings every birthday memory together
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
              From guest photos and video messages to birthday trivia and
              postcards, see how one VibeTag turns your celebration into a
              memory bank.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl bg-card shadow-sm">
              <div className="relative aspect-video w-full bg-secondary/40">
                {!videoPlaying && (
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(true)}
                    aria-label="Play the NextVibe product tour"
                    className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                      alt="NextVibe birthday product tour thumbnail"
                      className="absolute inset-0 size-full object-cover opacity-70"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    <div className="relative flex size-20 items-center justify-center rounded-full border border-white/30 bg-white/90 text-primary shadow-sm transition-transform group-hover:scale-110">
                      <Play className="size-8 translate-x-0.5 fill-current" />
                    </div>
                    <p className="relative text-lg font-bold text-white drop-shadow md:text-xl">
                      Play the product tour
                    </p>
                  </button>
                )}
                <iframe
                  className={cn(
                    "absolute inset-0 size-full transition-opacity duration-300",
                    videoPlaying
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  )}
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=${
                    videoPlaying ? 1 : 0
                  }&rel=0&modestbranding=1`}
                  title="NextVibe product tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
                {videoPlaying && (
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(false)}
                    aria-label="Stop video"
                    className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
                  >
                    <span className="flex gap-0.5">
                      <span className="h-3 w-1 rounded-sm bg-white" />
                      <span className="h-3 w-1 rounded-sm bg-white" />
                    </span>
                    Stop
                  </button>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Watch the {VIDEO_DURATION}-minute product tour — no signup
              required.
            </p>

            <Button
              size="lg"
              onClick={scrollToFunnel}
              disabled={isFull}
              className="mt-5 w-full sm:w-auto"
            >
              {CTA_LABEL} — ₦5,000
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Quick proof strip */}
      <section className="border-y border-border/50 py-10 md:py-14">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold md:text-4xl my-8">
            Perks
          </h2>
          <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {proofStrip.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
                >
                  <Icon className="size-5 shrink-0 text-primary" />
                  <p className="text-sm font-semibold leading-snug">
                    {p.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How it works */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold md:text-4xl">
            How Nextvibe works
          </h2>
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-primary/30">
                      {s.n}
                    </span>
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-1 overflow-hidden rounded-xl bg-secondary/60">
                    <video
                      src={s.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Benefits split */}
      <section className="border-y border-border/50 bg-secondary/40 py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold md:text-4xl">
            Why everyone joins in
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
            {[
              {
                title: "For the birthday host",
                icon: Cake,
                items: hostBenefits,
              },
              {
                title: "For your guests",
                icon: MessageSquareHeart,
                items: guestBenefits,
              },
            ].map((col) => {
              const Icon = col.icon;
              return (
                <div
                  key={col.title}
                  className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold">{col.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Everything included */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-4xl">
              Everything included for{" "}
              <span className="text-primary">₦5,000</span>
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              The full stack. No add-ons, no upsells, no watermark.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex gap-4 rounded-2xl bg-card p-6 shadow-sm"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {f.title}{" "}
                      <span className="text-sm font-semibold text-primary">
                        — {f.brand}
                      </span>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="border-y border-border/50 bg-secondary/40 py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <h2 className="text-center text-2xl font-bold md:text-4xl">
            Hosts who already vibed
          </h2>
          <div className="mx-auto mt-8 grid max-w-5xl items-stretch gap-4 md:grid-cols-2">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex h-full flex-col gap-3 rounded-2xl bg-card p-6 shadow-sm"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-3">
                  {/* Avatar — photo if available, else initials */}
                  {t.image ? (
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {t.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role}
                      {t.location ? ` · ${t.location}` : ""} · {t.date}
                    </p>
                  </div>
                  {/* Logo if available */}
                  {t.logo && (
                    <img
                      src={t.logo}
                      alt={t.location}
                      className="h-6 w-auto shrink-0 object-contain opacity-70"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pricing + urgency */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-4xl">
              Everything your birthday needs for{" "}
              <span className="text-primary">₦5,000</span>
            </h2>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm md:p-8">
              <p className="text-3xl font-bold">
                <span className="text-muted-foreground line-through">
                  ₦10,000
                </span>{" "}
                <span className="text-primary">₦5,000</span>
              </p>
              <ul className="flex flex-col gap-3">
                {offerFacts.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </div>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="size-4" />
                Your gallery stays private to people with your VibeTag link.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Clock className="size-4" />
                Offer closes in
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: days, l: "Days" },
                  { v: hours, l: "Hrs" },
                  { v: minutes, l: "Min" },
                  { v: seconds, l: "Sec" },
                ].map((t) => (
                  <div
                    key={t.l}
                    className="rounded-xl bg-secondary/60 py-3 text-center"
                  >
                    <p className="text-2xl font-bold tabular-nums md:text-3xl">
                      {String(t.v).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.l}</p>
                  </div>
                ))}
              </div>
              <Progress value={claimedPct} />
              <p className="text-sm text-muted-foreground">
                {signedUp} of {SPOTS_TOTAL} spots claimed — only{" "}
                <span className="font-semibold text-primary">
                  {spotsLeft} left
                </span>
              </p>
              <div className="flex flex-col gap-2">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="size-4 shrink-0 text-primary" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                onClick={scrollToFunnel}
                disabled={isFull}
                className="mt-auto"
              >
                {CTA_LABEL}
                <ArrowRight className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Reservation form */}
      <section
        id="funnel"
        className="border-y border-border/50 bg-secondary/40 py-16 md:py-24"
      >
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-bold md:text-4xl">
              Secure your birthday Vibe in four quick steps
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-base text-muted-foreground">
              You do not need every event detail ready. Start now and complete
              the remaining setup later.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    step >= s ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Step {step} of {totalSteps} · Occasion → size → your details →
              date → payment
            </p>

            <div className="mt-6 rounded-3xl bg-card p-6 shadow-sm md:p-8">
              {/* Step 1 — Category (identical to template) */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-xl font-bold md:text-2xl">
                    You are celebrating a birthday
                  </h3>
                  <button
                    type="button"
                    onClick={() => pickCategory("birthday")}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-sm",
                      category === "birthday"
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    )}
                  >
                    <Cake className="size-7 text-primary" />
                    <div>
                      <p className="text-lg font-bold">Birthday</p>
                      <p className="text-sm text-muted-foreground">
                        Preselected for you — tap to continue
                      </p>
                    </div>
                  </button>

                  <Button
                    size="lg"
                    onClick={() => pickCategory(category)}
                    disabled={isFull}
                  >
                    Continue
                    <ArrowRight className="size-5" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowOtherTypes((v) => !v)}
                    className="text-sm font-medium text-muted-foreground underline underline-offset-4"
                  >
                    Planning something else?
                  </button>

                  {showOtherTypes && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {categories
                        .filter((c) => c.id !== "birthday")
                        .map((c) => {
                          const Icon = c.icon;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => pickCategory(c.id)}
                              className={cn(
                                "flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center transition-all hover:-translate-y-1 hover:border-primary",
                                category === c.id &&
                                  "border-primary bg-primary/5"
                              )}
                            >
                              <Icon className="size-5 text-primary" />
                              <span className="text-sm font-semibold">
                                {c.label}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 — Tier selection (new, keeps same card style) */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-xl font-bold md:text-2xl">
                    Pick your event size
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tier determines your deposit amount and locks in your
                    package.
                  </p>
                  <div className="flex flex-col gap-3">
                    {TIERS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={quoteLoading && selectedTier === t.id}
                        onClick={() => pickTier(t.id)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
                          selectedTier === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background"
                        )}
                      >
                        <div>
                          <p className="font-bold">{t.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.capacity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.tagline && (
                            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                              {t.tagline}
                            </span>
                          )}
                          {quoteLoading && selectedTier === t.id ? (
                            <Loader2 className="size-4 animate-spin text-primary" />
                          ) : (
                            <ArrowRight className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </div>
              )}

              {/* Step 3 — Details (template step 2) */}
              {step === 3 && (
                <form onSubmit={submitDetails} className="flex flex-col gap-5">
                  <h3 className="text-xl font-bold md:text-2xl">
                    Where do we send your VibeTag?
                  </h3>
                  {tierQuote && (
                    <div className="inline-flex items-baseline gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
                      <span>{formatNaira(tierQuote.amountDue)} deposit</span>
                      <span className="opacity-50">·</span>
                      <span className="text-xs line-through opacity-60">
                        {formatNaira(tierQuote.baseAmount)} full price
                      </span>
                    </div>
                  )}

                  {/* Your details */}
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
                    <Label htmlFor="funnel-email">Your email</Label>
                    <Input
                      id="funnel-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="h-14 text-base"
                    />
                  </div>

                  {/* Gift toggle */}
                  <button
                    type="button"
                    onClick={() => setIsGift((v) => !v)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all",
                      isGift
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    )}
                  >
                    <div>
                      <p className="font-semibold text-sm">🎁 This is a gift</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Send the VibeTag to someone else's birthday
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors",
                        isGift
                          ? "border-primary bg-primary"
                          : "border-border bg-secondary"
                      )}
                    >
                      <span
                        className={cn(
                          "block h-4 w-4 rounded-full bg-white shadow transition-transform",
                          isGift ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </button>

                  {/* Recipient fields — shown when gift is toggled on */}
                  {isGift && (
                    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-secondary/20 p-4">
                      <p className="text-sm font-semibold text-primary">
                        Recipient details
                      </p>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="gift-name">Recipient&apos;s name</Label>
                        <Input
                          id="gift-name"
                          value={giftName}
                          onChange={(e) => setGiftName(e.target.value)}
                          placeholder="Temi"
                          className="h-14 text-base"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="gift-email">
                          Recipient&apos;s email
                        </Label>
                        <Input
                          id="gift-email"
                          type="email"
                          value={giftEmail}
                          onChange={(e) => setGiftEmail(e.target.value)}
                          placeholder="temi@email.com"
                          className="h-14 text-base"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto sm:flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto sm:flex-1"
                    >
                      Continue
                      <ArrowRight className="size-5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 4 — Date (template step 3, now with shadcn Calendar) */}
              {step === 4 && (
                <form onSubmit={submitDate} className="flex flex-col gap-5">
                  <h3 className="text-xl font-bold md:text-2xl">
                    When is the party?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    An approximate date is fine — we time your reminders and
                    event-day support around it.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label>Event date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-14 w-full justify-start text-left text-base font-normal",
                            !eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-3 size-5 shrink-0" />
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
                            return date < today || date > new Date(2027, 8, 1);
                          }}
                          fromDate={new Date()}
                          toDate={new Date(2027, 8, 1)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(3)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto sm:flex-1"
                    >
                      Continue
                      <ArrowRight className="size-5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 5 — Confirm & pay (template step 4) */}
              {step === 5 && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-xl font-bold md:text-2xl">
                    Confirm and lock{" "}
                    {tierQuote ? formatNaira(tierQuote.amountDue) : "₦5,000"}
                  </h3>
                  <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Celebration
                      </span>
                      <span className="text-sm font-semibold capitalize">
                        {categories.find((c) => c.id === category)?.label ??
                          "Birthday"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Package size
                      </span>
                      <span className="text-sm font-semibold">
                        {TIERS.find((t) => t.id === selectedTier)?.label} —{" "}
                        {TIERS.find((t) => t.id === selectedTier)?.capacity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Email
                      </span>
                      <span className="truncate text-sm font-semibold">
                        {email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Event date
                      </span>
                      <span className="text-sm font-semibold">
                        {eventDate ? format(eventDate, "dd MMMM yyyy") : "—"}
                      </span>
                    </div>
                    {tierQuote && (
                      <>
                        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                          <span className="text-sm text-muted-foreground">
                            Full price
                          </span>
                          <span className="text-sm font-semibold text-muted-foreground line-through">
                            {formatNaira(tierQuote.baseAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">
                            Deposit today ({tierQuote.depositPercent}%)
                          </span>
                          <span className="text-xl font-bold text-primary">
                            {formatNaira(tierQuote.amountDue)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {included.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </div>
                        <p className="text-sm">{item}</p>
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
                        <Loader2 className="size-4 animate-spin" /> Redirecting
                        to checkout…
                      </>
                    ) : isFull ? (
                      "Campaign fully booked"
                    ) : (
                      <>
                        Pay{" "}
                        {tierQuote
                          ? formatNaira(tierQuote.amountDue)
                          : "deposit"}{" "}
                        &amp; secure my birthday Vibe
                      </>
                    )}
                  </Button>
                  <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Secure local checkout via Ercaspay
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(4)}
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-bold md:text-4xl">
              Quick answers
            </h2>
            <Accordion type="single" collapsible className="mt-6">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-4xl">Contact Us</h2>
            <p className="mt-3 text-base text-muted-foreground">
              Have questions? Reach out to us via phone or WhatsApp.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="tel:+234 705 177 0030"
                className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Phone className="size-5" />
                Call: +234 705 177 0030
              </a>
              <a
               href="https://wa.me/2347051770030?text=Hi%20Nextvibe!%20👋%20I%E2%80%99m%20interested%20in%20learning%20more%20about%20your%20birthday%20celebration%20package.%20Could%20you%20please%20provide%20more%20details%20about%20the%20features%2C%20pricing%2C%20and%20how%20to%20get%20started%3F%20Looking%20forward%20to%20your%20response.%20Thank%20you!%20🎉"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <MessageCircle className="size-5" />
                WhatsApp: +234 705 177 0030
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="pb-20 md:pb-28">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-primary/30 bg-primary p-8 text-center md:p-12">
            <h2 className="text-2xl font-extrabold text-primary-foreground md:text-4xl">
              Your birthday happens once. Keep more than nine photos from it.
            </h2>
            <p className="text-base text-primary-foreground/90 md:text-lg">
              Bring every photo, video, message and guest interaction together
              in one birthday memory bank.
            </p>
            <p className="text-2xl font-bold text-primary-foreground">
              <span className="line-through opacity-70">₦10,000</span> ₦5,000
            </p>
            <p className="text-sm text-primary-foreground/90">
              {spotsLeft} spots left · closes in {days}d {hours}h {minutes}m
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={scrollToFunnel}
              disabled={isFull}
              className="w-full sm:w-auto"
            >
              {CTA_LABEL}
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border/50 bg-background/95 p-3 backdrop-blur md:hidden">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-none text-primary">
              ₦5,000
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {spotsLeft} spots left
            </p>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={scrollToFunnel}
            disabled={isFull}
          >
            {isFull ? "Fully booked" : "Secure my spot"}
          </Button>
        </div>
      )}
    </div>
  );
}
