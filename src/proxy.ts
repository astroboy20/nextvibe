import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/verify-email",
  "/check-verification",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Token expiry in seconds
const ACCESS_TOKEN_MAX_AGE  = 60 * 60 * 24 * 7;  // 7 days
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

// Clear tokens and redirect to login
function redirectToLogin(req: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL("/auth/login", req.url));
  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");
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

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  const accessToken  = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

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
    const newAccessToken  = data?.accessToken;
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
