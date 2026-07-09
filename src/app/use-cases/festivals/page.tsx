import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Festival Memory App — Shared Photos & VibeTags for Music Festivals",
  description:
    "NextVibe captures every moment at music festivals and large events. Shared photo albums via QR code, VibeTags for artist sets and stages, event games, and brand sponsorship tools.",
  keywords: [
    "festival memory app",
    "music festival photo sharing",
    "festival photo album",
    "shared festival photos",
    "concert photo sharing app",
    "event photo sharing festival",
    "festival photo collection",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/use-cases/festivals",
  },
  openGraph: {
    title: "Festival Memory App — NextVibe",
    description:
      "Shared photo albums, VibeTags per stage and artist, event games, and brand sponsorship tools for music festivals and large events.",
    url: "https://mynextvibe.com/use-cases/festivals",
  },
};

const festivalUseCases = [
  {
    title: "Multiple Stage VibeTags",
    description:
      "Create a separate VibeTag for each stage, day, or headliner act. Festival-goers tag their photos to the exact moment — the main stage at sunset, the silent disco, the opening set.",
  },
  {
    title: "Attendee Photo Challenges",
    description:
      "Keep the crowd engaged between sets with photo challenges. Most creative outfit, best crowd shot, 'spot the celebrity' — all with real prizes and live leaderboards.",
  },
  {
    title: "Brand Activation Integration",
    description:
      "Sponsors can activate at the photo level. A drinks brand sponsors the main stage VibeTag. A clothing brand sponsors the style photo challenge. Authentic, measurable, event-native advertising.",
  },
  {
    title: "Scalable for Any Crowd Size",
    description:
      "NextVibe is built to handle thousands of photos from thousands of attendees simultaneously. One QR code at the gate, multiple VibeTags throughout the venue.",
  },
  {
    title: "Content for Organizers",
    description:
      "Walk away from every festival with thousands of pieces of authentic user-generated content. Use it for social media, next year's promotion, and sponsor reports.",
  },
  {
    title: "Post-Festival Memory Bank",
    description:
      "The festival ends. The memories don't. Attendees can log back in months later and find every photo, video, and moment tagged from the event.",
  },
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Festival Memory App — NextVibe",
  url: "https://mynextvibe.com/use-cases/festivals",
  description:
    "NextVibe is a memory and photo sharing app for music festivals and large events. VibeTags per stage, event games, brand sponsorship, and scalable shared albums.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mynextvibe.com" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://mynextvibe.com/use-cases" },
      { "@type": "ListItem", position: 3, name: "Festivals", item: "https://mynextvibe.com/use-cases/festivals" },
    ],
  },
};

export default function FestivalsPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Festivals
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            The Festival Memory App Built for the Crowd
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Thousands of attendees, dozens of moments, one permanent memory
            bank. NextVibe captures every set, stage, and in-between moment from
            your festival — organised by VibeTag.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              Set Up Your Festival on NextVibe
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Built for Large-Scale Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festivalUseCases.map((f) => (
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

        {/* Stats */}
        <section className="py-20 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">NextVibe at Scale</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "100+", label: "Events Created" },
              { value: "1K+", label: "Memories Captured" },
              { value: "100+", label: "Happy Users" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-[#A1349A] mb-2">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Capture Your Next Festival?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Get in touch for large events, or start for free and scale as you
              grow.
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
                Contact for Large Events
              </Link>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more use cases:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/use-cases/weddings" className="text-[#A1349A] hover:underline">Weddings</Link>
            <Link href="/use-cases/birthday-parties" className="text-[#A1349A] hover:underline">Birthday Parties</Link>
            <Link href="/use-cases/corporate-events" className="text-[#A1349A] hover:underline">Corporate Events</Link>
            <Link href="/party-photo-sharing" className="text-[#A1349A] hover:underline">Party Photo Sharing</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
