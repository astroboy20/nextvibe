"use client";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: 'Welcome to NextVibe. These Terms of Service ("Terms") govern your access to and use of the NextVibe website, mobile experience, and related services (the "Services"), operated from Lagos, Nigeria. By creating an account or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Services.',
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 13 years old to use NextVibe. If you are under 18, you must have permission from a parent or legal guardian. By using the Services you represent that you meet these requirements and that the information you provide is accurate.",
  },
  {
    title: "3. Your Account",
    body: "You are responsible for safeguarding your login credentials and for all activity under your account. Notify us immediately at support@nextvibe.app of any unauthorized use. We may suspend or terminate accounts that violate these Terms or pose risk to the community.",
  },
  {
    title: "4. User Content",
    body: 'You retain ownership of the postcards, photos, videos, VibeTags, comments, and other content you upload ("User Content"). By posting User Content, you grant NextVibe a worldwide, non-exclusive, royalty-free license to host, display, reproduce, adapt, and distribute it for the purpose of operating and promoting the Services.\n\nYou are solely responsible for your User Content and represent that you have all necessary rights to share it.',
  },
  {
    title: "5. Acceptable Use",
    body: "You agree not to: post unlawful, hateful, harassing, defamatory, sexually explicit, or infringing content; impersonate others; spam or scrape the Services; attempt to bypass security or rate limits; sell tickets you do not control; or use the Services to organize illegal activity. We may remove content and ban users at our discretion.",
  },
  {
    title: "6. Events, Tickets & RSVPs",
    body: "Organizers are responsible for the accuracy of their event listings, tier descriptions, refund policies, and on-site execution. NextVibe acts as a discovery and ticketing platform, not the event host. Tickets are personal; resale is allowed only where the organizer permits it. QR codes are single-use and must not be shared.",
  },
  {
    title: "7. Payments, Fees & Refunds",
    body: "Payments are processed by third-party providers. NextVibe charges service and platform fees disclosed at checkout. Refunds are governed by the organizer's policy on each event page. Chargebacks issued in bad faith may result in account suspension.",
  },
  {
    title: "8. Games, Rewards & VibeTags",
    body: "Game scores, leaderboards, and rewards are provided for entertainment. We may adjust, reset, or revoke scores and rewards in cases of cheating, abuse, or technical error. Premium features (VibeTag Studio, Gamification Hub) are subject to the pricing tier active at time of purchase.",
  },
  {
    title: "9. Intellectual Property",
    body: "The NextVibe name, logo, designs, and software are owned by NextVibe and protected by intellectual property law. Except for the limited rights granted to use the Services, no rights are transferred to you.",
  },
  {
    title: "10. Third-Party Services",
    body: "The Services integrate with third parties such as Supabase, Resend, OpenStreetMap Nominatim, and QRServer. We are not responsible for the availability, content, or practices of third-party services.",
  },
  {
    title: "11. Termination",
    body: "You may delete your account at any time from Settings. We may suspend or terminate your access immediately, with or without notice, if you breach these Terms or if we discontinue the Services. Sections that by their nature should survive termination will survive.",
  },
  {
    title: "12. Disclaimers",
    body: 'The Services are provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Services will be uninterrupted, error-free, or secure.',
  },
  {
    title: "13. Limitation of Liability",
    body: "To the maximum extent permitted by law, NextVibe and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill, or other intangible losses arising from your use of the Services. Our aggregate liability for any claim shall not exceed the greater of NGN 20,000 or the amount you paid us in the 12 months preceding the claim.",
  },
  {
    title: "14. Indemnification",
    body: "You agree to indemnify and hold harmless NextVibe, its affiliates, and personnel from any claims, damages, liabilities, and expenses arising from your User Content, your use of the Services, or your breach of these Terms.",
  },
  {
    title: "15. Governing Law & Disputes",
    body: "These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved in the courts of Lagos State, Nigeria, except where mandatory consumer protection laws of your jurisdiction apply.",
  },
  {
    title: "16. Changes to These Terms",
    body: "We may update these Terms from time to time. Material changes will be communicated via email or in-app banner. Continued use of the Services after changes take effect constitutes acceptance of the updated Terms.",
  },
  {
    title: "17. Contact Us",
    body: "Questions about these Terms? Email support@nextvibe.app or write to NextVibe, Lagos, Nigeria.",
  },
];

export default function Terms() {
  const lastUpdated = "May 13, 2026";

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 pt-28 pb-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-4">
            <FileText className="h-3.5 w-3.5" />
            Last updated: {lastUpdated}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            The rules of the road for using NextVibe — please read carefully
            before joining the vibe.
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
