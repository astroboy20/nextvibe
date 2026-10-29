import type { Metadata } from "next";
import Discover from "./component/discover";

export const metadata: Metadata = {
  title: "Discover Events & Postcards | NextVibe",
  description:
    "Browse public events, galleries and postcards from the NextVibe community. Find events near you, trending vibes and more.",
};

export default function DiscoverPage() {
  return <Discover />;
}
