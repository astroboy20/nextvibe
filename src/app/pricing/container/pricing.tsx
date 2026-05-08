"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  Gamepad2,
  Tag,
  Ticket,
  TrendingDown,
  Quote,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const freeFeatures = [
  "Basic event page creation",
  "RSVP management (Going/Maybe/Not Going)",
  "Event discovery on NextVibe feed",
  "Attendee access to view events",
  "Profile creation and social features",
  "Monthly Dump (for attendees)",
  "Yearly Wrapped (for attendees)",
];

const tiers = ["Micro", "Small", "Medium", "Large", "Enterprise"];
const attendees = ["1 – 50", "51 – 200", "201 – 500", "501 – 2,000", "2,001+"];
const perfectFor = [
  "House parties, small birthdays",
  "Birthdays, small weddings, networking",
  "Weddings, conferences, club nights",
  "Concerts, festivals, major conferences",
  "Large festivals, stadium events",
];

const vibetagSingle = ["₦5,000", "₦10,000", "₦20,000", "₦35,000", "₦50,000"];
const vibetagBundle = ["₦8,000", "₦15,000", "₦30,000", "₦50,000", "₦75,000"];

const gameSingle = ["₦5,000", "₦10,000", "₦20,000", "₦35,000", "₦50,000"];
const gameBundle = ["₦8,000", "₦15,000", "₦30,000", "₦50,000", "₦75,000"];
const gameExtra = ["₦2,000", "₦3,500", "₦6,000", "₦10,000", "₦15,000"];

const megaSingle = ["₦8,000", "₦15,000", "₦30,000", "₦55,000", "₦85,000"];
const megaFull = ["₦12,000", "₦25,000", "₦50,000", "₦85,000", "₦135,000"];

const testimonials = [
  {
    quote:
      "I spent ₦8,000 on VibeTags for my 40th birthday. The photos my friends took? Priceless. Everyone keeps asking for the link to relive the night.",
    author: "Tolu, Lagos",
  },
  {
    quote:
      "The ₦25,000 we spent on the Mega Bundle for our wedding paid for itself in guest engagement alone. And now we have 400+ photos forever.",
    author: "Seun & Chioma, Abuja",
  },
  {
    quote:
      "As a conference organizer, I need data for sponsors. ₦50,000 gave me analytics that helped me close ₦2M in sponsorships for next year.",
    author: "Femi, Lagos",
  },
];

const quickCompare = [
  {
    type: "Birthday Party",
    attendees: "40",
    need: "VibeTag Bundle (Pre + Main)",
    price: "₦8,000",
  },
  {
    type: "House Party",
    attendees: "30",
    need: "Games Bundle (Pre + Main)",
    price: "₦8,000",
  },
  {
    type: "Small Wedding",
    attendees: "150",
    need: "Mega Bundle (Pre + Main)",
    price: "₦25,000",
  },
  {
    type: "Conference",
    attendees: "300",
    need: "Mega Bundle (Pre + Main)",
    price: "₦50,000",
  },
  {
    type: "Concert",
    attendees: "1,000",
    need: "Mega Bundle (Pre + Main)",
    price: "₦85,000",
  },
];

function PricingTable({
  title,
  icon: Icon,
  description,
  headers,
  rows,
}: {
  title: string;
  icon: typeof Tag;
  description: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={0}
      variants={fadeUp}
      className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-muted-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-24">
        {/* Hero */}
        <section className="container px-4 py-16 md:py-24 text-center max-w-3xl mx-auto">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Pricing
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4"
          >
            Your first event is <span className="text-gradient">on us.</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-muted-foreground"
          >
            Free event pages. Free RSVPs. Free discovery. Then pay only for what
            makes your event truly unforgettable.
          </motion.p>
        </section>

        {/* Free Features */}
        <section className="container px-4 max-w-2xl mx-auto mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-card"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">
              What&apos;s Always Free
            </h2>
            <div className="grid gap-3">
              {freeFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-primary font-semibold mt-6">
              Zero cost. Zero catch. Forever.
            </p>
          </motion.div>
        </section>

        {/* Tier Overview */}
        <section className="container px-4 max-w-4xl mx-auto mb-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="font-display text-2xl md:text-3xl font-bold text-center mb-4 text-foreground"
          >
            Simple Pricing by Event Size
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="text-center text-muted-foreground mb-8 text-sm"
          >
            A 50-person birthday shouldn&apos;t pay the same as a 5,000-person
            concert.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            variants={fadeUp}
            className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Attendees
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Perfect For
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t, i) => (
                  <tr key={t} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {t}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {attendees[i]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {perfectFor[i]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* Pricing Tables */}
        <div className="container px-4 max-w-4xl mx-auto space-y-12 mb-16">
          <PricingTable
            title="VibeTags"
            icon={Tag}
            description="Custom branded VibeTag design, unlimited postcards, forever storage, analytics."
            headers={["Tier", "Single (Pre OR Main)", "Bundle (Pre + Main)"]}
            rows={tiers.map((t, i) => [t, vibetagSingle[i], vibetagBundle[i]])}
          />

          <PricingTable
            title="Gamification"
            icon={Gamepad2}
            description="2 games included, AI generation, leaderboards, real-time scoring, sound effects & haptics."
            headers={["Tier", "Single (2 games)", "Bundle (4 games)"]}
            rows={tiers.map((t, i) => [t, gameSingle[i], gameBundle[i]])}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h3 className="font-display text-lg font-bold text-foreground">
                Need More Games?
              </h3>
              <p className="text-sm text-muted-foreground">
                Add extra games at any time.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Price Per Additional Game
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, i) => (
                    <tr key={t} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {t}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {gameExtra[i]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <PricingTable
            title="Mega Bundle – Everything You Need"
            icon={Sparkles}
            description="VibeTags + Gamification together at our best price."
            headers={[
              "Tier",
              "Single (Pre OR Main)",
              "Full Event (Pre + Main)",
            ]}
            rows={tiers.map((t, i) => [t, megaSingle[i], megaFull[i]])}
          />
        </div>

        {/* Ticketing */}
        <section className="container px-4 max-w-4xl mx-auto mb-16">
          <PricingTable
            title="Ticketing – For Paid Events"
            icon={Ticket}
            description="Sell tickets directly through the platform."
            headers={[
              "Ticket Price",
              "NextVibe Fee",
              "Payment Processing",
              "You Receive",
            ]}
            rows={[
              ["Free Events", "0%", "N/A", "100%"],
              ["Paid Events", "0%", "N/A", "100%"],
            ]}
          />
        </section>

        {/* Volume Discounts */}
        <section className="container px-4 max-w-3xl mx-auto mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="rounded-2xl bg-gradient-vibe p-8 text-primary-foreground shadow-elevated"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">
                Volume Discounts
              </h2>
            </div>
            <p className="text-sm opacity-80 mb-6">
              For frequent organizers. Discounts apply automatically.
            </p>
            <div className="space-y-3">
              {[
                {
                  events: "3 – 5 events/year",
                  discount: "10% off",
                  perk: "Standard support",
                },
                {
                  events: "6 – 11 events/year",
                  discount: "15% off",
                  perk: "Priority support",
                },
                {
                  events: "12+ events/year",
                  discount: "20% off",
                  perk: "Dedicated account manager",
                },
              ].map((d) => (
                <div
                  key={d.events}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-primary-foreground/10 rounded-xl px-4 py-3 gap-2"
                >
                  <span className="font-semibold text-sm">{d.events}</span>
                  <span className="text-sm">
                    {d.discount} · {d.perk}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Quick Comparison */}
        <section className="container px-4 max-w-4xl mx-auto mb-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="font-display text-2xl font-bold text-center mb-8 text-foreground"
          >
            What You Actually Pay
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Attendees
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    What You Need
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {quickCompare.map((r) => (
                  <tr key={r.type} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {r.type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.attendees}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.need}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      {r.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="bg-[#F6EEF4] py-16 mb-16">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-center mb-8 text-foreground">
              What Organizers Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="rounded-2xl bg-card border border-border p-6 shadow-card"
                >
                  <Quote className="h-5 w-5 text-primary/40 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    &quot;{t.quote}&quot;
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    – {t.author}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container px-4 py-16 text-center max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Make Your Event Unforgettable?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start with a free event page. Add features when you&apos;re ready.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="bg-[#5b1a57] text-primary-foreground"
              >
                <Link href="/auth/login">Create Free Event</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">See Full Feature List</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Questions? hello@nextvibe.co | +234 705 177 0030
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
