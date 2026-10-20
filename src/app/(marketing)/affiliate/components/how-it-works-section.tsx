"use client";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const steps = [
  {
    number: "01",
    title: "Sign in",
    desc: "Log in or create your free NextVibe account to join the affiliate program.",
  },
  {
    number: "02",
    title: "Share NextVibe",
    desc: "Introduce NextVibe to organizers, creators, and your community.",
  },
  {
    number: "03",
    title: "Earn on every deal",
    desc: "Get 5% on every deal you close, and 10% on any event you create.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-24 border-y border-border bg-secondary/50 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="text-sm font-bold uppercase tracking-widest text-primary"
        >
          From connection to collaboration
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          variants={fadeUp}
          className="mt-3 text-3xl font-bold md:text-4xl"
        >
          Your next chapter starts here.
        </motion.h2>

        <div className="mt-10 grid gap-9 md:grid-cols-3">
          {steps.map(({ number, title, desc }, i) => (
            <motion.div
              key={number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
            >
              <span className="text-4xl font-bold text-primary/30">{number}</span>
              <h3 className="mb-3 mt-4 text-xl font-bold">{title}</h3>
              <p className="leading-relaxed text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
