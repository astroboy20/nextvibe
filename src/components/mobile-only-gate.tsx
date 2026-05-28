"use client";

import { useMobileViewport } from "@/hooks/useMobileViewport";
import { Smartphone } from "lucide-react";
import { NewLogo } from "@/components/logo";

/**
 * Wraps any layout that should only be accessible on mobile screens (≤ 430px).
 * On wider screens it replaces the content with a friendly "use your phone" screen.
 * Returns null during SSR / before hydration to avoid layout shift.
 */
export function MobileOnlyGate({ children }: { children: React.ReactNode }) {
  const viewport = useMobileViewport();

  // Don't render anything until we know the viewport — avoids flash
  if (viewport === "unknown") return null;

  if (viewport === "desktop") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">
        {/* Logo */}
        <NewLogo />

        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#531342]/10">
          <Smartphone className="h-10 w-10 text-[#531342]" />
        </div>

        {/* Message */}
        <div className="space-y-2 max-w-xs">
          <h1 className="text-xl font-bold text-foreground">
            Mobile only
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            NextVibe is designed for your phone. Open this page on your mobile
            device to get the full experience.
          </p>
        </div>

      
      </div>
    );
  }

  return <>{children}</>;
}
