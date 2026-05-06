"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/utils/apiErrorHandler";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface UseMutationWithRetryOptions {
  maxRetries?: number;
  delayMs?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export const useMutationWithRetry = <T, R>(
  mutationFn: (data: T) => Promise<R>,
  options: UseMutationWithRetryOptions = {}
) => {
  const {
    maxRetries = 3,
    delayMs = 1000,
    onSuccess,
    onError,
    showToast = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(
    async (data: T): Promise<R | null> => {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);

      let lastError: any = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await mutationFn(data);
          setIsLoading(false);
          setRetryCount(0);

          if (showToast) {
            toast.success("Operation successful");
          }
          onSuccess?.();

          return result;
        } catch (err: any) {
          lastError = err;
          setRetryCount(attempt + 1);

          // Don't retry on 4xx errors (except 408, 429)
          const status = err?.status;
          if (
            typeof status === "number" &&
            status >= 400 &&
            status < 500 &&
            status !== 408 &&
            status !== 429
          ) {
            break;
          }

          // If this is the last attempt, break
          if (attempt === maxRetries) {
            break;
          }

          // Wait before retrying (exponential backoff)
          const waitTime = delayMs * Math.pow(2, attempt);
          if (showToast && attempt > 0) {
            toast.loading(`Retrying... (attempt ${attempt + 1}/${maxRetries})`);
          }
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      // All retries failed
      setIsLoading(false);
      const apiError = handleApiError(lastError);
      setError(apiError.message);

      if (showToast) {
        toast.error("Operation failed", {
          description: apiError.message,
        });
      }
      onError?.(apiError.message);

      return null;
    },
    [mutationFn, maxRetries, delayMs, onSuccess, onError, showToast]
  );

  return {
    execute,
    isLoading,
    error,
    retryCount,
  };
};
