"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Percent, CalendarPlus, Users, Camera, Gamepad2 } from "lucide-react";

const perks = [
  {
    Icon: Users,
    title: "Creators & connectors",
    desc: "Campus reps, content creators, event enthusiasts — anyone who brings people together.",
  },
  {
    Icon: Camera,
    title: "Share something real",
    desc: "NextVibe isn't just another link. It's a memory bank, a discovery platform, and a game — all in one.",
  },
  {
    Icon: Gamepad2,
    title: "Built for Lagos",
    desc: "Born from the event scene here. If it works in Lagos, it works anywhere.",
  },
];

const AffiliateSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      {/* Subtle background blob */}
      <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-purple-100 blur-3xl opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-block rounded-full bg-[#5b1a57]/10 px-4 py-1.5 text-sm font-semibold text-[#5b1a57] mb-4">
            Affiliate Program
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl mb-4">
            Share the vibe.{" "}
            <span className="bg-clip-text text-transparent bg-[#5b1a57]">
              Get paid.
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You bring people together. We help their memories live on. Turn your
            love for great events into a real income stream.
          </p>
        </motion.div>

        {/* Commission cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md text-center"
          >
            <Percent className="h-7 w-7 text-[#5b1a57] mx-auto mb-3" />
            <p className="text-5xl font-extrabold text-[#5b1a57]">5%</p>
            <p className="mt-2 font-semibold text-gray-900">On every deal you close</p>
            <p className="mt-1 text-sm text-gray-500">
              Bring an organizer or brand to NextVibe and earn.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-[#5b1a57]/20 bg-[#5b1a57] p-8 shadow-md text-center text-white"
          >
            <CalendarPlus className="h-7 w-7 mx-auto mb-3" />
            <p className="text-5xl font-extrabold">10%</p>
            <p className="mt-2 font-semibold">On events you create</p>
            <p className="mt-1 text-sm text-white/80">
              Create the event yourself and double your commission.
            </p>
          </motion.div>
        </div>

        {/* Perks */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {perks.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="shrink-0 h-10 w-10 rounded-xl bg-[#5b1a57]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#5b1a57]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link
            href="/affiliate"
            className="inline-flex items-center gap-2 bg-[#5b1a57] hover:bg-[#4a1446] text-white px-8 py-4 rounded-xl font-semibold text-base transition-colors"
          >
            Join the program <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Free to join. No minimum following required.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AffiliateSection;
