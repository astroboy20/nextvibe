"use client";

import {
  selectEventFormEditMode,
  selectEventFormStep,
  updateData,
  updateEditMode,
} from "@/app/provider/slices/eventformslice";
import { Progress } from "@/components/ui/progress";

import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StepOne from "../components/step-one";
import StepTwo from "../components/step-two";
import StepThree from "../components/step-three";
import StepFour from "../components/step-four";
import StepFive from "../components/step-five";
import StepSix from "../components/step-six";

const TOTAL_STEPS = 6;

const formSteps: { [key: number]: { title: string; content: ReactNode } } = {
  1: { title: "Event Details", content: <StepOne /> },
  2: { title: "Ticket Details", content: <StepTwo /> },
  3: { title: "RSVP Configuration", content: <StepThree /> },
  4: { title: "Event Activities", content: <StepFour /> },
  5: { title: "Gamification Rewards", content: <StepFive /> },
  6: { title: "Order Summary", content: <StepSix /> },
};

export default function CreateEvent() {
  const dispatch = useDispatch();
  const step = useSelector(selectEventFormStep);
  const editMode = useSelector(selectEventFormEditMode);

  useEffect(() => {
    if (editMode) {
      localStorage.removeItem("formData");
      dispatch(updateData({}));
      dispatch(updateEditMode(false));
    }
  }, [editMode, dispatch]);

  const progressValue = (step / TOTAL_STEPS) * 100;
  const currentStep = formSteps[step];

  return (
    <div className="max-w-2xl mx-auto pb-16 px-5">
      {/* <DashNavbar back={handleBack} /> */}

      {/* Step title */}
      <h2 className="text-center text-xl font-medium mt-4 mb-3">
        {currentStep?.title ?? "Create Event"}
      </h2>

      {/* Progress bar — hidden on final step */}
      {step < TOTAL_STEPS && (
        <div className="flex items-center gap-3 mb-6 px-4">
          <Progress
            value={progressValue}
            className="flex-1 h-2 rounded-full bg-[#685D67]/40 [&>div]:bg-[#5B1A57] [&>div]:rounded-full [&>div]:transition-all [&>div]:duration-300"
          />
          <span className="text-sm font-semibold text-gray-700 shrink-0">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
      )}

      {/* Step content */}
      {currentStep?.content}
    </div>
  );
}
