"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface FAQItem {
  q: string;
  a: string;
}

const sections: { title: string; id: string; items: FAQItem[] }[] = [
  {
    title: "For Organizers",
    id: "organizers",
    items: [
      {
        q: "How much does NextVibe cost for organizers?",
        a: "Basic event pages are always free – including RSVP and discovery. Premium features (VibeTags and Gamification) start at ₦5,000 for Micro events (1-50 people). We price by attendee count so smaller events pay less.",
      },
      {
        q: "What's the difference between Pre-event and Main event features?",
        a: "Pre-event features help you build buzz, sell tickets, and engage attendees BEFORE they arrive. Main event features keep people engaged DURING the event and capture memories. You can buy either one, or bundle both and save up to 29%.",
      },
      {
        q: "How does the gamification work?",
        a: "When you purchase Gamification, you get 2 games included. Choose from Trivia, Word Puzzle, 2 Truths 1 Lie, or This or That. Let AI generate questions from a simple prompt or write them yourself. Need more than 2 games? Add them at ₦2,000 – ₦15,000 depending on your event size.",
      },
      {
        q: "What is a VibeTag and why do I need it?",
        a: "A VibeTag is our replacement for hashtags. It's your event's digital signature. When attendees use your VibeTag on their photos and videos, everything gets automatically collected into one beautiful gallery – no spam, no lost memories, no chaos.",
      },
      {
        q: "Can I sell tickets through NextVibe?",
        a: "Yes! For paid events, you can create ticket packages (Early Bird, VIP, Regular), set quantities and prices, and sell directly through the platform. QR codes are generated automatically for every ticket.",
      },
      {
        q: "What analytics do I get?",
        a: "Your dashboard shows total views, RSVP breakdown, ticket sales, postcards uploaded, game participation rates, engagement score, and top postcards. After your event, we email you a full report – perfect for proving ROI to sponsors.",
      },
      {
        q: "Can I make my event private?",
        a: "Yes! Toggle 'Make Event Private' during setup. Private events don't appear in public feeds – only people with the direct link can find them.",
      },
      {
        q: "Can I get a refund if I cancel my event?",
        a: "Yes! Full refund within 7 days if event is cancelled and features haven't been used. Partial refunds considered case-by-case.",
      },
    ],
  },
  {
    title: "For Attendees",
    id: "attendees",
    items: [
      {
        q: "How much does NextVibe cost for attendees?",
        a: "Absolutely nothing. Zero. Naira. Ever. Creating postcards, playing games, chatting with friends – all free. Forever.",
      },
      {
        q: "Do I need an account to see events?",
        a: "You can browse public events without an account, but to RSVP, play games, create postcards, or chat, you'll need to sign up. It's free and takes 2 minutes.",
      },
      {
        q: "What happens to my photos after I post them?",
        a: "They live forever in the event's gallery. You can revisit them anytime. They won't disappear when your phone dies or your Instagram story expires.",
      },
      {
        q: "Can I see who else is going to an event?",
        a: "Yes! On the event page, you can see people who've RSVP'd 'Going.' You can tap their profiles, view their public postcards, and even send them a message.",
      },
      {
        q: "What is the Monthly Dump?",
        a: "On the 1st of every month, we send you a summary: events attended, postcards created, games played, leaderboard wins, new connections, and rewards earned. It's a shareable report card for your social life.",
      },
      {
        q: "What is Yearly Wrapped?",
        a: "Every December 31st, we create a cinematic recap of your entire year in events. Your top moments, total hours celebrated, event personality, and more. Think Spotify Wrapped, but for your actual life.",
      },
      {
        q: "Can I message other attendees?",
        a: "Yes! In the VibePod chat, you can send direct messages to other attendees. Perfect for coordinating meetups or making friends before you arrive.",
      },
      {
        q: "What is VibeTribe?",
        a: "VibeTribe is your network of connections on NextVibe. See what events they're attending, scroll their postcards, and discover new events through them.",
      },
      {
        q: "I'm going alone. Will I be awkward?",
        a: "Not anymore! Join the event chat, introduce yourself, and DM a few people before the event. By the time you arrive, you'll already have friends waiting.",
      },
    ],
  },
  {
    title: "General",
    id: "general",
    items: [
      {
        q: "What is NextVibe, in one sentence?",
        a: "NextVibe is the digital memory bank for events – where every celebration gets a forever home.",
      },
      {
        q: "Who is NextVibe for?",
        a: "Everyone! Event organizers (from birthday hosts to festival producers) and event attendees (from first-timers to professional party-goers).",
      },
      {
        q: "Do I have to choose between organizer or attendee?",
        a: "No! Use the role toggle in your profile to switch between Organizer Mode and Attendee Mode. Same account, different tools.",
      },
      {
        q: "Is NextVibe only for big events?",
        a: "Not at all! Our Micro tier (1-50 people) is perfect for intimate gatherings. Your event matters, no matter the size.",
      },
      {
        q: "Is NextVibe available outside Nigeria?",
        a: "Currently we're focused on Nigeria, but we're expanding in 2026! Follow us on social media for updates.",
      },
      {
        q: "How is NextVibe different from Eventbrite or Ticketmaster?",
        a: "They sell tickets. We preserve memories. They're transactional. We're relational. No other platform gives you forever storage, gamification, and social features all in one place.",
      },
    ],
  },
  {
    title: "Technical",
    id: "technical",
    items: [
      {
        q: "Do I need to download an app?",
        a: "You can use NextVibe on web (nextvibe.co) right now. Mobile apps for iOS and Android are coming soon!",
      },
      {
        q: "What phones does NextVibe work on?",
        a: "Any smartphone with a modern browser. We're optimized for all devices.",
      },
      {
        q: "How much storage do I get for photos?",
        a: "20 postcards per event.",
      },
      {
        q: "Is my data safe?",
        a: "Absolutely. We use industry-standard encryption, never sell your data, and give you full control over your privacy settings.",
      },
      {
        q: "Can I delete my photos?",
        a: "Yes. You can delete individual postcards anytime from your profile. Once deleted, they're gone from our servers.",
      },
      {
        q: "I found a bug. What do I do?",
        a: "Email bugs@nextvibe.co with a description and screenshot if possible. We'll fix it fast!",
      },
    ],
  },
  {
    title: "Pricing & Payments",
    id: "pricing",
    items: [
      {
        q: "Is there a free trial?",
        a: "Yes! Your first Micro event (1-50 people) gets a free VibeTag. Try it out, see the magic, then decide.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Card (Paystack), Bank Transfer, and USSD. More options coming soon.",
      },
      {
        q: "When do I pay?",
        a: "You pay when you're ready to activate premium features. Your basic event page is free forever.",
      },
      {
        q: "Can I upgrade after purchasing?",
        a: "Yes! You can upgrade from Single to Bundle anytime – just pay the difference.",
      },
      {
        q: "Do I pay per attendee?",
        a: "No! You pay a flat fee based on your expected attendee range.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    id: "account",
    items: [
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete Account. This is permanent and cannot be undone.",
      },
      {
        q: "Can I make my profile private?",
        a: "Yes. In Settings, you can choose who can see your profile, postcards, and event history.",
      },
      {
        q: "I forgot my password. Help!",
        a: "Click 'Forgot Password' on the login screen. We'll email you a reset link.",
      },
      {
        q: "How do I report inappropriate content?",
        a: "Tap the three dots on any postcard or message → Report. Our team reviews reports within 24 hours.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 ">
        {/* Hero */}
        <section className="container px-4 py-16 md:py-24 text-center max-w-3xl mx-auto">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            FAQ
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4"
          >
            You&apos;ve got questions.{" "}
            <span className="text-gradient">We&apos;ve got answers.</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-muted-foreground"
          >
            Can&apos;t find what you&apos;re looking for? Reach out – we&apos;re
            here to help.
          </motion.p>
        </section>

        {/* Quick Nav */}
        <section className="container px-4 max-w-3xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {s.title}
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Sections */}
        <div className="container px-4 max-w-3xl mx-auto space-y-12 mb-16">
          {sections.map((section, si) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={si}
              variants={fadeUp}
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-4">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${section.id}-${i}`}
                    className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/50"
                  >
                    <AccordionTrigger className="text-sm text-left font-semibold text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>
          ))}
        </div>

        {/* Still Have Questions */}
        <section className="bg-gradient-vibe p-16">
          <div className="container px-4 max-w-2xl mx-auto text-center text-primary-foreground">
            <h2 className="font-display text-2xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="opacity-80 mb-8 text-sm">We&apos;re here for you.</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: Phone,
                  label: "Call Us",
                  value: "+234 705 177 0030",
                  sub: "Mon-Sat, 9am-6pm",
                },
                {
                  icon: Mail,
                  label: "Email Us",
                  value: "support@nextvibe.co",
                  sub: "Within 2 hours",
                },
                {
                  icon: MessageCircle,
                  label: "DM Us",
                  value: "@mynextvibe",
                  sub: "Instagram or Twitter",
                },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="bg-primary-foreground/10 rounded-xl p-4"
                  >
                    <Icon className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-xs font-bold">{c.label}</p>
                    <p className="text-xs">{c.value}</p>
                    <p className="text-xs opacity-70">{c.sub}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
