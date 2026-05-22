import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/how-it-works",
  "/contact",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/verify-email",
  "/check-verification",
  "/game",
  "/faq",
  "/policy",
  "/terms",
  "/events",
  "/postcards",
];

// Admin-only routes — protected by admin_accessToken
const ADMIN_ROUTES = ["/admin"];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Token expiry in seconds
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;  // 7 days
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Returns true when the token is expired or within 1 minute of expiring
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) return false;
    return exp * 1000 - Date.now() < 60 * 1000;
  } catch {
    return true;
  }
}

// Clear tokens and redirect to login, preserving the current path as ?from
function redirectToLogin(req: NextRequest): NextResponse {
  const from = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
  const res = NextResponse.redirect(new URL(`/auth/login?from=${from}`, req.url));
  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");
  return res;
}

// Clear admin tokens and redirect to login
function redirectAdminToLogin(req: NextRequest): NextResponse {
  const from = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
  const res = NextResponse.redirect(new URL(`/auth/login?from=${from}`, req.url));
  res.cookies.delete("admin_accessToken");
  res.cookies.delete("admin_refreshToken");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static assets, Next.js internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle admin routes — require admin_accessToken
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdminRoute) {
    const adminAccessToken = req.cookies.get("admin_accessToken")?.value;
    const adminRefreshToken = req.cookies.get("admin_refreshToken")?.value;

    // No admin tokens — send to login
    if (!adminAccessToken && !adminRefreshToken) {
      return redirectAdminToLogin(req);
    }

    // Admin access token is still valid — let through
    if (adminAccessToken && !isTokenExpired(adminAccessToken)) {
      return NextResponse.next();
    }

    // Admin access token missing or expired — try to refresh
    if (!adminRefreshToken) {
      return redirectAdminToLogin(req);
    }

    try {
      const refreshRes = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          // Send the admin refresh token as the cookie header
          cookie: `refreshToken=${adminRefreshToken}`,
        },
      });

      if (!refreshRes.ok) {
        return redirectAdminToLogin(req);
      }

      const { data } = await refreshRes.json();
      const newAccessToken = data?.accessToken;
      const newRefreshToken = data?.refreshToken;

      if (!newAccessToken) {
        return redirectAdminToLogin(req);
      }

      const response = NextResponse.next();

      response.cookies.set("admin_accessToken", newAccessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      if (newRefreshToken) {
        response.cookies.set("admin_refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE,
        });
      }

      return response;
    } catch {
      return redirectAdminToLogin(req);
    }
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Fall back to admin tokens so admins can visit non-admin pages
  const accessToken =
    req.cookies.get("accessToken")?.value ??
    req.cookies.get("admin_accessToken")?.value;
  const refreshToken =
    req.cookies.get("refreshToken")?.value ??
    req.cookies.get("admin_refreshToken")?.value;

  // No tokens at all — send to login
  if (!accessToken && !refreshToken) {
    return redirectToLogin(req);
  }

  // Access token is still valid — let the request through
  if (accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  // Access token missing or expired — try to refresh
  if (!refreshToken) {
    return redirectToLogin(req);
  }

  try {
    const refreshRes = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!refreshRes.ok) {
      return redirectToLogin(req);
    }

    const { data } = await refreshRes.json();
    const newAccessToken = data?.accessToken;
    const newRefreshToken = data?.refreshToken;

    if (!newAccessToken) {
      return redirectToLogin(req);
    }

    const response = NextResponse.next();

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false, // must be readable by js-cookie on the client for Authorization headers
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    if (newRefreshToken) {
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true, // only read server-side by middleware — never exposed to JS
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

    return response;
  } catch {
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
