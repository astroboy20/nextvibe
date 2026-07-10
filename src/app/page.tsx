import { Metadata } from "next";
import HomeContainerClient from "./home-container-client";
import { JsonLd } from "@/components/seo/json-ld";
import {
  organizationSchema,
  softwareAppSchema,
  faqSchema,
  websiteSchema,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Nextvibe — Party Photo Sharing & Event Memory App",
  description:
    "Nextvibe is the ultimate app for parties, weddings, and events. Shared photo albums, VibeTags, event games, and smart RSVP — all in one place.",
  keywords: [
    "party photo sharing app",
    "event memory app",
    "shared event photo album",
    "QR code party photos",
    "wedding photo sharing app",
    "festival memory app",
    "event photo album no app required",
    "VibeTags",
    "event games",
    "smart RSVP",
    "nextvibe",
  ],
  alternates: { canonical: "https://mynextvibe.com" },
  openGraph: {
    title: "Nextvibe — Party Photo Sharing & Event Memory App",
    description:
      "Capture every moment at parties, weddings, and festivals. Shared albums, VibeTags, and event games.",
    url: "https://mynextvibe.com",
    siteName: "NextVibe",
    type: "website",
    images: [
      {
        url: "https://mynextvibe.com/logos/new/logo_black_text.png",
        width: 1200,
        height: 630,
        alt: "NextVibe — Your Event's Digital Memory Bank",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nextvibe — Party Photo Sharing & Event Memory App",
    description:
      "Capture every moment at parties, weddings, and festivals. Shared albums, VibeTags, and event games.",
    images: ["https://mynextvibe.com/logos/new/logo_black_text.png"],
  },
};

export default function Home() {
  return (
    <>
      {/* Structured data for search engines and AI crawlers */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareAppSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={websiteSchema} />

      {/*
        SSR-rendered semantic content block — invisible to users, fully crawlable.
        This ensures search engines and AI engines index NextVibe's core value props
        even though the interactive UI is client-rendered.
      */}
      <div className="sr-only" aria-hidden="true">
        <h1>NextVibe — Party Photo Sharing &amp; Event Memory App</h1>
        <p>
          NextVibe is the digital memory bank for events. Guests scan a QR code
          to upload photos to a shared album — no app download required. Built
          for parties, weddings, festivals, birthday parties, and corporate
          events.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>
            Party photo sharing via QR code — one shared album for all guests
          </li>
          <li>
            VibeTags — structured memory capture that makes every photo
            searchable
          </li>
          <li>
            Event games with live leaderboards — trivia, photo challenges,
            scavenger hunts
          </li>
          <li>
            Digital postcards — turn the best moments into shareable keepsakes
          </li>
          <li>
            Smart RSVP — manage guest lists, reminders, and dietary requirements
          </li>
          <li>
            Brand sponsorship tools — sponsor authentic moments, not just
            banners
          </li>
          <li>
            NextvibePilot analytics — track real engagement, not just attendance
          </li>
        </ul>
        <h2>Who NextVibe Is For</h2>
        <p>
          Event organizers use NextVibe to drive ticket sales, capture
          user-generated content, and get real engagement data. Attendees use it
          to find all their photos and earn rewards. Brands use it to sponsor
          authentic event moments.
        </p>
        <h2>Use Cases</h2>
        <ul>
          <li>
            Wedding photo sharing — collect every guest&apos;s photos in one
            place
          </li>
          <li>Birthday party albums — 18th, 21st, 30th, 50th and beyond</li>
          <li>Music festival memory app — VibeTags per stage and artist set</li>
          <li>Corporate event photo sharing and analytics</li>
          <li>Family reunion shared albums</li>
          <li>Graduation party photo collection</li>
        </ul>
        <h2>How It Works</h2>
        <ol>
          <li>Create your event and get a unique QR code and VibeTag</li>
          <li>Share the QR code — print it, text it, or display it</li>
          <li>Guests scan and upload photos instantly, no app needed</li>
          <li>All photos are organised automatically in one shared album</li>
          <li>Download everything after the event in full resolution</li>
        </ol>
      </div>

      {/* Interactive UI — client-rendered */}
      <main>
        <HomeContainerClient />
      </main>
    </>
  );
}
