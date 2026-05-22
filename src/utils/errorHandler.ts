import axios, { AxiosError } from "axios";
import { ZodError } from "zod";

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad request. Please check your input.",
  401: "You are not authenticated. Please log in.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  405: "This action is not allowed.",
  408: "The request timed out. Please try again.",
  409: "A conflict occurred. The resource may already exist.",
  410: "This resource no longer exists.",
  422: "Validation failed. Please check your input.",
  429: "Too many requests. Please slow down and try again.",
  500: "An internal server error occurred. Please try again later.",
  502: "Bad gateway. The server is temporarily unavailable.",
  503: "Service unavailable. Please try again later.",
  504: "Gateway timeout. The server took too long to respond.",
};

/**
 * Walks common API response shapes and returns the first human-readable message
 * found, or null if none is detected.
 */
function extractMessage(data: unknown): string | null {
  if (typeof data === "string" && data) return data;
  if (!data || typeof data !== "object") return null;

  const d = data as Record<string, any>;

  // { message: string }
  if (typeof d.message === "string" && d.message) return d.message;

  // { error: string }
  if (typeof d.error === "string" && d.error) return d.error;

  // { error: { message: string } } — RTK Query / backend shape
  if (d.error && typeof d.error === "object") {
    const nested = d.error as Record<string, any>;
    if (typeof nested.message === "string" && nested.message)
      return nested.message;
  }

  // { errors: string[] | { message | msg | field }[] } — validation arrays
  if (Array.isArray(d.errors) && d.errors.length > 0) {
    const first = d.errors[0];
    if (typeof first === "string") return first;
    if (typeof first?.message === "string") return first.message;
    if (typeof first?.msg === "string") return first.msg;
  }

  // { detail: string } — DRF / FastAPI shape
  if (typeof d.detail === "string" && d.detail) return d.detail;

  // { details: string }
  if (typeof d.details === "string" && d.details) return d.details;

  // { err: string }
  if (typeof d.err === "string" && d.err) return d.err;

  // { statusMessage: string } — Nuxt / H3 shape
  if (typeof d.statusMessage === "string" && d.statusMessage)
    return d.statusMessage;

  return null;
}

/**
 * Universal error handler — covers RTK Query, Axios, Zod, Fetch, DOM, and
 * plain objects. Returns a human-readable string safe to display in the UI.
 */
function fireLog(message: string, error: unknown): void {
  if (typeof fetch === "undefined") return;
  fetch("/api/log-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context:
        error instanceof Error
          ? { name: error.name, stack: error.stack }
          : undefined,
    }),
  }).catch(() => {});
}

function detectMessage(error: unknown): string {
  try {
    // ── RTK Query error ──────────────────────────────────────────────────────
    // Shape: { status: number | "FETCH_ERROR" | "PARSING_ERROR" | …, data: any }
    if (
      error !== null &&
      typeof error === "object" &&
      "status" in error &&
      "data" in error
    ) {
      const rtkError = error as {
        status: number | string;
        data: unknown;
        error?: string;
      };

      const extracted = extractMessage(rtkError.data);
      if (extracted) return extracted;

      const status =
        typeof rtkError.status === "number" ? rtkError.status : null;
      if (status && HTTP_STATUS_MESSAGES[status])
        return HTTP_STATUS_MESSAGES[status];

      // RTK surfaces fetch-level failures as { status: "FETCH_ERROR", error: string }
      if (typeof rtkError.error === "string" && rtkError.error)
        return rtkError.error;

      if (rtkError.status === "PARSING_ERROR")
        return "Failed to parse server response.";
      if (rtkError.status === "TIMEOUT_ERROR")
        return "Request timed out. Please try again.";
      if (rtkError.status === "CUSTOM_ERROR")
        return "An unexpected error occurred.";

      return "Request failed. Please try again.";
    }

    // ── Axios error ──────────────────────────────────────────────────────────
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<unknown>;

      if (axiosError.response) {
        const { data, status } = axiosError.response;
        const extracted = extractMessage(data);
        if (extracted) return extracted;
        return (
          HTTP_STATUS_MESSAGES[status] ??
          `Request failed with status ${status}.`
        );
      }

      if (
        axiosError.code === "ECONNABORTED" ||
        axiosError.message.toLowerCase().includes("timeout")
      ) {
        return "Request timed out. Please try again.";
      }

      if (axiosError.code === "ERR_NETWORK") {
        return "Network error. Please check your connection.";
      }

      if (axiosError.code === "ERR_CANCELED") {
        return "Request was cancelled.";
      }

      if (axiosError.request) {
        return "No response from the server. Please check your connection.";
      }

      return axiosError.message || "An unknown network error occurred.";
    }

    // ── Zod validation error ─────────────────────────────────────────────────
    if (error instanceof ZodError) {
      const first = error.issues?.[0];
      if (first?.message) return first.message;
      return "Validation failed. Please check your input.";
    }

    // ── AbortError (fetch / XHR cancelled) ──────────────────────────────────
    if (error instanceof DOMException) {
      if (error.name === "AbortError") return "Request was cancelled.";
      if (error.name === "QuotaExceededError")
        return "Storage quota exceeded. Please free up space.";
      if (error.name === "NotAllowedError")
        return "Permission denied. Please allow the required access.";
      return error.message || "A browser error occurred.";
    }

    // ── Fetch / network TypeError ────────────────────────────────────────────
    if (error instanceof TypeError) {
      const msg = error.message.toLowerCase();
      if (msg.includes("failed to fetch") || msg.includes("fetch"))
        return "A network error occurred. Please check your connection.";
      if (msg.includes("networkerror"))
        return "Network error. Please try again.";
      if (msg.includes("load"))
        return "Failed to load the resource. Please try again.";
    }

    // ── Generic Error ────────────────────────────────────────────────────────
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("timeout")) return "Request timed out. Please retry.";
      if (msg.includes("networkerror")) return "Network error. Please try again.";
      if (msg.includes("json") || msg.includes("parse"))
        return "Failed to parse the server response.";
      if (msg.includes("unauthorized") || msg.includes("unauthenticated"))
        return "You are not authenticated. Please log in.";
      if (msg.includes("forbidden"))
        return "You do not have permission to perform this action.";
      return error.message || "An unexpected error occurred.";
    }

    // ── Custom error-like object ─────────────────────────────────────────────
    if (typeof error === "object" && error !== null) {
      const extracted = extractMessage(error);
      if (extracted) return extracted;
    }

    // ── String errors ────────────────────────────────────────────────────────
    if (typeof error === "string" && error) return error;

    // ── Fallback ─────────────────────────────────────────────────────────────
    return "Something went wrong. Please try again later.";
  } catch {
    return "An unexpected error occurred while handling another error.";
  }
}

export function errorHandler(error: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You are offline. Please check your internet connection.";
  }

  const message = detectMessage(error);
  fireLog(message, error);
  return message;
}
