"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FOUNDER_PRICE = 29;

const steps = ["Your details", "Your date", "Confirm"] as const;

interface ReservationFormProps {
  formRef: React.RefObject<HTMLDivElement | null>;
}

export default function ReservationForm({ formRef }: ReservationFormProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !name.trim()) {
      toast.error("Add your name and a real email so we can send your VibeTag");
      return;
    }
    setStep(2);
  };

  const submitDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) {
      toast.error("Pick your celebration date — it sets up your reminders");
      return;
    }
    setStep(3);
  };

  const pay = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success("Spot reserved. Checkout opens once payment goes live.");
  };

  return (
    <section
      id="funnel"
      className="border-t border-border/50 bg-secondary/30 py-12 md:py-16"
    >
      <div className="container px-4">
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
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
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

          {/* Step 1 — details */}
          {step === 1 && (
            <form onSubmit={submitDetails} className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold">
                Where should we send your VibeTag?
              </h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tg-name">Your name</Label>
                <Input
                  id="tg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Melissa Reyes"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tg-email">Email address</Label>
                <Input
                  id="tg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tg-guests">
                  Roughly how many guests? (optional)
                </Label>
                <Input
                  id="tg-guests"
                  type="number"
                  min={2}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="e.g. 18"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {/* Step 2 — date */}
          {step === 2 && (
            <form onSubmit={submitDate} className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold">
                When is your Thanksgiving dinner?
              </h3>
              <p className="text-sm text-muted-foreground -mt-2">
                An approximate date is fine — it sets up your reminders.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tg-date">Celebration date</Label>
                <Input
                  id="tg-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
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
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 sm:flex-none gap-2"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 — confirm */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold">You&apos;re one step away</h3>
              <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-semibold">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event date</span>
                  <span className="font-semibold">{eventDate}</span>
                </div>
                {guests && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Guests (approx.)
                    </span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-semibold">Total today</span>
                  <span className="font-extrabold text-primary text-base">
                    ${FOUNDER_PRICE}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Clicking below locks your spot. Payment goes live shortly —
                we&apos;ll email you when checkout opens.
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
                  disabled={submitting}
                  className="flex-1 sm:flex-none gap-2"
                >
                  {submitting ? "Reserving…" : `Reserve for $${FOUNDER_PRICE}`}
                  {!submitting && <ArrowRight className="size-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
