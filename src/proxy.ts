import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

const REFRESH_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`;

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/forgot-password"];

// 🔍 Check if token is expired (NO secret needed)
function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwt(token);
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// 🔄 Call backend to refresh token
async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const { accessToken, refreshToken: newRefreshToken } = json.data;

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    return null;
  }
}

// 🚪 Helper to redirect and clear cookies
function redirectToLogin(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/auth/login", req.url));
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // ❌ No access token → login
  if (!accessToken) {
    console.log("[middleware] No access token");
    return redirectToLogin(req);
  }

  // ✅ Check expiration ONLY (no signature verification)
  const tokenExpired = isTokenExpired(accessToken);

  // ✅ If still valid → allow request
  if (!tokenExpired) {
    return NextResponse.next();
  }

  console.log("[middleware] Access token expired");

  // ❌ No refresh token → login
  if (!refreshToken) {
    console.log("[middleware] No refresh token");
    return redirectToLogin(req);
  }

  // 🔄 Try to refresh
  const tokens = await refreshAccessToken(refreshToken);

  // ❌ Refresh failed → login
  if (!tokens) {
    console.log("[middleware] Refresh failed");
    return redirectToLogin(req);
  }

  console.log("[middleware] Token refreshed successfully");

  // ✅ Set new cookies
  const response = NextResponse.next();

  response.cookies.set("accessToken", tokens.accessToken, {
    // httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  response.cookies.set("refreshToken", tokens.refreshToken, {
    // httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};