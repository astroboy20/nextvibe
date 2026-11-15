import { Suspense } from "react";
import type { Metadata } from "next";
import ChristmasPage from "./components/christmas-page";
import ChristmasLoading from "./loading";

export const metadata: Metadata = {
  title: {
    absolute: "Christmas Campaign | NextVibe",
  },
  description:
    "Claim one of 1,000 spots for $5 / ₦5,000 and unlock a full NextVibe MEGA bundle — VibeTags, Postcards, Gamification and VibePod — for your Christmas event.",
  openGraph: {
    title: "Make this Christmas a memory worth keeping",
    description:
      "1,000 spots. $5 / ₦5,000 each. Claim yours and publish a full MEGA bundle event for free on NextVibe.",
    url: "https://mynextvibe.com/christmas",
    siteName: "NextVibe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Make this Christmas a memory worth keeping",
    description: "1,000 spots. $5 / ₦5,000 each. Claim yours on NextVibe.",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<ChristmasLoading />}>
      <ChristmasPage />
    </Suspense>
  );
}
