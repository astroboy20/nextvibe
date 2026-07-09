import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Party Photo Sharing App — Shared Albums via QR Code",
  description:
    "The easiest way to share photos at a party. Guests scan a QR code, upload instantly to a shared album — no app download needed. Try NextVibe free for your next event.",
  keywords: [
    "party photo sharing app",
    "shared party photo album",
    "QR code party photos",
    "guest photo sharing event",
    "party photo album app",
    "photo sharing at events",
    "event shared album",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/party-photo-sharing",
  },
  openGraph: {
    title: "Party Photo Sharing App — NextVibe",
    description:
      "Guests scan a QR code and upload photos to a shared party album instantly. No app download. All photos in one place after the event.",
    url: "https://mynextvibe.com/party-photo-sharing",
  },
};

const howItWorksSteps = [
  {
    step: "1",
    title: "Create your event",
    description:
      "Set up your party on NextVibe in under two minutes. Add the date, venue, and a cover photo.",
  },
  {
    step: "2",
    title: "Share the QR code",
    description:
      "NextVibe generates a unique QR code and VibeTag for your event. Print it, text it, or display it on screens at the venue.",
  },
  {
    step: "3",
    title: "Guests upload instantly",
    description:
      "Guests scan the QR code with their phone camera and upload photos and videos directly to your shared album — no app download required for basic sharing.",
  },
  {
    step: "4",
    title: "Everything in one place",
    description:
      "All photos are automatically organised by event. Browse, download, and share the full album after the party ends.",
  },
];

const features = [
  {
    title: "QR Code Access",
    description:
      "One QR code on the table, the invite, or a screen. Every guest can contribute without creating an account.",
  },
  {
    title: "Real-Time Feed",
    description:
      "See photos appear as guests upload them. Watch your shared album grow throughout the night.",
  },
  {
    title: "VibeTags",
    description:
      "NextVibe's unique tagging system makes every photo searchable. Find all the photos from the dance floor, the cake cutting, or the group shots instantly.",
  },
  {
    title: "Event Games",
    description:
      "Keep guests engaged with photo challenges, trivia, and scavenger hunts tied directly to the shared album.",
  },
  {
    title: "Digital Postcards",
    description:
      "Turn the best moments into beautiful digital postcards guests can download, print, or share on social media.",
  },
  {
    title: "Full Album Download",
    description:
      "After the party, download every photo in full resolution. Your memories, yours to keep forever.",
  },
];

const useCases = [
  "Birthday parties (18th, 21st, 30th, 50th, and beyond)",
  "Graduation parties",
  "Engagement parties and bridal showers",
  "Weddings and wedding receptions",
  "Corporate parties and team events",
  "Holiday and Christmas parties",
  "Baby showers and gender reveals",
  "Family reunions",
  "Music festivals and concerts",
  "Sports watch parties",
];

const faqItems = [
  {
    q: "Do guests need to download an app to share photos?",
    a: "No. Guests scan the QR code with their phone's native camera and are taken directly to the shared album in their mobile browser. No app download is required for uploading photos to the shared party album.",
  },
  {
    q: "How many photos can guests upload?",
    a: "NextVibe is designed to handle high-volume events. Guests can upload photos and short videos throughout the event with no per-guest limits on the shared album.",
  },
  {
    q: "Can I download all the photos after the party?",
    a: "Yes. The event organiser can download all photos and videos from the shared album in full resolution after the event. Guests can also download individual photos they want to keep.",
  },
  {
    q: "How is NextVibe different from a Google Photos shared album?",
    a: "Google Photos requires all guests to have a Google account and manually accept a sharing invite. NextVibe works via QR code — any guest can join instantly. You also get event-specific features like VibeTags, games, RSVP management, and digital postcards that don't exist in Google Photos.",
  },
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Party Photo Sharing App — NextVibe",
  url: "https://mynextvibe.com/party-photo-sharing",
  description:
    "NextVibe is a party photo sharing app that lets guests upload photos to a shared album via QR code. No app download required.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mynextvibe.com" },
      { "@type": "ListItem", position: 2, name: "Party Photo Sharing", item: "https://mynextvibe.com/party-photo-sharing" },
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

export default function PartyPhotoSharingPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <JsonLd data={faqSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Party Photo Sharing
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            The Easiest Way to Share Photos at a Party
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Guests scan a QR code. Photos go into one shared album. No app
            download. No accounts. Just every photo from your event, in one
            place — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              Create Your Party Album Free
            </Link>
            <Link
              href="/how-it-works"
              className="border-2 border-[#A1349A] text-[#A1349A] px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/5 transition"
            >
              See How It Works
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How Party Photo Sharing Works on NextVibe
            </h2>
            <ol className="grid md:grid-cols-2 gap-8">
              {howItWorksSteps.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#A1349A] to-[#5B1A57] text-white font-bold flex items-center justify-center text-lg">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need for Shared Party Photos
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            NextVibe is built specifically for events — not a generic cloud
            storage tool repurposed for parties.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-purple-50 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Works for Every Type of Party
            </h2>
            <p className="text-center text-gray-600 mb-10">
              If there&apos;s a group of people, there&apos;s a shared photo album waiting
              to happen.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {useCases.map((uc) => (
                <li key={uc} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-[#A1349A] flex-shrink-0" />
                  {uc}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-8">
            {faqItems.map(({ q, a }) => (
              <div key={q}>
                <dt className="text-lg font-semibold text-gray-900 mb-2">{q}</dt>
                <dd className="text-gray-600 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Capture Every Moment?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Set up your shared party photo album in under two minutes. Free to
              get started.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-[#5B1A57] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
            >
              Start Your Free Party Album
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/event-memory-app" className="text-[#A1349A] hover:underline">Event Memory App</Link>
            <Link href="/use-cases/weddings" className="text-[#A1349A] hover:underline">Wedding Photo Sharing</Link>
            <Link href="/use-cases/birthday-parties" className="text-[#A1349A] hover:underline">Birthday Party Albums</Link>
            <Link href="/alternatives" className="text-[#A1349A] hover:underline">NextVibe vs Alternatives</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
