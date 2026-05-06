"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { AlertCircle } from "lucide-react";

interface OfflineDataIndicatorProps {
  isCached?: boolean;
  message?: string;
}

export const OfflineDataIndicator = ({
  isCached = false,
  message = "Showing cached data",
}: OfflineDataIndicatorProps) => {
  const { isOnline } = useNetworkStatus();

  if (isOnline || !isCached) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
