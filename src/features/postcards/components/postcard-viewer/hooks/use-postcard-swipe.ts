"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UsePostcardSwipeOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  currentIndex: number;
  total: number;
  onNavigate?: (index: number) => void;
  enabled: boolean;
}

export function usePostcardSwipe({
  containerRef,
  currentIndex,
  total,
  onNavigate,
  enabled,
}: UsePostcardSwipeOptions) {
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const swipeDeltaY = useRef(0);
  const frameRef = useRef<number | null>(null);
  const pendingOffsetRef = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeTransitioning, setSwipeTransitioning] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled || total <= 1) return;

    const setOffset = (offset: number) => {
      pendingOffsetRef.current = offset;
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        setSwipeOffset(pendingOffsetRef.current);
      });
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
      touchStartX.current = event.touches[0]?.clientX ?? null;
      swipeDeltaY.current = 0;
      setSwipeTransitioning(false);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY.current === null || touchStartX.current === null) return;

      const currentY = event.touches[0]?.clientY ?? touchStartY.current;
      const currentX = event.touches[0]?.clientX ?? touchStartX.current;
      const dy = touchStartY.current - currentY;
      const dx = touchStartX.current - currentX;

      // Preserve the original horizontal-direction guard.
      if (Math.abs(dx) > Math.abs(dy) * 0.9) return;

      event.preventDefault();
      swipeDeltaY.current = dy;

      const hasNext = currentIndex < total - 1;
      const hasPrev = currentIndex > 0;
      const resistedDy =
        (!hasNext && dy > 0) || (!hasPrev && dy < 0)
          ? dy * 0.2
          : dy * 0.85;

      // Coalesce touch events into animation frames instead of rendering for
      // every browser touchmove event.
      setOffset(-resistedDy);
    };

    const onTouchEnd = () => {
      if (touchStartY.current === null) return;

      const dy = swipeDeltaY.current;
      const threshold = 100;
      setSwipeTransitioning(true);

      if (dy > threshold) {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= total) {
          toast("You've reached the last postcard", { icon: "🏁" });
          setOffset(0);
        } else {
          onNavigate?.(nextIndex);
        }
      } else if (dy < -threshold) {
        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          toast("You're already at the first postcard", { icon: "🔝" });
          setOffset(0);
        } else {
          onNavigate?.(prevIndex);
        }
      } else {
        setOffset(0);
      }

      touchStartY.current = null;
      touchStartX.current = null;
      swipeDeltaY.current = 0;

      window.setTimeout(() => {
        setSwipeTransitioning(false);
        setSwipeOffset(0);
      }, 300);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [containerRef, currentIndex, enabled, onNavigate, total]);

  useEffect(() => {
    // Reset visual offset whenever the parent moves to another postcard.
    setSwipeOffset(0);
    pendingOffsetRef.current = 0;
  }, [currentIndex]);

  return { swipeOffset, swipeTransitioning };
}
