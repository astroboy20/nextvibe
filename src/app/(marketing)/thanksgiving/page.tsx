import type { Metadata } from "next";
import ThanksgivingPage from "./components/thanksgiving-page";

export const metadata: Metadata = {
  title: "Thanksgiving Family Package | NextVibe",
  description:
    "Keep every Thanksgiving memory — photos, videos and messages from the whole family — in one private gallery. One VibeTag, no app download. Founder price: $29.",
};

export default function Page() {
  return <ThanksgivingPage />;
}
