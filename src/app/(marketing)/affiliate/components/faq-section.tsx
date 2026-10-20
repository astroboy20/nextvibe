"use client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const faqs: [string, string][] = [
  [
    "Who is this program for?",
    "Creators, event planners, campus communities, venues, and people who connect others to great experiences. Tell us about your audience and how you would introduce NextVibe.",
  ],
  [
    "What will I be promoting?",
    "NextVibe helps people discover events, manage RSVPs, play event games, and save shared memories through VibeTags and photo or video postcards. Basic event creation and RSVP management are free; VibeTags and games are premium features.",
  ],
  [
    "How much can I earn?",
    "You earn 5% commission on every deal you close, and 10% on any event you create yourself.",
  ],
  [
    "Do I need a large following?",
    "No. Whether you reach an online audience, a campus, a venue, or an event network, every deal you close counts.",
  ],
  [
    "How do I join?",
    "Sign in or create a free NextVibe account to get started as an affiliate.",
  ],
];

export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-border bg-muted/40 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            Good questions
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">Before you join.</h2>
          <p className="mt-4 text-muted-foreground">
            The details matter. Here&apos;s what to know.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          variants={fadeUp}
        >
          <Accordion type="single" collapsible>
            {faqs.map(([question, answer], index) => (
              <AccordionItem key={question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base font-bold">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
