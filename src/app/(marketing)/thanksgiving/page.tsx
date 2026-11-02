import type { Metadata } from "next";
import ThanksgivingPage from "./components/thanksgiving-page";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout template ("%s | NextVibe")
  // which would otherwise produce "Thanksgiving Family Package | NextVibe | NextVibe".
  title: {
    absolute: "Thanksgiving Family Package | NextVibe",
  },
  description:
    "Keep every Thanksgiving memory — photos, videos and messages from the whole family — in one private gallery. One VibeTag, no app download. Founder price: $29.",
  openGraph: {
    title: "This Thanksgiving, keep the memories — not just the leftovers",
    description:
      "Every photo, video and message from your whole table in one private gallery. One VibeTag. Nobody downloads an app. Founder price: $29.",
    url: "https://mynextvibe.com/thanksgiving",
    siteName: "NextVibe",
    images: [
      {
        url: "/images/thanksgiving-hero.jpg",
        width: 1200,
        height: 630,
        alt: "A multigenerational family at a Thanksgiving dinner table",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "This Thanksgiving, keep the memories — not just the leftovers",
    description:
      "Every photo, video and message from your whole table in one private gallery. Founder price: $29.",
    images: ["/images/thanksgiving-hero.jpg"],
  },
};

export default function Page() {
  return <ThanksgivingPage />;
}
