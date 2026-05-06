import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export interface ApiError {
  message: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  statusCode?: number;
}

export const handleApiError = (
  error: FetchBaseQueryError | SerializedError | undefined
): ApiError => {
  // Network error (no response from server)
  if (error && "status" in error) {
    if (error.status === "FETCH_ERROR") {
      return {
        message: "Network error. Please check your connection and try again.",
        isNetworkError: true,
        isTimeout: false,
      };
    }

    if (error.status === "TIMEOUT_ERROR") {
      return {
        message: "Request timed out. Please try again.",
        isNetworkError: false,
        isTimeout: true,
      };
    }

    if (error.status === "PARSING_ERROR") {
      return {
        message: "Unable to process server response. Please try again.",
        isNetworkError: false,
        isTimeout: false,
      };
    }

    // HTTP error with status code
    if (typeof error.status === "number") {
      const data = error.data as any;
      return {
        message: data?.message || `Error: ${error.status}`,
        isNetworkError: false,
        isTimeout: false,
        statusCode: error.status,
      };
    }
  }

  // SerializedError
  if (error && "message" in error) {
    return {
      message: error.message || "An unexpected error occurred",
      isNetworkError: false,
      isTimeout: false,
    };
  }

  return {
    message: "An unexpected error occurred",
    isNetworkError: false,
    isTimeout: false,
  };
};

export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  return handleApiError(error).message;
};
