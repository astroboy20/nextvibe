"use client";

import { useGetEventsQuery } from "@/app/provider/api/eventApi";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import { handleApiError } from "@/utils/apiErrorHandler";
import { Button } from "@/components/ui/button";
import { OfflineDataIndicator } from "@/components/offline-data-indicator";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";

/**
 * Complete example showing:
 * 1. Network status detection
 * 2. Automatic retry with exponential backoff
 * 3. Offline data caching
 * 4. Proper error states
 * 5. User feedback
 */
export const CompleteNetworkHandling = () => {
  const { isOnline } = useNetworkStatus();

  // RTK Query with built-in retry and polling
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetEventsQuery(undefined, {
    // Automatic retry on network errors
    skipPollingIfUnfocused: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
    // Polling every 30 seconds when online
    pollingInterval: isOnline ? 30000 : 0,
  });

  // Cache data for offline access
  const cachedData = useOfflineCache(data, {
    key: "events-cache",
    ttl: 60 * 60 * 1000, // 1 hour
  });

  const apiError = isError ? handleApiError(error) : null;
  const isCached = !isOnline && cachedData && !data;

  // Loading state
  if (isLoading && !cachedData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B1A57]" />
      </div>
    );
  }

  // Network error state
  if (apiError?.isNetworkError && !cachedData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connection Problem
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          {apiError.message}
        </p>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-[#5B1A57] hover:bg-[#4a1446]"
        >
          {isFetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    );
  }

  // Timeout error state
  if (apiError?.isTimeout && !cachedData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Request Timed Out
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          The request took too long. This might be due to slow network.
        </p>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
        >
          {isFetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    );
  }

  // Other errors
  if (isError && !cachedData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          {apiError?.message || "Failed to load events"}
        </p>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
        >
          {isFetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    );
  }

  // Success state (with or without cached data)
  const displayData = data || cachedData;

  return (
    <div className="space-y-4">
      {/* Show indicator if using cached data */}
      {isCached && (
        <OfflineDataIndicator
          isCached={true}
          message="You're offline. Showing cached events."
        />
      )}

      {/* Show subtle loading indicator when refetching in background */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Updating...
        </div>
      )}

      {/* Events list */}
      <div className="grid gap-4">
        {displayData?.data?.map((event: any) => (
          <div
            key={event.id}
            className={`p-4 border rounded-lg ${
              isCached ? "opacity-75" : ""
            }`}
          >
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-sm text-gray-600">{event.description}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!displayData?.data?.length && (
        <div className="text-center py-8 text-gray-500">
          <p>No events found</p>
        </div>
      )}
    </div>
  );
};
