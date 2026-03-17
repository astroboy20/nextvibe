/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { canvasStore } from "./canvas-store";

export function useCanvas() {
  const [canvas, setCanvas] = useState<any>(() => canvasStore.get());

  useEffect(() => {
    setCanvas(canvasStore.get());
    // Subscribe to future changes
    const unsub = canvasStore.onChange((c) => setCanvas(c));
    return unsub;
  }, []);

  return canvas;
}
