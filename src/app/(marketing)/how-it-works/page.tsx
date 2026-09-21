import HowItWorksContent from "./container/how-it-works";
import { Metadata } from "next";
import { APP_NAME } from "@/utils/constants";

export const metadata: Metadata = {
  title: "How It Works | " + APP_NAME,
  description: "How it works page of " + APP_NAME,
};
export default function HowItWorks() {
  return (
    <main>
      <HowItWorksContent />
    </main>
  );
}
