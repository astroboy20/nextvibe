import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  timeout: 15000,
  prepareHeaders: (headers) => {
    const isAdminRoute =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin");
    const accessToken = isAdminRoute
      ? (Cookies.get("admin_accessToken") ?? Cookies.get("accessToken"))
      : (Cookies.get("accessToken") ?? Cookies.get("admin_accessToken"));
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// ─── Token refresh queue ──────────────────────────────────────────────────────
// When several requests 401 simultaneously (e.g. page load fires 3 API calls),
// only the first one does the refresh. The rest wait here and replay once the
// new token is in the cookie — no duplicate refresh calls.

let isRefreshing = false;
let pendingRequests: Array<{ resolve: () => void; reject: () => void }> = [];

function flushQueue(succeeded: boolean) {
  const waiting = pendingRequests;
  pendingRequests = [];
  waiting.forEach(({ resolve, reject }) => (succeeded ? resolve() : reject()));
}

function clearSessionAndRedirect(isAdminRoute: boolean) {
  if (typeof window === "undefined") return;
  if (isAdminRoute) {
    Cookies.remove("admin_accessToken");
    Cookies.remove("admin_refreshToken");
  } else {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    const from = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    window.location.href = `/auth/login?from=${from}`;
  }
}

// ─── Base query with reauth ───────────────────────────────────────────────────

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const isLogoutRequest =
    typeof args === "object" && args.url === "/v1/auth/logout";
  const isAdminRoute =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || isLogoutRequest) {
    return result;
  }

  // ── Another refresh is already in flight — queue this request ──────────────
  if (isRefreshing) {
    try {
      await new Promise<void>((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      });
      // Cookie now has the new token — retry transparently
      return rawBaseQuery(args, api, extraOptions);
    } catch {
      return result;
    }
  }

  // ── First 401 — own the refresh ────────────────────────────────────────────
  isRefreshing = true;

  try {
    const refreshToken = isAdminRoute
      ? (Cookies.get("admin_refreshToken") ?? Cookies.get("refreshToken"))
      : (Cookies.get("refreshToken") ?? Cookies.get("admin_refreshToken"));

    const refreshResult = await rawBaseQuery(
      { url: "/v1/auth/refresh", method: "POST", body: { refreshToken } },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        accessToken?: string;
        refreshToken?: string;
        data?: { accessToken?: string; refreshToken?: string };
      };
      const newAccessToken = data.accessToken ?? data.data?.accessToken;
      const newRefreshToken = data.refreshToken ?? data.data?.refreshToken;

      if (newAccessToken) {
        await fetch("/api/auth/store-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isAdmin: isAdminRoute,
          }),
        });

        flushQueue(true);
        // prepareHeaders will pick up the new cookie on retry
        return rawBaseQuery(args, api, extraOptions);
      }
    }

    // Refresh call failed or returned no token
    flushQueue(false);
    clearSessionAndRedirect(isAdminRoute);
    return result;
  } catch {
    flushQueue(false);
    clearSessionAndRedirect(isAdminRoute);
    return result;
  } finally {
    isRefreshing = false;
  }
};
