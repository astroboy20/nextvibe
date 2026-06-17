"use client"
import { motion } from "framer-motion";
import { Heart, Tag, Rocket, Users, CheckCircle2, Clock, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: Heart,
    title: "You Know the Pain. We've Lived It.",
    body:
      "Lost wedding photos. Dead WhatsApp groups. Expired Drive links. We built NextVibe because we lost our own send-off party photos — every single one. Backing us means saying \"never again\" to lost memories.",
  },
  {
    icon: Tag,
    title: "An Unbeatable Deal (That Won't Last)",
    body:
      "Every tier gives you 3 bundles for the price of 1. Use them yourself, gift them, save them. This pricing disappears the moment the campaign ends.",
  },
  {
    icon: Rocket,
    title: "Help Build the Future of Events",
    body:
      "1,100+ users. 1,200+ postcards. 3,400+ games played in 5 weeks. Your backing funds native iOS & Android apps, offline postcard queues, push notifications, and African + US expansion.",
  },
  {
    icon: Users,
    title: "Become Part of Something Bigger",
    body:
      "Backers aren't customers — they're co-creators. Hall of Fame listing, Founders Wall photo, private WhatsApp with the team, and first say in what we build next.",
  },
  {
    icon: CheckCircle2,
    title: "A Product That Already Works",
    body:
      "We're not asking you to fund an idea. Successful pilots at UNILAG Hall Weeks (Makama, Moremi, Jaja). 5,200+ postcard & game impressions. Proven, loved, scaling.",
  },
  {
    icon: Clock,
    title: "Get In Early. Really Early.",
    body:
      "When NextVibe launches fully, lifetime access won't be $100 — it'll be $500+. Backing now locks in your rate forever.",
  },
];

const bottomLine = [
  ["Save Money", "3 bundles for the price of 1"],
  ["Preserve Memories", "Never lose event photos again"],
  ["Build the Future", "Fund native mobile apps & expansion"],
  ["Join the Community", "Be part of something bigger"],
  ["Lock In Lifetime Access", "Never pay for these tiers again"],
];

export default function WhyBackNextVibe() {
  return (
    <section id="why-back" className="container mx-auto max-w-6xl mt-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Why back NextVibe
        </span>
        <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold leading-tight">
          Your memories are disappearing. <br className="hidden sm:block" />
          <span className="text-gradient">We&apos;re building their forever home.</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Backing NextVibe isn&apos;t just a great deal on event tools — it&apos;s joining a movement to fix
          something that&apos;s been broken for too long.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reasons.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl bg-white/60 glass p-6 shadow-card hover:shadow-card-hover transition-all h-full"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <r.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">{r.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-14 rounded-3xl glass p-6 sm:p-10 border border-primary/10"
      >
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-center mb-6">
          The bottom line
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {bottomLine.map(([title, sub]) => (
            <div
              key={title}
              className="rounded-xl bg-white/70 backdrop-blur p-4 text-center border border-border/40"
            >
              <div className="font-semibold text-primary text-sm mb-1">{title}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm sm:text-base text-muted-foreground italic">
          &quot;Your memories deserve a forever home. Help us build it.&quot; 💜
        </p>
      </motion.div>
    </section>
  );
}
