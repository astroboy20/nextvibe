"use client";

import { useEffect, useRef, useState } from "react";
import { useTour } from "../tour-context";
import { TourStep } from "../types";
import { cn } from "@/lib/utils";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: "top" | "bottom" | "left" | "right";
}

function getTooltipPosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: TourStep["placement"],
  viewportWidth: number,
  viewportHeight: number
): TooltipPosition {
  const GAP = 12; // px between target and tooltip
  let top = 0;
  let left = 0;
  let arrowSide: TooltipPosition["arrowSide"] = "bottom";

  switch (placement) {
    case "top":
      top = targetRect.top - tooltipHeight - GAP;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      arrowSide = "bottom";
      break;
    case "bottom":
      top = targetRect.bottom + GAP;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      arrowSide = "top";
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - GAP;
      arrowSide = "right";
      break;
    case "right":
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + GAP;
      arrowSide = "left";
      break;
  }

  // Clamp to viewport
  const MARGIN = 12;
  left = Math.max(MARGIN, Math.min(left, viewportWidth - tooltipWidth - MARGIN));
  top = Math.max(MARGIN, Math.min(top, viewportHeight - tooltipHeight - MARGIN));

  // If we'd go off the top, flip to bottom
  if (placement === "top" && top < MARGIN) {
    top = targetRect.bottom + GAP;
    arrowSide = "top";
  }

  return { top, left, arrowSide };
}

const ARROW_CLASSES: Record<TooltipPosition["arrowSide"], string> = {
  bottom:
    "bottom-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-0 border-l-[8px] border-r-[8px] border-t-[8px] border-t-white",
  top: "top-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-0 border-l-[8px] border-r-[8px] border-b-[8px] border-b-white",
  left: "left-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-0 border-t-[8px] border-b-[8px] border-r-[8px] border-r-white",
  right:
    "right-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-0 border-t-[8px] border-b-[8px] border-l-[8px] border-l-white",
};

export function TourTooltip() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useTour();  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<TooltipPosition | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step) {
      setPos(null);
      setTargetRect(null);
      return;
    }

    function measure() {
      const el = document.getElementById(step.targetId);
      if (!el || !tooltipRef.current) return;

      const rect = el.getBoundingClientRect();
      const tw = tooltipRef.current.offsetWidth || 260;
      const th = tooltipRef.current.offsetHeight || 140;
      setTargetRect(rect);
      setPos(
        getTooltipPosition(rect, tw, th, step.placement, window.innerWidth, window.innerHeight)
      );
    }

    function scrollThenMeasure() {
      const el = document.getElementById(step.targetId);

      // If this step's target isn't in the DOM (e.g. optional tab not shown),
      // skip to the next step automatically.
      if (!el) {
        nextStep();
        return;
      }

      // Scroll the element into view horizontally (for tab bars) without
      // moving the page vertically. Then re-measure after the scroll settles.
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

      // Give the smooth scroll a moment to land before measuring position
      const t = setTimeout(measure, 150);
      return t;
    }

    // Run after paint so the tooltip dimensions are known
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const raf = requestAnimationFrame(() => {
      scrollTimer = scrollThenMeasure();
    });

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(scrollTimer);
      window.removeEventListener("resize", measure);
    };
  }, [isActive, step]);

  if (!isActive || !step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: targetRect
            ? `radial-gradient(
                ellipse ${targetRect.width + 24}px ${targetRect.height + 24}px
                at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
                transparent 0%,
                transparent 50%,
                rgba(0,0,0,0.65) 70%
              )`
            : "rgba(0,0,0,0.65)",
        }}
      />

      {/* Visual dimming layer — pointer-events:none so dialogs/modals above
           this z-level (radix Dialog, sheets, etc.) remain fully interactive. */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
      />

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-xl ring-2 ring-white/80 ring-offset-2 ring-offset-transparent transition-all duration-300"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[10000] w-[260px] rounded-2xl bg-white shadow-2xl p-4",
          "transition-all duration-300 ease-out",
          pos ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={
          pos
            ? { top: pos.top, left: pos.left }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        }
      >
        {/* Arrow */}
        {pos && (
          <div
            className={cn("absolute w-0 h-0 border-solid", ARROW_CLASSES[pos.arrowSide])}
          />
        )}

        {/* Step counter + close */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={skipTour}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            aria-label="Skip tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <p className="font-semibold text-sm text-foreground leading-snug mb-1">
          {step.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentStep
                  ? "w-4 bg-[#34132E]"
                  : i < currentStep
                  ? "w-1.5 bg-[#34132E]/40"
                  : "w-1.5 bg-gray-200"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={prevStep}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className="ml-auto flex items-center gap-1 text-xs font-semibold text-white bg-[#34132E] hover:bg-[#4a1d42] transition-colors px-3 py-1.5 rounded-lg active:scale-95"
          >
            {isLast ? "Done 🎉" : "Next"}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </>
  );
}
