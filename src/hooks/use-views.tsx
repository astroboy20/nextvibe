"use client";

import { useEffect, useRef } from "react";
import { useTrackPostcardViewMutation } from "@/app/provider/api/eventApi";

interface UsePostcardTrackerProps {
  postId: string;
  sessionId?: string;
  /** Called once when a view is successfully tracked */
  onViewed?: () => void;
}

export const usePostcardViewTracker = ({
  postId,
  sessionId,
  onViewed,
}: UsePostcardTrackerProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const firedRef = useRef(false); // only track once per mount
  const [trackView] = useTrackPostcardViewMutation();

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement || !postId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !firedRef.current) {
            // Wait 1.5 s dwell threshold before counting as a view
            timerRef.current = setTimeout(async () => {
              if (firedRef.current) return;
              firedRef.current = true;
              try {
                await trackView({ postcardId: postId, sessionId: sessionId ?? null }).unwrap();
                onViewed?.();
              } catch {
                // fire-and-forget — silently ignore errors
              }
            }, 1500);
          } else {
            // Scrolled away before threshold — cancel
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(currentElement);

    return () => {
      observer.unobserve(currentElement);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [postId, sessionId, trackView, onViewed]);

  return elementRef;
};
