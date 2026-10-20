"use client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import ApplyButton from "./apply-button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative isolate min-h-[530px] overflow-hidden text-white md:min-h-[590px]">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/affiliate-community.jpg"
        alt="Friends capturing a shared moment at a Lagos rooftop gathering"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[63%_center] md:object-center"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-black/65 md:bg-black/55" />

      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/80"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            The NextVibe affiliate program
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-5xl font-extrabold leading-[1.1] text-white md:text-6xl"
          >
            NextVibe.<br />
            Share the vibe.<br />
            <span className="text-primary">Grow with us.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mt-6 max-w-md text-lg leading-relaxed text-white/80"
          >
            You bring people together. We help their memories live on. Turn your
            love for great events into a partnership with NextVibe.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="mt-8"
          >
            <ApplyButton variant="default" />
            <p className="mt-4 text-sm text-white/70">
              For creators, connectors, and the people behind the party.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-5 right-8 hidden items-center gap-2 text-sm text-white/80 md:flex">
        <MapPin className="h-4 w-4" />
        Born in Lagos. Built for connection.
      </div>
    </section>
  );
}
