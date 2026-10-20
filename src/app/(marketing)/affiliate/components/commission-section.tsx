"use client";
import { motion } from "framer-motion";
import { Check, Percent, CalendarPlus, Mail } from "lucide-react";
import ApplyButton from "./apply-button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const perks = ["Free to join", "Earn on every deal", "Built for Lagos"];

export default function CommissionSection() {
  return (
    <section id="apply" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            Your commission
          </p>
          <h2 className="text-3xl font-bold leading-tight md:text-5xl">
            Close the deal. Get paid.
          </h2>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* 5% card */}
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="rounded-lg border border-border bg-card p-8 shadow-card"
          >
            <Percent className="h-8 w-8 text-primary" />
            <p className="mt-5 text-6xl font-extrabold text-primary">5%</p>
            <h3 className="mt-3 text-xl font-bold">On every deal you close</h3>
            <p className="mt-2 text-muted-foreground">
              Bring an organizer or brand to NextVibe and earn on every deal.
            </p>
          </motion.article>

          {/* 10% card */}
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            variants={fadeUp}
            className="rounded-lg border border-primary/30 bg-primary p-8 text-primary-foreground shadow-elevated"
          >
            <CalendarPlus className="h-8 w-8" />
            <p className="mt-5 text-6xl font-extrabold">10%</p>
            <h3 className="mt-3 text-xl font-bold">On any event you create</h3>
            <p className="mt-2 text-primary-foreground/85">
              Create the event yourself and double your commission.
            </p>
          </motion.article>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={3}
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                {perk}
              </li>
            ))}
          </ul>

          <ApplyButton />

          <a
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            href="mailto:hey@mynextvibe.com"
          >
            <Mail className="h-4 w-4" />
            hey@mynextvibe.com
          </a>
        </motion.div>
      </div>
    </section>
  );
}
