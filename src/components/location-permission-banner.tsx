"use client";

/**
 * LocationPermissionBanner
 *
 * Pure UI banner. The actual browser permission prompt + location resolution
 * happens in events/page.tsx via useUserLocation (same as before).
 *
 * This banner just shows a contextual strip while location is pending,
 * and hides once synced or dismissed.
 */

import { useState } from "react";
import { useSelector } from "react-redux";
import { MapPin, X } from "lucide-react";
import Cookies from "js-cookie";
import { RootState } from "@/app/provider/store";

export function LocationPermissionBanner() {
  const synced = useSelector((s: RootState) => s.location.synced);
  const locationState = useSelector((s: RootState) => s.location.location);
  const [dismissed, setDismissed] = useState(false);

  // Check auth via cookie synchronously — Redux isAuthenticated isn't reliable on load
  const isLoggedIn = !!(
    typeof window !== "undefined" &&
    (Cookies.get("accessToken") ?? Cookies.get("admin_accessToken"))
  );

  // Already have a city/country resolved → nothing to show
  const hasLocation = !!(locationState?.city || locationState?.country);

  if (!isLoggedIn || synced || dismissed || hasLocation) return null;

  return (
    <div className="flex items-center gap-3 bg-[#531342]/5 border-b border-[#531342]/20 px-4 py-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#531342]/10">
        <MapPin className="h-3.5 w-3.5 text-[#531342]" />
      </div>
      <p className="flex-1 text-xs text-foreground leading-snug">
        <span className="font-semibold">Allow location access</span> so we can
        personalise events and show organisers where their audience comes from.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
