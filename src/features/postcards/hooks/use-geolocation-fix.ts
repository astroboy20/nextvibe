"use client";

import { useCallback, useRef, useState } from "react";

export interface GeoFix {
  lat: number;
  lng: number;
  /** Accuracy radius in metres. */
  accuracy: number;
}

export type GeoFixStatus = "idle" | "locating" | "ready" | "denied" | "unavailable";

/**
 * One-shot browser location for the postcard stamp.
 *
 * Nothing happens until `request()` is called — it must be wired to a user
 * action (the stamp toggle). Asking on page load gets denied by reflex, and
 * most browsers then never show the prompt again.
 *
 * Every failure mode (denied, timeout, no GPS, insecure origin) ends in a
 * non-ready status and a null fix: posting carries on without a location.
 * Note geolocation only works on HTTPS or localhost — testing from a phone
 * over a LAN IP lands in "unavailable".
 */
export function useGeolocationFix() {
  const [status, setStatus] = useState<GeoFixStatus>("idle");
  const [fix, setFix] = useState<GeoFix | null>(null);
  // Bumped on every request/clear so a late callback from a superseded
  // request can't switch the stamp back on after the user turned it off.
  const requestIdRef = useRef(0);

  const request = useCallback(() => {
    const id = ++requestIdRef.current;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (id !== requestIdRef.current) return;
        setFix({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("ready");
      },
      (err) => {
        if (id !== requestIdRef.current) return;
        setFix(null);
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      // Coarse is plenty: the server rounds to ~1km anyway, and high accuracy
      // can take much longer to resolve (and drains battery) on phones.
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  const clear = useCallback(() => {
    requestIdRef.current++;
    setFix(null);
    setStatus("idle");
  }, []);

  return { status, fix, request, clear };
}
