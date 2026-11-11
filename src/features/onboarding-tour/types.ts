import { TourName } from "./tour-context";

export interface TourStep {
  /** CSS id of the element to highlight */
  targetId: string;
  title: string;
  description: string;
  /** Where the tooltip appears relative to the target */
  placement: "top" | "bottom" | "left" | "right";
}

export interface TourContextValue {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (tourName?: TourName) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}
