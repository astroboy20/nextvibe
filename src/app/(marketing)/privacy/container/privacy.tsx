"use client";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    body: 'NextVibe ("we", "us", "our") is an event discovery and memory-sharing platform built in Lagos, Nigeria. This Privacy Policy explains how we collect, use, store, and share your personal information when you use our website, mobile experience, and related services (the "Services"). By using NextVibe, you agree to the practices described here.',
  },
  {
    title: "2. Information We Collect",
    body: "Account data: name, email, phone number, password, profile photo, bio, and interests you choose during onboarding.\n\nEvent activity: events you create, RSVP to, attend, check in to, tickets you purchase, games you play, and scores you earn.\n\nUser content: postcards, photos, videos, VibeTags, comments, chat messages, and other content you upload or share.\n\nLocation data: with your permission, we use your approximate or precise location (via OpenStreetMap Nominatim) to surface nearby events. You can override this manually at any time.\n\nDevice & usage data: IP address, browser type, device identifiers, pages visited, time spent, and referral source.\n\nPayment data: handled by our payment processors. We never store full card numbers on our servers.",
  },
  {
    title: "3. How We Use Your Information",
    body: "To create and manage your account, authenticate logins, and personalize your feed.\n\nTo deliver core features: event discovery, RSVPs, ticketing, QR check-in, games, VibeTags, postcard sharing, and recaps (Monthly Dump, Yearly Wrapped).\n\nTo send transactional emails (via Resend) and push notifications about events you follow, game starts, and reward unlocks.\n\nTo improve the platform, fix bugs, and develop new features.\n\nTo prevent fraud, enforce our terms, and comply with legal obligations.",
  },
  {
    title: "4. How We Share Information",
    body: "Public profile: your username, avatar, bio, postcards, and event history are visible to other users by default. You can adjust visibility in Settings.\n\nEvent organizers: when you RSVP or buy a ticket, the organizer receives your name, email, ticket tier, and check-in status.\n\nService providers: Supabase (database, auth, storage), Resend (email), QRServer (QR generation), and analytics providers, all bound by data-processing agreements.\n\nLegal: when required by law, court order, or to protect rights, safety, and property.\n\nWe do not sell your personal information.",
  },
  {
    title: "5. Cookies & Tracking",
    body: "We use cookies and similar technologies to keep you signed in, remember preferences, and measure how the Services are used. You can disable cookies in your browser, but some features may stop working.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your account data for as long as your account is active. Postcards, event history, and recaps are kept so your memory bank stays intact. You can delete content or your account at any time from Settings; backups are purged within 30 days.",
  },
  {
    title: "7. Your Rights",
    body: "Subject to applicable law (including the Nigeria Data Protection Act 2023 and GDPR where relevant), you have the right to access, correct, export, restrict, or delete your personal data, and to withdraw consent. Contact us at privacy@nextvibe.app to exercise these rights.",
  },
  {
    title: "8. Security",
    body: "We use Row Level Security, encrypted connections (HTTPS/TLS), and strict access controls. No system is 100% secure—if you suspect unauthorized access to your account, contact us immediately.",
  },
  {
    title: "9. Children",
    body: "NextVibe is not directed to children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us data, contact us and we will delete it.",
  },
  {
    title: "10. International Transfers",
    body: "Our infrastructure may process data in regions outside Nigeria. Where required, we use appropriate safeguards for cross-border transfers.",
  },
  {
    title: "11. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be notified via email or in-app banner. Continued use of the Services after changes means you accept the updated policy.",
  },
  {
    title: "12. Contact Us",
    body: "Questions, requests, or concerns? Email privacy@nextvibe.app or write to NextVibe, Lagos, Nigeria.",
  },
];

export default function Privacy() {
  const lastUpdated = "May 13, 2026";

  return (
    <div className="min-h-screen bg-background  ">
      <main className="container px-4 pt-28 pb-20 max-w-3xl  mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-4">
            <Shield className="h-3.5 w-3.5" />
            Last updated: {lastUpdated}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Your memories belong to you. This policy explains how NextVibe
            collects, uses, and protects your data.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.section
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <h2 className="text-xl font-semibold mb-2">{s.title}</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {s.body}
              </p>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
}
