/* eslint-disable react/no-unescaped-entities */
"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Target, Globe, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const values = [
  {
    icon: Shield,
    title: "Memory First",
    emoji: "🔐",
    description:
      "We build everything around one belief: your memories should outlive your phone, your social media accounts, and you. They're heirlooms, not content.",
  },
  {
    icon: Target,
    title: "Simple & Human",
    emoji: "🎯",
    description:
      "No complicated dashboards. No corporate jargon. Just tools that feel like they were made by people who actually throw events and attend them.",
  },
  {
    icon: Globe,
    title: "Built for Us, Scalable for the World",
    emoji: "🌍",
    description:
      "We started in Lagos, built for Nigerian events, and stress-tested in the most vibrant party culture on earth. If it works here, it works anywhere.",
  },
  {
    icon: Users,
    title: "Community Over Everything",
    emoji: "🤝",
    description:
      "We're not just connecting people to events. We're connecting people to people. Every feature brings you closer to your next friend.",
  },
];

const milestones = [
  { year: "2025", event: "Built the first version of VibeTag technology" },
  { year: "2025", event: "2nd place at MarkHack 4.0 (out of 1,000+ startups)" },
  { year: "2025", event: "Successful pilot activations at Unilag Hall Weeks" },
  { year: "2025", event: "1,000+ users" },
  { year: "2025", event: "Product rebuilt based on real feedback" },
  { year: "2026", event: "Public launch – full platform available" },
];

const AboutContent = () => {
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
          About NextVibe
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6"
        >
          We're on a mission to make sure your best memories{" "}
          <span className="text-gradient">never disappear.</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          Every epic party, every beautiful wedding, every random Tuesday
          hangout – they all deserve a forever home. We built it.
        </motion.p>
      </section>

      {/* Our Story */}
      <section className="container px-4 py-16 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8 text-foreground">
            It Started With a Question
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              The idea for NextVibe was born at a beach hangout at Landmark
              Beach on Water Corporation Drive, VI, Lagos. The vibe was fire.
              The music was shaking the walls. The people? Immaculate. Everyone
              captured one moment or the other.
            </p>
            <p>
              But one week later, when we went looking for the photos and
              videos... nothing. The group chat was dead. The hashtag was
              flooded with spam. It was like the entire night just evaporated.
            </p>
            <p className="text-foreground font-medium italic border-l-4 border-primary pl-4">
              That feeling – when pure joy disappears into thin air – stuck with
              us. In a world where we document everything, why do our most
              meaningful moments keep getting lost?
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          variants={fadeUp}
          className="mt-12"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-foreground">
            So We Built Something Different
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              NextVibe isn't just another event app. We're a{" "}
              <strong className="text-foreground">digital memory bank</strong> –
              a permanent home for the moments that matter.
            </p>
            <p>
              We created <strong className="text-foreground">VibeTags</strong>{" "}
              to replace chaotic, broken hashtags. We built{" "}
              <strong className="text-foreground">gamification</strong> to make
              events more fun before they even start. We designed{" "}
              <strong className="text-foreground">Postcards</strong> so every
              photo and video lives forever, beautifully organized, never
              forgotten.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="bg-gradient-vibe py-16">
        <div className="container px-4 max-w-3xl mx-auto text-center text-primary-foreground">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <p className="text-sm uppercase tracking-widest opacity-80 mb-4">
              Our Mission
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-8">
              To preserve the joy of human connection by giving every
              celebration a forever home.
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-left text-sm">
              {[
                "Every event matters – from intimate birthdays to massive festivals",
                "Every memory deserves permanence – no more lost photos",
                "Every connection counts – helping people find their tribe",
                "Every moment should be measurable – for organizers and brands who invest in bringing people together",
              ].map((belief, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-primary-foreground/10 rounded-xl p-4"
                >
                  <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{belief}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="container px-4 py-16 max-w-4xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="font-display text-2xl md:text-3xl font-bold text-center mb-12 text-foreground"
        >
          Our Values
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <span className="text-2xl mb-3 block">{v.emoji}</span>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {v.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="container px-4 py-16 max-w-2xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="font-display text-2xl md:text-3xl font-bold text-center mb-12 text-foreground"
        >
          Our Journey So Far
        </motion.h2>
        <div className="space-y-0">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="flex gap-4 items-start relative pl-6 pb-8 border-l-2 border-primary/30 last:border-l-0 last:pb-0"
            >
              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#5b1a57] " />
              <div>
                <span className="text-xs font-bold text-primary">{m.year}</span>
                <p className="text-sm text-foreground">{m.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why We Do This */}
      <section className="bg-secondary py-16">
        <div className="container px-4 max-w-3xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="font-display text-2xl md:text-3xl font-bold mb-8 text-foreground"
          >
            Why We Do This
          </motion.h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Because your 60th birthday deserves to be seen by your
              grandchildren.
            </p>
            <p>
              Because that random Tuesday hangout with your best friends might
              be the last one before someone moves abroad.
            </p>
            <p>
              Because you shouldn't have to choose between living in the moment
              and keeping the moment.
            </p>
            <p className="text-foreground font-semibold pt-4">
              At NextVibe, we're building more than an app. We're building a
              legacy for your joy and memories.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-20 text-center max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Join Us
          </h2>
          <p className="text-muted-foreground mb-8">
            Whether you're throwing the party or just showing up to have fun –
            you have a home here. Let's preserve your vibe. Forever.
          </p>
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

export default AboutContent;
