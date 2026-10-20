"use client";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import ApplyButton from "./apply-button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function CtaBanner() {
  return (
    <section className="border-y border-border bg-primary py-12 text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 px-5 md:flex-row md:items-center lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="max-w-2xl"
        >
          <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-foreground/70">
            <Megaphone className="h-4 w-4" />
            More than a promotion
          </p>
          <h2 className="text-3xl font-bold">Your community. A lasting impact.</h2>
          <p className="mt-3 leading-relaxed text-primary-foreground/80">
            From birthdays and weddings to concerts and campus hangouts, help
            more people keep the moments that matter.
          </p>
        </motion.div>

        <ApplyButton variant="secondary" className="shrink-0 self-start md:self-auto" />
      </div>
    </section>
  );
}
