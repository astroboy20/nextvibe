/* eslint-disable prefer-const */
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

// Once a refresh comes back 401 the session is genuinely dead, and every
// subsequent 401 would otherwise kick off its own doomed refresh — which is what
// produced the long run of repeated `POST /api/auth/refresh 401` in the console.
// Latch that state so the app fails fast until fresh credentials arrive.
let refreshRejected = false;

/** Called after a successful login/refresh so the app can recover. */
export function resetAuthRefreshState() {
  refreshRejected = false;
}

function flushQueue(succeeded: boolean) {
  const waiting = pendingRequests;
  pendingRequests = [];
  waiting.forEach(({ resolve, reject }) => (succeeded ? resolve() : reject()));
}

// Routes that are publicly accessible — 401s on these should NOT redirect to login
const PUBLIC_PATHS = [
  "/events",
  "/dashboard/events",
  "/postcards",
  "/postcard",
  "/dashboard/postcards",
  "/game",
  "/purchase",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function clearSessionAndRedirect(isAdminRoute: boolean) {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (isAdminRoute) {
    Cookies.remove("admin_accessToken");
    Cookies.remove("admin_refreshToken");
  } else {
    // Don't redirect to login if we're on a public page — just clear stale tokens
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    if (!isPublicPath(currentPath)) {
      const from = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.href = `/auth/login?from=${from}`;
    }
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

  // Session already known dead — don't start another refresh that will 401 too.
  if (refreshRejected) {
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
    // Refresh token is httpOnly — call the Next.js proxy route which reads it
    // server-side, calls the backend, and sets the new cookies in one step.
    // Hard cap so a hung refresh doesn't freeze the whole app. 20 s rather
    // than 10 s: the API cold-starts on Render, and aborting too early used to
    // strand the client with a refresh the server had already processed.
    const refreshController = new AbortController();
    const refreshTimeout = setTimeout(() => refreshController.abort(), 20000);

    let refreshRes: Response;
    try {
      refreshRes = await fetch(
        `/api/auth/refresh${isAdminRoute ? "?isAdmin=true" : ""}`,
        { method: "POST", signal: refreshController.signal }
      );
    } finally {
      clearTimeout(refreshTimeout);
    }

    if (refreshRes.ok) {
      refreshRejected = false;
      flushQueue(true);
      // prepareHeaders will pick up the new accessToken cookie on retry
      return rawBaseQuery(args, api, extraOptions);
    }

    // A 401/403 from the refresh route means the refresh token itself was
    // rejected — the session is over. Any other status is a server-side blip,
    // so keep the tokens and let the next request try again rather than
    // logging the user out over a transient 500.
    flushQueue(false);
    if (refreshRes.status === 401 || refreshRes.status === 403) {
      refreshRejected = true;
      clearSessionAndRedirect(isAdminRoute);
    }
    return result;
  } catch {
    // Network error or the 20 s abort fired. We genuinely don't know whether the
    // session is still valid, so don't destroy credentials that may be fine —
    // an aborted refresh used to log people out mid-session.
    flushQueue(false);
    return result;
  } finally {
    isRefreshing = false;
  }
};
