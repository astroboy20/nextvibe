"use client";

import { useEffect, useRef } from "react";
import { useTour } from "./tour-context";
import { isTourExhausted } from "./tour-context";

/**
 * Drop this hook inside the event detail page component.
 * It auto-starts the event tab tour on the first N visits to any event page,
 * but only after the app-level tour has already been shown at least once.
 */
export function useEventTour(isReady: boolean) {
  const { startTour, isActive } = useTour();
  const fired = useRef(false);

  useEffect(() => {
    if (!isReady || isActive || fired.current) return;

    // Only run the event tour after the user has seen the app tour at least once,
    // and only if the event tour hasn't hit its show limit yet.
    const appStarted = !isTourExhausted("app") === false
      || localStorage.getItem("nextvibe_tour_app_count") !== null;

    if (appStarted && !isTourExhausted("event")) {
      fired.current = true;
      const t = setTimeout(() => startTour("event"), 600);
      return () => clearTimeout(t);
    }
  }, [isReady, isActive, startTour]);
}
