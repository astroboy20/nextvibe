"use client";

import { useEffect, useRef } from "react";
import { useTour } from "./tour-context";
import { TOUR_STORAGE_KEYS } from "./tour-context";

/**
 * Drop this hook inside the event detail page component.
 * It auto-starts the event tab tour the first time a user views any event,
 * but only after the app-level tour is already done (or skipped).
 */
export function useEventTour(isReady: boolean) {
  const { startTour, isActive } = useTour();
  const fired = useRef(false);

  useEffect(() => {
    // Don't fire if another tour is already running, event not loaded yet,
    // or we already triggered it this mount.
    if (!isReady || isActive || fired.current) return;

    const appDone = localStorage.getItem(TOUR_STORAGE_KEYS.app);
    const eventDone = localStorage.getItem(TOUR_STORAGE_KEYS.event);

    if (appDone && !eventDone) {
      fired.current = true;
      // Small delay so tabs have rendered and IDs are in the DOM
      const t = setTimeout(() => startTour("event"), 600);
      return () => clearTimeout(t);
    }
  }, [isReady, isActive, startTour]);
}
