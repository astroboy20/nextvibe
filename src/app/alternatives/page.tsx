import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "NextVibe vs Alternatives — Party Photo Sharing Compared",
  description:
    "How does NextVibe compare to disposable cameras, PartyCam, GuestCam, shared Google Photos albums, and WhatsApp group chats for event photo sharing? See the honest breakdown.",
  keywords: [
    "nextvibe vs partycam",
    "nextvibe vs disposable cameras",
    "party photo sharing app comparison",
    "event photo app alternatives",
    "best party photo sharing app",
    "PartyCam alternative",
    "GuestCam alternative",
    "shared event photo album alternative",
  ],
  alternates: {
    canonical: "https://mynextvibe.com/alternatives",
  },
  openGraph: {
    title: "NextVibe vs Alternatives — Party Photo Sharing Compared",
    description:
      "How NextVibe compares to PartyCam, GuestCam, disposable cameras, and WhatsApp for event photo sharing.",
    url: "https://mynextvibe.com/alternatives",
  },
};

const comparisons = [
  {
    name: "Disposable Cameras",
    summary:
      "The classic party camera. Film needs developing, results are unpredictable, and you get 27 shots.",
    pros: ["No phones at the table", "Fun, nostalgic feel", "Zero setup"],
    cons: [
      "Film development takes days (or weeks)",
      "27 photos per camera — nowhere near enough",
      "No digital backup — if it's lost, it's gone",
      "No way to share before film is developed",
      "Cost adds up fast at larger events",
    ],
    verdict:
      "Great for a specific aesthetic, terrible for actually capturing and sharing memories. NextVibe gives you the same communal feel with none of the limitations.",
  },
  {
    name: "PartyCam",
    summary:
      "An app-free shared album built around a simple link. Strong on the 'no app needed' promise.",
    pros: [
      "App-free photo sharing",
      "Simple link-based access",
      "Clean interface",
    ],
    cons: [
      "Photo sharing only — no games, RSVP, or engagement tools",
      "No VibeTags or searchable memory archive",
      "No brand sponsorship or monetisation tools for organizers",
      "Limited analytics for event performance",
    ],
    verdict:
      "PartyCam does one thing well. NextVibe does that same thing plus the full event experience layer — games, rewards, analytics, RSVP, and postcards.",
  },
  {
    name: "GuestCam",
    summary:
      "Guest-facing photo booths and shared albums for weddings and events.",
    pros: [
      "Polished photo booth experience",
      "Wedding-focused features",
      "Branded overlays",
    ],
    cons: [
      "Hardware/booth dependent in some plans",
      "Less flexible for informal parties and festivals",
      "No attendee engagement layer (games, rewards)",
      "Limited post-event discoverability",
    ],
    verdict:
      "GuestCam excels at formal events with a physical setup. NextVibe is more flexible — works equally well for a 200-person wedding and a 20-person birthday dinner, all via QR code.",
  },
  {
    name: "Google Photos Shared Albums",
    summary:
      "A workaround most people use because it's free and familiar. Not built for events.",
    pros: ["Free", "Most people have a Google account", "Good photo quality"],
    cons: [
      "Requires a Google account to contribute",
      "Manual invite process for every guest",
      "No event-specific organisation or tagging",
      "No games, RSVP, or engagement features",
      "Photos mixed in with personal library",
    ],
    verdict:
      "Google Photos is a general storage tool being used as an event tool. It works until it doesn't — usually when 30% of guests can't join because they don't have or don't remember their Google account. NextVibe is purpose-built.",
  },
  {
    name: "WhatsApp / iMessage Group Chat",
    summary:
      "The default solution. Create a group, hope everyone sends photos.",
    pros: [
      "Zero setup",
      "Everyone has it",
      "Instant sharing",
    ],
    cons: [
      "Photos compressed and lose quality",
      "Buried under messages in a few days",
      "No organisation — finding a specific photo is impossible",
      "No album view or download",
      "Works poorly for groups over 20 people",
    ],
    verdict:
      "Group chats are for chatting. NextVibe is for memories. The photos from your event deserve more than being scrolled past in a group chat.",
  },
];

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "NextVibe vs Party Photo Sharing Alternatives",
  url: "https://mynextvibe.com/alternatives",
  description:
    "A comparison of NextVibe against disposable cameras, PartyCam, GuestCam, Google Photos, and WhatsApp for event photo sharing.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mynextvibe.com" },
      { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://mynextvibe.com/alternatives" },
    ],
  },
};

export default function AlternativesPage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Navbar />

      <main className="min-h-screen pt-20 bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Comparison
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            NextVibe vs Party Photo Sharing Alternatives
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Disposable cameras, shared albums, WhatsApp groups — we&apos;ve all used
            the workarounds. Here&apos;s how NextVibe compares to every option for
            capturing event memories.
          </p>
        </section>

        {/* Comparisons */}
        <section className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
          {comparisons.map((comp) => (
            <article
              key={comp.name}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-2">
                NextVibe vs {comp.name}
              </h2>
              <p className="text-gray-500 mb-6">{comp.summary}</p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-green-700 mb-3">
                    ✓ What {comp.name} does well
                  </h3>
                  <ul className="space-y-2">
                    {comp.pros.map((p) => (
                      <li key={p} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-green-500 flex-shrink-0">+</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 mb-3">
                    ✗ Where {comp.name} falls short
                  </h3>
                  <ul className="space-y-2">
                    {comp.cons.map((c) => (
                      <li key={c} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-red-400 flex-shrink-0">−</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-[#A1349A]">
                <p className="text-gray-800 text-sm font-medium">
                  <span className="font-bold text-[#A1349A]">Our take: </span>
                  {comp.verdict}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* Summary table */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Quick Feature Comparison
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] text-white">
                  <th className="p-4 text-left rounded-tl-xl">Feature</th>
                  <th className="p-4 text-center font-bold">NextVibe</th>
                  <th className="p-4 text-center">PartyCam</th>
                  <th className="p-4 text-center">Disposable Cam</th>
                  <th className="p-4 text-center rounded-tr-xl">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["No app required to upload", "✓", "✓", "✓", "✓"],
                  ["QR code access", "✓", "✓", "✗", "✗"],
                  ["Searchable photo archive (VibeTags)", "✓", "✗", "✗", "✗"],
                  ["Full-resolution downloads", "✓", "✓", "✓*", "✗"],
                  ["Event games & engagement", "✓", "✗", "✗", "✗"],
                  ["Smart RSVP management", "✓", "✗", "✗", "✗"],
                  ["Digital postcards", "✓", "✗", "✗", "✗"],
                  ["Brand sponsorship tools", "✓", "✗", "✗", "✗"],
                  ["Event analytics", "✓", "✗", "✗", "✗"],
                ].map(([feature, ...cols]) => (
                  <tr key={feature as string} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{feature}</td>
                    {cols.map((col, i) => (
                      <td
                        key={i}
                        className={`p-4 text-center font-semibold ${
                          col === "✓"
                            ? "text-green-600"
                            : col === "✗"
                            ? "text-red-400"
                            : "text-gray-400"
                        } ${i === 0 ? "bg-purple-50" : ""}`}
                      >
                        {col}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">* After film development</p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stop Settling for Workarounds
            </h2>
            <p className="text-white/90 text-lg mb-8">
              NextVibe is built for events from the ground up. Free to get
              started — set up your first shared album today.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-[#5B1A57] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
            >
              Try NextVibe Free
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Explore more:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/party-photo-sharing" className="text-[#A1349A] hover:underline">Party Photo Sharing</Link>
            <Link href="/event-memory-app" className="text-[#A1349A] hover:underline">Event Memory App</Link>
            <Link href="/use-cases/weddings" className="text-[#A1349A] hover:underline">Wedding Photo Sharing</Link>
            <Link href="/use-cases/birthday-parties" className="text-[#A1349A] hover:underline">Birthday Party Albums</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
