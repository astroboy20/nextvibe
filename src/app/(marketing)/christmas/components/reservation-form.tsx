"use client";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  type CampaignTier,
  type CampaignCurrency,
  useGetChristmasStatsQuery,
  useGetChristmasQuoteQuery,
  useSignupChristmasMutation,
} from "@/features/campaigns/api/campaign-api";

const steps = ["Your details", "Your event", "Confirm"] as const;

interface TierDef {
  id: CampaignTier;
  label: string;
  capacity: string;
  popular?: boolean;
}

const TIERS: TierDef[] = [
  { id: "MICRO",      label: "Micro",      capacity: "1–50 guests" },
  { id: "SMALL",      label: "Small",      capacity: "51–200 guests", popular: true },
  { id: "MEDIUM",     label: "Medium",     capacity: "201–500 guests" },
  { id: "LARGE",      label: "Large",      capacity: "501–2,000 guests" },
  { id: "ENTERPRISE", label: "Enterprise", capacity: "2,001+ guests" },
];

interface ReservationFormProps {
  formRef: React.RefObject<HTMLDivElement | null>;
}

export default function ReservationForm({ formRef }: ReservationFormProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [tier, setTier] = useState<CampaignTier>("SMALL");
  const [currency, setCurrency] = useState<CampaignCurrency>("USD");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);

  const { data: stats } = useGetChristmasStatsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const isFull = stats?.isFull ?? false;

  const { data: quoteData, isError: quoteError } = useGetChristmasQuoteQuery();
  const tierPrice = quoteData?.prices[currency]?.[tier];

  const [signupChristmas, { isLoading: submitting }] =
    useSignupChristmasMutation();

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setStep(2);
  };

  const submitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) {
      toast.error("Pick your celebration date — it sets up your reminders");
      return;
    }
    setStep(3);
  };

  const pay = async () => {
    if (!eventDate) return;
    // Send as YYYY-MM-DD string — never use toISOString() (UTC shift bug)
    const eventDateStr = format(eventDate, "yyyy-MM-dd");

    try {
      const res = await signupChristmas({
        email,
        tier,
        eventDate: eventDateStr,
        currency,
      }).unwrap();
      sessionStorage.setItem("xmas_paymentId", res.paymentId);
      window.location.href = res.checkoutUrl;
    } catch (err: unknown) {
      const e = err as {
        status?: number;
        data?: { message?: string | string[]; error?: { message?: string } };
        message?: string;
      };
      if (e?.status === 409) {
        toast.error("This email already has a spot in the Christmas campaign.");
      } else if (e?.status === 503) {
        toast.error("Payment provider is temporarily unavailable. Try again shortly.");
      } else if (e?.status === 400) {
        const msg = Array.isArray(e?.data?.message)
          ? (e.data!.message as string[]).join(", ")
          : (e?.data?.message ?? e?.data?.error?.message ?? "Invalid request.");
        toast.error(String(msg));
      } else {
        toast.error(e?.data?.error?.message ?? e?.message ?? "Something went wrong. Please try again.");
      }
    }
  };

  function formatPrice(amount: number, cur: CampaignCurrency) {
    return cur === "NGN"
      ? `₦${amount.toLocaleString("en-NG")}`
      : `$${amount.toLocaleString("en-US")}`;
  }

  const priceLabel =
    tierPrice != null
      ? formatPrice(tierPrice, currency)
      : currency === "USD"
      ? "$5"
      : "₦5,000";

  return (
    <section
      id="funnel"
      className="border-t border-border/50 bg-secondary/30 py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div
          ref={formRef}
          className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10"
        >
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-between">
            {steps.map((label, idx) => {
              const n = idx + 1;
              const isActive = step >= n;
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {n}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground text-center leading-tight">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step 1 — email */}
          {step === 1 && (
            <form onSubmit={submitDetails} className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold">
                Where should we send your redemption code?
              </h3>
              <p className="text-sm text-muted-foreground -mt-2">
                Your XMAS- code is emailed right after payment confirms.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="xmas-email">Email address</Label>
                <Input
                  id="xmas-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <p className="text-xs text-muted-foreground">One spot per email address.</p>
              </div>
              <Button type="submit" size="lg" className="gap-2 w-full sm:w-auto" disabled={isFull}>
                {isFull ? "Campaign fully booked" : "Continue"}
                {!isFull && <ArrowRight className="size-4" />}
              </Button>
            </form>
          )}

          {/* Step 2 — tier, currency, date */}
          {step === 2 && (
            <form onSubmit={submitEvent} className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold">Tell us about your event</h3>

              {/* Tier */}
              <div className="flex flex-col gap-2">
                <Label>Event tier (guest count)</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIERS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTier(t.id)}
                      className={cn(
                        "flex flex-col gap-0.5 rounded-xl border-2 p-3 text-left transition-all",
                        tier === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <span className="text-sm font-bold">{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.capacity}</span>
                      {t.popular && (
                        <span className="mt-0.5 text-[10px] font-semibold text-primary">
                          Most popular
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your code is locked to this tier — it won&apos;t work on a different tier event.
                </p>
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-2">
                <Label>Currency</Label>
                <div className="flex gap-2">
                  {(["USD", "NGN"] as CampaignCurrency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        "flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all",
                        currency === c
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {c === "USD" ? "$ USD" : "₦ NGN"}
                    </button>
                  ))}
                </div>
                {quoteError && (
                  <p className="text-xs text-destructive">
                    Could not load live price — your spot is still {currency === "USD" ? "$5" : "₦5,000"}.
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-2">
                <Label>When is your celebration?</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 shrink-0" />
                      {eventDate ? format(eventDate, "dd MMMM yyyy") : "Select a date"}
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
                        return date < today || date > new Date(2028, 11, 31);
                      }}
                      fromDate={new Date()}
                      toDate={new Date(2028, 11, 31)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Reminders follow this date — 7 days before, 1 day before, on the day, and 1 day after.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  className="flex-1 sm:flex-none"
                >
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1 sm:flex-none gap-2">
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 — confirm & pay */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold">You&apos;re one step away 🎄</h3>

              {/* Summary */}
              <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier</span>
                  <span className="font-semibold">
                    {TIERS.find((t) => t.id === tier)?.label} ({TIERS.find((t) => t.id === tier)?.capacity})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Celebration date</span>
                  <span className="font-semibold">
                    {eventDate ? format(eventDate, "dd MMMM yyyy") : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-semibold">Total today</span>
                  <span className="font-extrabold text-primary text-base">{priceLabel}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Clicking below takes you to Bachs' secure checkout. After payment confirms,
                your XMAS- redemption code is emailed to you. Use it at the
                plan-payment step when you publish your Christmas event on NextVibe.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(2)}
                  className="flex-1 sm:flex-none"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={pay}
                  disabled={submitting || isFull}
                  className="flex-1 sm:flex-none gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      Pay {priceLabel} &amp; claim my spot
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                Secure checkout via Bachs · 30-minute session
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
