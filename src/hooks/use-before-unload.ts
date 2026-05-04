"use client";

import { useEffect } from "react";


export function useBeforeUnload(active: boolean) {
    useEffect(() => {
        if (!active) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue =
                "You have unsaved work. Are you sure you want to leave? Your progress will be lost.";
            return e.returnValue;
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [active]);
}
