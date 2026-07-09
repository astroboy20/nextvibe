import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Wedding Photo Sharing App — Shared Album for All Your Guests",
  description:
    "Let every wedding guest contribute to one shared photo album via QR code. VibeTags, digital postcards, smart RSVP, and a permanent memory archive. Try NextVibe for your wedding.",
  keywords: [
    "wedding photo sharing app",
    "wedding guest photo album",
    "shared wedding photo album",
    "QR code wedding photos",
    "wedding photo collection app",
    "wedding memory app",
    "collect photos from wedding guests",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/use-cases/weddings",
  },
  openGraph: {
    title: "Wedding Photo Sharing App — NextVibe",
    description:
      "One QR code on each table. Every guest's photos in one shared album. Smart RSVP, digital postcards, and a permanent wedding memory archive.",
    url: "https://mynextvibe.com/use-cases/weddings",
  },
};

const weddingFeatures = [
  {
    title: "QR Code Table Cards",
    description:
      "Place a small QR code card on each table. Guests scan and start contributing photos immediately — from the ceremony, cocktail hour, and reception — all into one shared album.",
  },
  {
    title: "Smart RSVP Management",
    description:
      "Collect RSVPs, meal preferences, dietary requirements, and plus-one details through one elegant link. Send automated reminders as the wedding approaches.",
  },
  {
    title: "VibeTags for the Big Day",
    description:
      "Create a unique VibeTag for your wedding (like #SarahAndJames2025). Every photo tagged with it becomes part of a permanent, searchable wedding archive.",
  },
  {
    title: "Digital Wedding Postcards",
    description:
      "Turn your favourite guest photos into beautifully designed digital postcards. Download and print for thank-you cards, or share them digitally as keepsakes.",
  },
  {
    title: "Full Album Download",
    description:
      "After the wedding, download every single guest photo in full resolution. Your wedding memories, exactly as your guests experienced them.",
  },
  {
    title: "Event Timeline & Moments",
    description:
      "Photos are automatically timestamped and organised by moment — ceremony, first dance, cake cutting — making it easy to relive the day in order.",
  },
];

const testimonials = [
  {
    quote:
      "We got over 400 photos from guests we never would have received otherwise. Having one QR code on each table was genius — everyone used it.",
    name: "Priya & Daniel",
    detail: "Wedding, Lagos — 180 guests",
  },
  {
    quote:
      "The VibeTag meant we could find every photo from our first dance instantly. Months later we still go back and find new shots we'd never seen.",
    name: "Amaka & Tobi",
    detail: "Wedding, Abuja — 250 guests",
  },
];

const faqItems = [
  {
    q: "Do wedding guests need to download an app to upload photos?",
    a: "No. Guests scan the QR code with their phone camera and are taken directly to the shared wedding album in their mobile browser. There's no app to download and no account needed to contribute photos.",
  },
  {
    q: "Can we use NextVibe for both RSVP and photo sharing?",
    a: "Yes. NextVibe handles the full wedding digital experience — RSVP collection, automated reminders, shared photo album via QR code, VibeTags, digital postcards, and a permanent memory archive.",
  },
  {
    q: "Will guests' photos be full resolution?",
    a: "Yes. Unlike WhatsApp or social media, NextVibe stores photos at full resolution. After the wedding, the couple can download all guest photos in full quality for printing and archiving.",
  },
  {
    q: "How early should we set up our wedding VibeTag?",
    a: "We recommend setting up your wedding event on NextVibe 4–6 weeks before the wedding. This lets you share the link with guests early, use it for RSVP management, and build pre-wedding excitement.",
  },
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Wedding Photo Sharing App — NextVibe",
  url: "https://mynextvibe.com/use-cases/weddings",
  description:
    "NextVibe lets every wedding guest contribute to one shared photo album via QR code. Smart RSVP, VibeTags, digital postcards, and a permanent wedding memory archive.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mynextvibe.com" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://mynextvibe.com/use-cases" },
      { "@type": "ListItem", position: 3, name: "Weddings", item: "https://mynextvibe.com/use-cases/weddings" },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function WeddingsPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <JsonLd data={faqSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Weddings
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Every Guest&apos;s Photos, One Wedding Album
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Put a QR code on each table. Every guest scans and contributes their
            photos. No app required. Your entire wedding captured from 200
            different perspectives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              Set Up Your Wedding Album
            </Link>
            <Link
              href="/party-photo-sharing"
              className="border-2 border-[#A1349A] text-[#A1349A] px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/5 transition"
            >
              How Photo Sharing Works
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything for Your Wedding Day, Digitally
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddingFeatures.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            From Couples Who Used NextVibe
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-purple-50 rounded-2xl p-8 border-l-4 border-[#A1349A]"
              >
                <p className="text-gray-800 italic mb-4">&quot;{t.quote}&quot;</p>
                <p className="font-semibold text-[#5B1A57]">{t.name}</p>
                <p className="text-sm text-gray-500">{t.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Wedding Photo Sharing — FAQ
            </h2>
            <dl className="space-y-8">
              {faqItems.map(({ q, a }) => (
                <div key={q}>
                  <dt className="text-lg font-semibold text-gray-900 mb-2">{q}</dt>
                  <dd className="text-gray-600 leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Building Your Wedding Memory Bank
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Free to set up. Your wedding guests will thank you.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-[#5B1A57] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
            >
              Create Your Wedding Album Free
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more use cases:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/use-cases/birthday-parties" className="text-[#A1349A] hover:underline">Birthday Parties</Link>
            <Link href="/use-cases/festivals" className="text-[#A1349A] hover:underline">Festivals</Link>
            <Link href="/use-cases/corporate-events" className="text-[#A1349A] hover:underline">Corporate Events</Link>
            <Link href="/alternatives" className="text-[#A1349A] hover:underline">NextVibe vs Alternatives</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
