"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { TourContextValue, TourStep } from "./types";
import { APP_TOUR_STEPS, EVENT_TOUR_STEPS } from "./tour-steps";

export const TOUR_STORAGE_KEYS = {
  app: "nextvibe_tour_app_count",
  event: "nextvibe_tour_event_count",
} as const;

export type TourName = keyof typeof TOUR_STORAGE_KEYS;

/** How many times each tour plays before it stops showing automatically */
const MAX_SHOWS = 3;

const TOUR_STEPS_MAP: Record<TourName, TourStep[]> = {
  app: APP_TOUR_STEPS,
  event: EVENT_TOUR_STEPS,
};

/** Read how many times a tour has been shown (0 if never) */
function getShowCount(tourName: TourName): number {
  try {
    return parseInt(localStorage.getItem(TOUR_STORAGE_KEYS[tourName]) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

/** Increment the show count for a tour */
function incrementShowCount(tourName: TourName): void {
  try {
    const next = getShowCount(tourName) + 1;
    localStorage.setItem(TOUR_STORAGE_KEYS[tourName], String(next));
  } catch {
    // storage blocked — ignore
  }
}

/** Returns true if the tour has already been shown MAX_SHOWS times */
export function isTourExhausted(tourName: TourName): boolean {
  return getShowCount(tourName) >= MAX_SHOWS;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTourName, setActiveTourName] = useState<TourName>("app");

  const steps: TourStep[] = TOUR_STEPS_MAP[activeTourName];

  // Auto-start the app-level tour if it hasn't hit MAX_SHOWS yet
  useEffect(() => {
    if (!isTourExhausted("app")) {
      const timer = setTimeout(() => {
        setActiveTourName("app");
        setCurrentStep(0);
        setIsActive(true);
        incrementShowCount("app");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback((tourName: TourName = "app") => {
    setActiveTourName(tourName);
    setCurrentStep(0);
    setIsActive(true);
    incrementShowCount(tourName);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      const next = s + 1;
      if (next >= TOUR_STEPS_MAP[activeTourName].length) {
        setIsActive(false);
        return 0;
      }
      return next;
    });
  }, [activeTourName]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const skipTour = useCallback(() => {
    // Skipping counts as a full show — bump count all the way to MAX_SHOWS
    // so skipping on visit 1 stops the tour from ever auto-starting again.
    try {
      localStorage.setItem(TOUR_STORAGE_KEYS[activeTourName], String(MAX_SHOWS));
    } catch { /* ignore */ }
    setIsActive(false);
    setCurrentStep(0);
  }, [activeTourName]);

  return (
    <TourContext.Provider
      value={{ isActive, currentStep, steps, startTour, nextStep, prevStep, skipTour }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}
