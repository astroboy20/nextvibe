"use client";

import axios from "axios";
import { useEffect, useRef } from "react";

interface UsePostcardTrackerProps {
  postId: string;
  sessionId?: string;
}

export const usePostcardViewTracker = ({
  postId,
  sessionId,
}: UsePostcardTrackerProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // User is focusing on this card. Wait 1.5 seconds to ensure it's an actual view.
            timerRef.current = setTimeout(async () => {
              try {
                // Fire and forget view tracking request
                await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL}/v1/postcards/${postId}/view`,
                  {
                    sessionId: sessionId || null, // Fallback tracking for guest sessions
                  }
                );
              } catch (error) {
                console.error("Failed to log postcard view:", error);
              }
            }, 1500); // 1.5 seconds dwell threshold
          } else {
            // User scrolled away before 1.5s — cancel the pending execution loop
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }
        });
      },
      {
        threshold: 0.5, // Requires at least 50% of the item to be on-screen
      }
    );
    // Start monitoring the element
    observer.observe(currentElement);

    // Clean up connections when component unmounts or postcard changes
    return () => {
      observer.unobserve(currentElement);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [postId, sessionId]);

  return elementRef;
};
