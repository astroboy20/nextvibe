"use client";

import { useGetEventsQuery } from "@/app/provider/api/eventApi";
import { Button } from "@/components/ui/button";
import { handleApiError } from "@/utils/apiErrorHandler";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";

export const EventsListWithRetry = () => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetEventsQuery(undefined, {
    // Polling: refetch every 30 seconds when online
    pollingInterval: 30000,
    // Skip polling when window is not focused
    skipPollingIfUnfocused: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Refetch when window regains focus
    refetchOnFocus: true,
  });

  const apiError = isError ? handleApiError(error) : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B1A57]" />
      </div>
    );
  }

  // Network error state
  if (apiError?.isNetworkError) {
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
  if (apiError?.isTimeout) {
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
  if (isError) {
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

  // Success state
  return (
    <div className="space-y-4">
      {/* Show subtle loading indicator when refetching in background */}
      {isFetching && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Updating...
        </div>
      )}

      {/* Your events list here */}
      <div className="grid gap-4">
        {data?.data?.map((event: any) => (
          <div key={event.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
