import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  retry,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  timeout: 15000, // 15 second timeout
  prepareHeaders: (headers) => {
    // Prefer admin token when on admin routes
    const isAdminRoute =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin");
    const accessToken = isAdminRoute
      ? (Cookies.get("admin_accessToken") ?? Cookies.get("accessToken"))
      : Cookies.get("accessToken");
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// Wrap with retry logic for network failures
const baseQueryWithRetry = retry(rawBaseQuery, { maxRetries: 3 });

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Don't refresh on logout requests
  const isLogoutRequest = typeof args === "object" && args.url === "/v1/auth/logout";

  const isAdminRoute =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  let result = await baseQueryWithRetry(args, api, extraOptions);

  if (result.error?.status === 401 && !isLogoutRequest) {
    // Try to refresh the token using the httpOnly refresh token cookie
    const refreshResult = await rawBaseQuery(
      { url: "/v1/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { accessToken?: string; data?: { accessToken?: string } };
      const newAccessToken = data.accessToken ?? data.data?.accessToken;

      if (newAccessToken) {
        // Store the new access token via the Next.js API route so cookie is set correctly
        await fetch("/api/auth/store-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: newAccessToken, isAdmin: isAdminRoute }),
        });

        // Retry the original request with the new token
        result = await baseQueryWithRetry(args, api, extraOptions);
      } else {
        // No access token in response — redirect to login
        isAdminRoute ? Cookies.remove("admin_accessToken") : Cookies.remove("accessToken");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    } else if (refreshResult.error?.status === 401) {
      // Refresh token is also expired — redirect to login immediately
      isAdminRoute ? Cookies.remove("admin_accessToken") : Cookies.remove("accessToken");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } else {
      // Other refresh error — redirect to login
      isAdminRoute ? Cookies.remove("admin_accessToken") : Cookies.remove("accessToken");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  }

  return result;
};
