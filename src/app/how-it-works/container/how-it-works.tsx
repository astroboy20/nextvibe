/* eslint-disable react/no-unescaped-entities */
"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CalendarPlus,
  Rocket,
  Share2,
  Sparkles,
  Compass,
  Heart,
  MessageCircle,
  User,
  Gift,
  Film,
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

const organizerSteps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up with email, Google, or Apple. Select 'Organizer' role. Pick your interests.",
    time: "2 minutes",
    cost: "Free",
  },
  {
    icon: CalendarPlus,
    title: "Set Up Your Event",
    description:
      "One screen, three sections: basic info, visuals & RSVP, quick toggles for games and VibeTags.",
    time: "60 seconds",
    cost: "Free",
  },
  {
    icon: Rocket,
    title: "Level Up",
    description:
      "Add games (AI-generated or manual), create VibeTags, set up ticketing packages from your dashboard.",
    time: "5-10 minutes",
    cost: "From ₦5,000",
  },
  {
    icon: Share2,
    title: "Share Your Event",
    description:
      "Share links, download QR codes, tap to WhatsApp/Instagram, or copy event codes for verbal sharing.",
    time: "1 minute",
    cost: "Free",
  },
  {
    icon: Sparkles,
    title: "Watch the Magic",
    description:
      "Monitor RSVPs, leaderboards, live postcards, and get a full analytics report after the event.",
    time: "Ongoing",
    cost: "Included",
  },
];

const attendeeSteps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Sign up, select 'Attendee', pick interests like Afrobeats or Tech, allow location for nearby events.",
    time: "2 minutes",
    cost: "Free",
  },
  {
    icon: Compass,
    title: "Discover Your Next Vibe",
    description:
      "Browse 'For You', 'Near You', and 'Trending' events. Filter by games, VibeTags, free, or starting soon.",
    time: "Browse anytime",
    cost: "Free",
  },
  {
    icon: Heart,
    title: "Explore an Event",
    description:
      "Five tabs: About, RSVP & Tickets, Games, VibeTag & Postcards, Chat (VibePod).",
    time: "Tap to explore",
    cost: "Free",
  },
  {
    icon: MessageCircle,
    title: "Connect With Your Tribe",
    description:
      "DM attendees, plan meetups, see what friends are attending via VibeTribe feed.",
    time: "Ongoing",
    cost: "Free",
  },
  {
    icon: User,
    title: "Check Your Profile",
    description:
      "View your events, postcards, game stats, rewards, and tribe connections all in one place.",
    time: "Anytime",
    cost: "Free",
  },
  {
    icon: Gift,
    title: "Monthly Dump",
    description:
      "On the 1st of every month: events attended, postcards created, games played, connections made.",
    time: "Monthly",
    cost: "Free",
  },
  {
    icon: Film,
    title: "Yearly Wrapped",
    description:
      "December 31st: a cinematic recap of your year – top moments, hours celebrated, event personality.",
    time: "Yearly",
    cost: "Free",
  },
];

const dashboardCards = [
  { title: "Event Page & Share", desc: "Live preview, QR code, share link" },
  { title: "RSVP & Ticketing", desc: "Who's coming, ticket packages, sales" },
  { title: "Gamification Hub", desc: "Add games, view leaderboards" },
  { title: "VibeTag Studio", desc: "Create and manage tags" },
  { title: "Payment & Activation", desc: "Pricing summary, activate features" },
  { title: "Analytics", desc: "Views, RSVPs, postcards, engagement" },
];

const HowItWorksContent = () => {
  return (
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
          How It Works
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4"
        >
          Whether you're throwing the party or just showing up –{" "}
          <span className="text-gradient">we've got you.</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="text-lg text-muted-foreground"
        >
          One platform. Two modes. Infinite memories.
        </motion.p>
      </section>

      {/* Two Modes */}
      <section className="container px-4 max-w-4xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Organizer Mode",
              items: [
                "Create events",
                "Sell tickets",
                "Run games",
                "Track analytics",
                "Prove ROI",
              ],
            },
            {
              title: "Attendee Mode",
              items: [
                "Discover events",
                "Play games",
                "Capture memories",
                "Connect with people",
                "Relive everything",
              ],
            },
          ].map((mode, mi) => (
            <motion.div
              key={mode.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={mi}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                {mode.title}
              </h3>
              <ul className="space-y-2">
                {mode.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Toggle between them anytime. Same account. Different hat.
        </p>
      </section>

      {/* For Organizers */}
      <section className="bg-secondary py-16 mb-16">
        <div className="container px-4 max-w-3xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="font-display text-2xl md:text-3xl font-bold text-center mb-4 text-foreground"
          >
            For Organizers
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="text-center text-muted-foreground mb-12"
          >
            From Zero to Event Hero in 5 Simple Steps
          </motion.p>
          <div className="space-y-6">
            {organizerSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="flex gap-4 items-start"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {i < organizerSteps.length - 1 && (
                      <div className="w-0.5 h-full min-h-6 bg-primary/20 mt-2" />
                    )}
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-muted rounded-full px-3 py-1 text-muted-foreground">
                        ⏱ {step.time}
                      </span>
                      <span className="bg-muted rounded-full px-3 py-1 text-muted-foreground">
                        💰 {step.cost}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="container px-4 max-w-4xl mx-auto mb-16">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="font-display text-xl font-bold text-center mb-8 text-foreground"
        >
          Organizer Dashboard – Your Command Center
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {dashboardCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <h4 className="text-sm font-bold text-foreground mb-1">
                {card.title}
              </h4>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For Attendees */}
      <section className="bg-gradient-vibe py-16 mb-16">
        <div className="container px-4 max-w-3xl mx-auto text-black">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="font-display text-2xl md:text-3xl font-bold text-center mb-4"
          >
            For Attendees
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="text-center opacity-80 mb-12"
          >
            From "What's happening?" to "Best night ever"
          </motion.p>
          <div className="space-y-6">
            {attendeeSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="flex gap-4 items-start"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold opacity-70">
                      Step {i + 1}
                    </span>
                    <h3 className="font-display text-base font-bold mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm opacity-80 mb-2">
                      {step.description}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-primary-foreground/10 rounded-full px-3 py-1">
                        ⏱ {step.time}
                      </span>
                      <span className="bg-primary-foreground/10 rounded-full px-3 py-1">
                        💰 {step.cost}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
            Ready to Start?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="bg-[#5b1a57] hover:bg-[#4a1446] text-white"
            >
              <Link href="/auth/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/discover">Explore Events</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default HowItWorksContent;
