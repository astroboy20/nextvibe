"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, HelpCircle, MessageCircle, Mail,
  ChevronDown, ChevronUp, ExternalLink, Send, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/navbar/bottom-navbar";

const faqs = [
  {
    q: "How do I create an event?",
    a: "Tap the + button in the bottom navigation bar, fill in your event details across the steps, and publish when ready.",
  },
  {
    q: "How do I RSVP to an event?",
    a: "Open the event, go to the RSVP tab, select a ticket tier, complete payment if required, and your RSVP will be confirmed automatically.",
  },
  {
    q: "What is a VibeTag?",
    a: "A VibeTag is a branded overlay applied to every postcard created at your event. You can create one per activity phase (Pre-Event, Main Event, Post-Event, Both).",
  },
  {
    q: "How do games work?",
    a: "Organizers create game sessions and activate them from the Gamification Hub. Attendees must check in to the event first, then join active sessions and answer questions in real time.",
  },
  {
    q: "Why can't I message someone?",
    a: "You can only start a direct conversation with mutual followers — people who follow you back.",
  },
  {
    q: "How do I check in to an event?",
    a: "Go to the event's Games tab. If you haven't checked in yet, tap the Check In button. Your QR code is scanned automatically.",
  },
  {
    q: "How do I get my ticket refunded?",
    a: "Refund requests are handled by the event organizer. Contact them directly via the event chat or reach out to our support team.",
  },
  {
    q: "How do I share an event?",
    a: "Open the event detail page and tap the Share button in the top right. On mobile it opens the native share sheet; on desktop it copies the link.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-sm text-foreground">{q}</p>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />}
      </div>
      {open && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </button>
  );
}

export default function HelpPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    setIsSending(true);
    // Simulate send — replace with real support API when available
    await new Promise((r) => setTimeout(r, 1200));
    setIsSending(false);
    setSubject("");
    setMessage("");
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Help & Support</h1>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-6">

        {/* Quick contact */}
        <div className="grid grid-cols-2 gap-3">
          <a href="mailto:support@nextvibe.co" className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">Email Us</p>
                <p className="text-xs text-muted-foreground">support@nextvibe.co</p>
              </CardContent>
            </Card>
          </a>
          <a href="https://nextvibe.co/contact" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <ExternalLink className="h-5 w-5 text-accent" />
                </div>
                <p className="font-semibold text-sm">Help Center</p>
                <p className="text-xs text-muted-foreground">nextvibe.co/contact</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Send a Message</h2>
          </div>
          <Card>
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                placeholder="Describe your issue or question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button
                className="w-full gap-2 bg-[#531342] hover:bg-[#531342]/90 text-white"
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</>
                  : <><Send className="h-4 w-4" />Send Message</>}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
