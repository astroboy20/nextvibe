"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Camera, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const pillars = [
  {
    Icon: Users,
    title: "Bring people together",
    desc: "Help your audience find events that match their location and interests, and give organizers a simpler way to manage RSVPs.",
    iconClass: "text-primary bg-secondary",
  },
  {
    Icon: Camera,
    title: "Make moments last",
    desc: "VibeTags connect event photos and videos to a shared memory bank, with postcards people can revisit and share.",
    iconClass: "text-primary bg-primary/10",
  },
  {
    Icon: Gamepad2,
    title: "Make events more fun",
    desc: "Introduce interactive games, trivia, and challenges that give guests more reasons to connect and participate.",
    iconClass: "text-foreground bg-muted",
  },
] as const;

export default function WhyNextvibeSection() {
  return (
    <section id="why" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="grid gap-6 md:grid-cols-2 md:items-end"
        >
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
              A product worth sharing
            </p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              The party ends.<br />
              The memories don&apos;t have to.
            </h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            NextVibe brings event discovery, shared memories, and real-time fun
            together. Give your community something more than another event link.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((item, i) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="rounded-lg border border-border bg-card p-7"
            >
              <div
                className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg ${item.iconClass}`}
              >
                <item.Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.article>
          ))}
        </div>

        <Button asChild variant="link" className="mt-5 px-0">
          <Link href="/how-it-works">
            Get to know NextVibe <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
