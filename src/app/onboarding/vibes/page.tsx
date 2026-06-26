import { Suspense } from "react";
import VibeOnboarding from "./vibe-onboarding";

export default function VibeOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VibeOnboarding />
    </Suspense>
  );
}
