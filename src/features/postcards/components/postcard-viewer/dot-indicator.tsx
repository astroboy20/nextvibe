"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

const DOT_WINDOW = 5;

interface DotIndicatorProps {
  total: number;
  active: number;
  onSelect: (index: number) => void;
}

export const DotIndicator = memo(function DotIndicator({
  total,
  active,
  onSelect,
}: DotIndicatorProps) {
  if (total <= 1) return null;

  const half = Math.floor(DOT_WINDOW / 2);
  let start = active - half;
  let end = start + DOT_WINDOW - 1;

  if (start < 0) {
    start = 0;
    end = Math.min(DOT_WINDOW - 1, total - 1);
  }

  if (end >= total) {
    end = total - 1;
    start = Math.max(0, end - DOT_WINDOW + 1);
  }

  return (
    <div className="flex items-center justify-center gap-1.5" aria-label="Media pagination">
      {Array.from({ length: end - start + 1 }, (_, offset) => start + offset).map(
        (index) => {
          const isActive = index === active;
          const isEdge =
            (index === start && start > 0) ||
            (index === end && end < total - 1);

          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to media ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(index)}
              className={cn(
                "rounded-full transition-all duration-200",
                isActive
                  ? "h-1.5 w-4 bg-white"
                  : isEdge
                  ? "h-1 w-1 bg-white/25"
                  : "h-1.5 w-1.5 bg-white/35"
              )}
            />
          );
        }
      )}
    </div>
  );
});

export default DotIndicator;
