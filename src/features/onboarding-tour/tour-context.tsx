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
  app: "nextvibe_tour_app_completed",
  event: "nextvibe_tour_event_completed",
} as const;

export type TourName = keyof typeof TOUR_STORAGE_KEYS;

const TOUR_STEPS_MAP: Record<TourName, TourStep[]> = {
  app: APP_TOUR_STEPS,
  event: EVENT_TOUR_STEPS,
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTourName, setActiveTourName] = useState<TourName>("app");

  const steps: TourStep[] = TOUR_STEPS_MAP[activeTourName];

  // Auto-start the app-level tour for first-time visitors
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEYS.app);
    if (!completed) {
      const timer = setTimeout(() => {
        setActiveTourName("app");
        setCurrentStep(0);
        setIsActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback((tourName: TourName = "app") => {
    setActiveTourName(tourName);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      const next = s + 1;
      if (next >= TOUR_STEPS_MAP[activeTourName].length) {
        localStorage.setItem(TOUR_STORAGE_KEYS[activeTourName], "true");
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
    localStorage.setItem(TOUR_STORAGE_KEYS[activeTourName], "true");
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
