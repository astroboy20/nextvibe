"use client";

import { useEffect, useState } from "react";

// Largest standard mobile viewport width (iPhone Pro Max landscape = 932px,
// but we gate on portrait width — 430px is the widest portrait mobile screen).
// Anything wider than this is considered a non-mobile screen.
export const MOBILE_MAX_WIDTH = 768;

export type ViewportState = "mobile" | "desktop" | "unknown";

/**
 * Returns whether the current viewport is within mobile width.
 * Returns "unknown" on the server / before hydration to avoid flicker.
 */
export function useMobileViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>("unknown");

  useEffect(() => {
    const check = () => {
      setState(window.innerWidth <= MOBILE_MAX_WIDTH ? "mobile" : "desktop");
    };

    check();

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  return state;
}
