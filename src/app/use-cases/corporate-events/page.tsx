import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Corporate Event App — Photo Sharing, RSVP & Engagement",
  description:
    "NextVibe powers corporate events, conferences, and team gatherings. Shared photo albums, smart RSVP, event games, live analytics, and brand sponsorship tools — all in one platform.",
  keywords: [
    "corporate event app",
    "corporate event photo sharing",
    "conference photo sharing",
    "team event memory app",
    "corporate event RSVP",
    "corporate event engagement app",
    "event analytics platform",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/use-cases/corporate-events",
  },
  openGraph: {
    title: "Corporate Event App — NextVibe",
    description:
      "Shared photo albums, smart RSVP, event games, and live engagement analytics for corporate events and conferences.",
    url: "https://mynextvibe.com/use-cases/corporate-events",
  },
};

const corporateFeatures = [
  {
    title: "Smart RSVP & Guest Management",
    description:
      "Collect RSVPs, dietary requirements, job titles, and session preferences through one branded link. Manage your guest list, send automated reminders, and track confirmations in real time.",
  },
  {
    title: "Shared Event Photo Album",
    description:
      "Attendees scan a QR code at registration or on their lanyards and contribute photos throughout the day. One album, every perspective — automatically organised.",
  },
  {
    title: "NextvibePilot Analytics",
    description:
      "Go beyond headcount. Track real engagement: which sessions generated the most content, which moments resonated, and how attendees interacted throughout the event.",
  },
  {
    title: "VibeTags per Session or Track",
    description:
      "Create a separate VibeTag for each conference track, workshop, or keynote. Attendees tag content to the right session. Organizers get session-level insights.",
  },
  {
    title: "Interactive Team Challenges",
    description:
      "Break the ice and drive networking with gamified challenges and photo scavenger hunts. Live leaderboards encourage participation across the whole event.",
  },
  {
    title: "Brand & Sponsor Activation",
    description:
      "Give sponsors measurable, event-native visibility. Sponsors activate at the content level — not just a logo on a banner — and get authentic engagement data from your attendees.",
  },
];

const eventTypes = [
  "Annual company conferences",
  "Team away days and retreats",
  "Product launches",
  "Industry summits and trade shows",
  "Award ceremonies",
  "Client appreciation events",
  "Leadership offsites",
  "Hackathons and innovation days",
  "Onboarding and training events",
  "End-of-year celebration parties",
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Corporate Event App — NextVibe",
  url: "https://mynextvibe.com/use-cases/corporate-events",
  description:
    "NextVibe is a corporate event app for photo sharing, smart RSVP, engagement analytics, and brand sponsorship at conferences and team events.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mynextvibe.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Use Cases",
        item: "https://mynextvibe.com/use-cases",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Corporate Events",
        item: "https://mynextvibe.com/use-cases/corporate-events",
      },
    ],
  },
};

export default function CorporateEventsPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Corporate Events
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Corporate Events That Leave a Lasting Impression
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            NextVibe gives corporate event organizers real engagement analytics,
            a shared photo archive, smart RSVP, and sponsor tools — in one
            platform purpose-built for events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="border-2 border-[#A1349A] text-[#A1349A] px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/5 transition"
            >
              Talk to Our Team
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Everything Corporate Events Need
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
              From 20-person offsites to 2,000-person conferences, NextVibe
              handles the full digital event experience.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corporateFeatures.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 max-w-3xl mx-auto px-4 text-center">
          <blockquote className="bg-purple-50 rounded-3xl p-10 border-l-4 border-[#A1349A]">
            <p className="text-xl text-gray-800 italic mb-6">
              &quot;NextVibe provided more authentic content and engagement data in
              one weekend than we&apos;d gathered in the past five years. It&apos;s a
              game-changer for corporate event planning.&quot;
            </p>
            <cite className="not-italic">
              <p className="font-semibold text-[#5B1A57]">Michael Roberts</p>
              <p className="text-sm text-gray-500">
                Corporate Conference Planner
              </p>
            </cite>
          </blockquote>
        </section>

        {/* Event types */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">
              Works for Every Corporate Event Format
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {eventTypes.map((et) => (
                <li
                  key={et}
                  className="flex items-center gap-3 text-gray-700 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100"
                >
                  <span className="w-2 h-2 rounded-full bg-[#A1349A] flex-shrink-0" />
                  {et}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Elevate Your Next Corporate Event
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Get started free, or speak to our team about enterprise options
              for large-scale conferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-block bg-white text-[#5B1A57] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
              >
                Start Free
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more use cases:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/use-cases/weddings"
              className="text-[#A1349A] hover:underline"
            >
              Weddings
            </Link>
            <Link
              href="/use-cases/birthday-parties"
              className="text-[#A1349A] hover:underline"
            >
              Birthday Parties
            </Link>
            <Link
              href="/use-cases/festivals"
              className="text-[#A1349A] hover:underline"
            >
              Festivals
            </Link>
            <Link
              href="/party-photo-sharing"
              className="text-[#A1349A] hover:underline"
            >
              Party Photo Sharing
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
