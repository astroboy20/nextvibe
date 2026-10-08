"use client"
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail, Instagram } from "lucide-react";

const faqs = [
  {
    q: "What is NextVibe?",
    a: "NextVibe is a digital memory bank for events. It replaces broken hashtags with VibeTags — permanent, branded digital stamps that collect every photo and video from your event into one beautiful gallery, forever. Think Google for discovering events + YouTube for preserving them.",
  },
  {
    q: "Who is NextVibe for?",
    a: "Everyone who attends or hosts events. Organizers sell tickets, run games, capture memories and prove ROI. Attendees discover events, meet people and relive moments. Brands sponsor engagement and get measurable ROI. From birthdays and weddings to conferences and concerts.",
  },
  {
    q: "How is NextVibe different from Instagram, WhatsApp or Eventbrite?",
    a: "Instagram shows photos for 24 hours. WhatsApp destroys quality and media expires. Eventbrite only sells tickets. NextVibe does it all in one place: VibeTag (preservation) + Gamification (engagement) + Ticketing (sales) + VibePod (community) + Analytics (proof).",
  },
  {
    q: "How much does NextVibe cost for attendees?",
    a: "Absolutely nothing. Zero. Forever. Discover events, join VibePod chats, play games, create postcards and win rewards — all free. We make money from organizers and brands, not attendees.",
  },
  {
    q: "What do I get with a campaign bundle?",
    a: "Every bundle includes 1 VibeTag + 1 Gamification package (2 games included) for ONE event of the selected size. Campaign backers get 3 bundles for the price of 1. Example: the Micro tier ($10) gives you 3 Micro Mega Bundles — normal price $15.",
  },
  {
    q: "Can I use my bundles for different events?",
    a: "Yes. Each bundle is a separate coupon code. Use all 3 for your own events, gift some to friends, or save them for later. You have 12–24 months to use them depending on tier.",
  },
  {
    q: "When will I receive my rewards?",
    a: "Coupon codes within 7 days after the campaign ends. Digital rewards (VIP badge, Hall of Fame) within 14 days. Physical merch (t-shirts, hoodies, stickers) within 30 days.",
  },
  {
    q: "How do I redeem my bundles?",
    a: "After the campaign ends you'll receive a survey email. Fill in your details and any preferences (t-shirt size etc.), and you'll get coupon codes within 7 days. Apply the code at checkout when you create an event and the bundle is applied automatically. You can gift bundles by entering a friend's email in the survey.",
  },
  {
    q: "Can I get a refund?",
    a: "Pre-launch pledges are not refundable unless the campaign fails to meet its goal. Once successfully funded, your pledge supports development and reward fulfillment. If anything's wrong with your reward, contact us and we'll make it right.",
  },
  {
    q: "Do I need to download an app?",
    a: "Right now NextVibe is a web app that works on any browser. Native iOS and Android apps are coming September 2026 — funded by this pre-launch campaign.",
  },
  {
    q: "What if the platform goes down during my event?",
    a: "We have a 99.5% uptime guarantee. In the rare case of an issue our engineering team responds within 1 hour. We've successfully run events with 500+ attendees without issues.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We use industry-standard encryption, never sell your data, and you control your privacy settings.",
  },
];

export default function LaunchFAQ() {
  return (
    <section id="faq" className="container mx-auto max-w-3xl mt-24 mb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <HelpCircle className="h-4 w-4" />
          Campaign FAQ
        </span>
        <h2 className="mt-6 font-display text-3xl sm:text-4xl font-bold">
          Got <span className="text-gradient">questions?</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know about backing NextVibe.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl bg-white/60 glass p-2 sm:p-4 shadow-card"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
              <AccordionTrigger className="text-left font-medium px-3 hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Still have questions?{" "}
        <a
          href="mailto:hey@mynextvibe.com"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <Mail className="h-3.5 w-3.5" /> hey@mynextvibe.com
        </a>{" "}
        ·{" "}
        <a
          href="https://instagram.com/mynextvibe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <Instagram className="h-3.5 w-3.5" /> @mynextvibe
        </a>
      </div>
    </section>
  );
}
