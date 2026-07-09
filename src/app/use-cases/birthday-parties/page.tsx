import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Birthday Party Photo Sharing App — Shared Album for Any Age",
  description:
    "The easiest birthday party photo app. Guests scan a QR code to add photos to a shared album. Perfect for 18th, 21st, 30th, 50th birthdays and beyond. Try NextVibe free.",
  keywords: [
    "birthday party photo sharing app",
    "birthday photo album app",
    "50th birthday photo sharing",
    "21st birthday photo album",
    "shared birthday party photos",
    "birthday party memory app",
    "QR code birthday photos",
    "collect photos birthday party",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/use-cases/birthday-parties",
  },
  openGraph: {
    title: "Birthday Party Photo Sharing App — NextVibe",
    description:
      "Guests scan a QR code, add photos to a shared birthday album. No app needed. Perfect for milestone birthdays of any age.",
    url: "https://mynextvibe.com/use-cases/birthday-parties",
  },
};

const milestones = [
  {
    age: "18th Birthday",
    description:
      "Eighteen years of growing up, captured by everyone who was there for it. A shared album from the whole crew, yours forever.",
  },
  {
    age: "21st Birthday",
    description:
      "The photos guests didn't post anywhere else. A private shared album where everyone contributes their best shots from the night.",
  },
  {
    age: "30th Birthday",
    description:
      "Friends flying in from everywhere. One QR code, one album, every perspective from a milestone that deserves to be documented properly.",
  },
  {
    age: "50th Birthday",
    description:
      "Family and friends across every era of a life. A 50th deserves more than a WhatsApp thread — it deserves a proper digital memory bank.",
  },
  {
    age: "60th & Beyond",
    description:
      "Sometimes the best birthday photos come from the people who care most. Give every guest an easy way to contribute.",
  },
];

const features = [
  {
    title: "Shared Album via QR Code",
    description:
      "Print the QR code on balloons, table cards, or the invitation. Guests scan and upload instantly from any phone.",
  },
  {
    title: "Photo Challenges & Games",
    description:
      "Set up birthday-specific photo challenges — 'find someone who's known [name] the longest' or 'recreate the most embarrassing childhood photo.' Guests love it.",
  },
  {
    title: "Birthday VibeTag",
    description:
      "Create a unique VibeTag for the birthday person. Every photo tagged with it becomes part of a permanent, searchable birthday archive they can revisit for years.",
  },
  {
    title: "Digital Birthday Postcards",
    description:
      "Turn the best guest photos into digital postcards the birthday person can download, print, or share on their socials as the perfect birthday post.",
  },
  {
    title: "Surprise Mode",
    description:
      "Planning a surprise party? Coordinate photo collection without spoiling it. Share the VibeTag with trusted guests beforehand so the album is ready when the party starts.",
  },
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Birthday Party Photo Sharing App — NextVibe",
  url: "https://mynextvibe.com/use-cases/birthday-parties",
  description:
    "NextVibe lets every birthday party guest contribute to one shared photo album via QR code. No app required. Perfect for any milestone birthday.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mynextvibe.com" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://mynextvibe.com/use-cases" },
      { "@type": "ListItem", position: 3, name: "Birthday Parties", item: "https://mynextvibe.com/use-cases/birthday-parties" },
    ],
  },
};

export default function BirthdayPartiesPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Birthday Parties
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            The Birthday Photo Album Everyone Actually Uses
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            One QR code. Every guest adds their photos. The birthday person gets
            a shared album from every angle of their day — not just the three
            photos that made it to the group chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              Create Birthday Album Free
            </Link>
            <Link
              href="/party-photo-sharing"
              className="border-2 border-[#A1349A] text-[#A1349A] px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/5 transition"
            >
              How It Works
            </Link>
          </div>
        </section>

        {/* Milestones */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              For Every Milestone Birthday
            </h2>
            <p className="text-center text-gray-500 mb-12">
              Every milestone deserves more than a few photos buried in a group
              chat.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((m) => (
                <div
                  key={m.age}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-bold text-[#A1349A] mb-2">{m.age}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Birthday-Specific Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 items-start"
              >
                <span className="flex-shrink-0 w-3 h-3 mt-2 rounded-full bg-gradient-to-br from-[#A1349A] to-[#5B1A57]" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Make This Birthday Unforgettable
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Set up a shared birthday album in two minutes. Free to get started.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-[#5B1A57] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
            >
              Start Your Birthday Album
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more use cases:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/use-cases/weddings" className="text-[#A1349A] hover:underline">Weddings</Link>
            <Link href="/use-cases/festivals" className="text-[#A1349A] hover:underline">Festivals</Link>
            <Link href="/use-cases/corporate-events" className="text-[#A1349A] hover:underline">Corporate Events</Link>
            <Link href="/party-photo-sharing" className="text-[#A1349A] hover:underline">Party Photo Sharing</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
