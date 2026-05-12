"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 24 } as const,
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+234 705 177 0030",
    sub: "Mon – Sat, 9am – 6pm (WAT)",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@mynextvibe.co,",
    sub: "General inquiries",
  },
  { icon: MapPin, label: "Office", value: "Lagos, Nigeria", sub: "" },
];


const responseTimes = [
  { channel: "Phone", time: "Immediate (during hours)" },
  { channel: "Email (support)", time: "Within 2 hours" },
  { channel: "Email (general)", time: "Within 24 hours" },
  { channel: "DM (Instagram/Twitter)", time: "Within 4 hours" },
  { channel: "WhatsApp", time: "Within 1 hour" },
];

const socials = [
  {
    name: "Instagram",
    handle: "@mynextvibe",
    url: "https://instagram.com/nextvibe",
    icon: Instagram,
  },
  {
    name: "TikTok",
    handle: "@mynextvibe",
    url: "https://tiktok.com/@mynextvibe",
    icon: Film,
  },
  {
    name: "Twitter/X",
    handle: "@mynextvibe",
    url: "https://twitter.com/mynextvibe",
    icon: AtSign,
  },
  {
    name: "Facebook",
    handle: "@nextvibe",
    url: "https://facebook.com/mynextvibe",
    icon: Facebook,
  },
];

function Film(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
function AtSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

export default function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
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
            Contact Us
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4"
          >
            Have a question?{" "}
            <span className="text-gradient">
              We&apos;d love to hear from you.
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-muted-foreground"
          >
            We&apos;re here for you. 7 days a week.
          </motion.p>
        </section>

        {/* Quick Contact */}
        <section className="container px-4 max-w-4xl mx-auto mb-16">
          <div className="grid sm:grid-cols-3 gap-6">
            {contactInfo.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-border bg-card p-6 text-center shadow-card"
                >
                  <Icon className="h-6 w-6 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {c.value}
                  </p>
                  {c.sub && (
                    <p className="text-xs text-muted-foreground">{c.sub}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Email Directory & Response Times */}
        <section className="container px-4 max-w-4xl mx-auto mb-16 grid md:grid-cols-1 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Response Times
              </h3>
            </div>
            <div className="space-y-3">
              {responseTimes.map((r) => (
                <div
                  key={r.channel}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-muted-foreground">{r.channel}</span>
                  <span className="text-foreground font-medium">{r.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Social */}
        <section className="container px-4 max-w-3xl mx-auto mb-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="font-display text-xl font-bold text-center mb-6 text-foreground"
          >
            Follow Us
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {socials.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="rounded-xl border border-border bg-card p-4 text-center shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.handle}</p>
                </motion.a>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section className="container px-4 max-w-2xl mx-auto mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card p-8 shadow-card"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" placeholder="+234..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Event Organizer",
                        "Attendee",
                        "Brand/Sponsor",
                        "Investor",
                        "Press/Media",
                        "Other",
                      ].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "General Question",
                        "Technical Support",
                        "Partnership Inquiry",
                        "Sales/Pricing",
                        "Report an Issue",
                        "Other",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#5b1a57] hover:bg-[#4a1446] text-white"
                disabled={sending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </section>

        {/* Partners */}
        <section className="bg-gradient-vibe py-16">
          <div className="container px-4 max-w-3xl mx-auto text-primary-foreground text-center">
            <h2 className="font-display text-2xl font-bold mb-8">
              Partner With Us
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: "Brands & Sponsors",
                  desc: "Reach engaged audiences at real events.",
                  email: "hey@mynextvibe.com",
                },
                {
                  title: "Event Organizers",
                  desc: "Bring NextVibe to your venue.",
                  email: "hey@mynextvibe.com",
                },
                {
                  title: "Investors",
                  desc: "Join us on our journey.",
                  email: "hey@mynextvibe.com",
                },
              ].map((p, i) => (
                <motion.div
                  key={p.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="bg-primary-foreground/10 rounded-xl p-6"
                >
                  <h3 className="font-bold text-sm mb-2">{p.title}</h3>
                  <p className="text-xs opacity-80 mb-3">{p.desc}</p>
                  <a
                    href={`mailto:${p.email}`}
                    className="text-xs font-semibold underline"
                  >
                    {p.email}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
