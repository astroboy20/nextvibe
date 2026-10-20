import { Metadata } from "next";
import { APP_NAME } from "@/shared/lib/constants";
import AffiliateContent from "./container/affiliate";

export const metadata: Metadata = {
  title: `Affiliate Program — Share the Vibe | ${APP_NAME}`,
  description:
    "Join the NextVibe affiliate program. Earn 5% on every deal you close and 10% on events you create yourself.",
};

export default function AffiliatePage() {
  return <AffiliateContent />;
}
