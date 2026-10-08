"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored", {
        description: "You're back online",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection", {
        description: "Please check your network",
        duration: Infinity, // Keep showing until online
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
};
