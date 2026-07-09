import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Event Memory App — Capture, Organise & Relive Event Moments",
  description:
    "NextVibe is the event memory app that captures shared photos, videos, and moments from any event. VibeTags, digital postcards, smart RSVP, and event games — all in one place.",
  keywords: [
    "event memory app",
    "event photo app",
    "capture event memories",
    "event photo sharing app",
    "digital memory bank events",
    "event album app",
    "party memory app",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/event-memory-app",
  },
  openGraph: {
    title: "Event Memory App — NextVibe",
    description:
      "NextVibe captures shared photos, videos, and experiences from any event. VibeTags, digital postcards, event games, and smart RSVP.",
    url: "https://mynextvibe.com/event-memory-app",
  },
};

const memoryChallenges = [
  {
    problem: "Photos scattered across 50 different phones",
    solution:
      "One shared album, one QR code. Every guest's photos land in the same place automatically.",
  },
  {
    problem: "Can't find your own photos from the event",
    solution:
      "VibeTags make every photo searchable by person, moment, or location — find your photos in seconds.",
  },
  {
    problem: "Lost memories from events years ago",
    solution:
      "NextVibe archives every event digitally. Your memories live in a searchable bank, not buried in someone's camera roll.",
  },
  {
    problem: "No one captures the in-between moments",
    solution:
      "Event games and photo challenges encourage guests to document candid moments they'd otherwise miss.",
  },
];

const coreFeatures = [
  {
    name: "VibeTags",
    description:
      "The core of NextVibe's memory system. A VibeTag is a unique identifier for your event — like a hashtag with superpowers. Every photo, video, and moment tagged under it becomes part of a permanent, searchable memory archive.",
  },
  {
    name: "Shared Photo & Video Albums",
    description:
      "All guests contribute to a single shared album via QR code. No app required to upload. Full-resolution downloads available after the event.",
  },
  {
    name: "Digital Postcards",
    description:
      "Turn the best photos into beautifully designed digital postcards. Share them on social media, download for printing, or send as digital keepsakes.",
  },
  {
    name: "Event Games",
    description:
      "Interactive photo challenges, trivia, and scavenger hunts that give guests a reason to capture more moments. Live leaderboards keep the energy high.",
  },
  {
    name: "Smart RSVP",
    description:
      "Track who's coming, manage guest lists, send automated reminders, and collect dietary or accessibility requirements — all linked to your event.",
  },
  {
    name: "NextvibePilot",
    description:
      "AI-powered event analytics that track real engagement — not just headcount. See which moments resonated, which content got shared, and how your event performed.",
  },
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Event Memory App — NextVibe",
  url: "https://mynextvibe.com/event-memory-app",
  description:
    "NextVibe is a digital memory bank for events. Shared photos via QR code, VibeTags, event games, digital postcards, and smart RSVP.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mynextvibe.com" },
      { "@type": "ListItem", position: 2, name: "Event Memory App", item: "https://mynextvibe.com/event-memory-app" },
    ],
  },
};

export default function EventMemoryAppPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Event Memory App
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your Event&apos;s Digital Memory Bank
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            NextVibe captures every photo, video, and moment from your events —
            organised automatically, searchable forever. The YouTube + Google
            for events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              Start Capturing Memories Free
            </Link>
            <Link
              href="/how-it-works"
              className="border-2 border-[#A1349A] text-[#A1349A] px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/5 transition"
            >
              See How It Works
            </Link>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              The Problem with Event Memories Today
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
              Great events happen. Then the memories get lost across dozens of
              phones, WhatsApp threads, and forgotten Google Drive folders.
              NextVibe fixes that.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {memoryChallenges.map((item) => (
                <div
                  key={item.problem}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <p className="text-[#A1349A] font-semibold mb-3 flex items-center gap-2">
                    <span className="text-lg">✗</span> {item.problem}
                  </p>
                  <p className="text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features deep-dive */}
        <section className="py-20 max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How NextVibe Captures and Preserves Event Memories
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Six interconnected features that work together to turn any event
            into a permanent, searchable memory.
          </p>
          <div className="space-y-8">
            {coreFeatures.map((f, i) => (
              <div key={f.name} className="flex gap-6 items-start">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#A1349A] to-[#5B1A57] text-white font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{f.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="bg-purple-50 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Built for Everyone at the Event
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Organizers</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get real engagement analytics, a content goldmine of
                  user-generated photos, and tools that drive ticket sales
                  before the event even starts.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Attendees</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Find every photo and video of yourself from the event. Earn
                  rewards for contributing content. Build a searchable archive
                  of your event experiences.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Brands</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sponsor authentic moments rather than static banners. Get
                  measurable engagement data and user-generated content from
                  real event attendees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Building Your Event Memory Bank
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Free to create an account. Your next event&apos;s memories are waiting.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-[#5B1A57] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
            >
              Create Your Free Account
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/party-photo-sharing" className="text-[#A1349A] hover:underline">Party Photo Sharing</Link>
            <Link href="/use-cases/weddings" className="text-[#A1349A] hover:underline">Wedding Memory App</Link>
            <Link href="/use-cases/festivals" className="text-[#A1349A] hover:underline">Festival Memory App</Link>
            <Link href="/alternatives" className="text-[#A1349A] hover:underline">NextVibe vs Alternatives</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
