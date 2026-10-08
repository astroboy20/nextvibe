"use client";

import { useEffect } from "react";

export function useBeforeUnload(active: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    if (active) {
      window.addEventListener("beforeunload", handler);
    }

    // Always return cleanup — removes the listener whether active or not
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}
