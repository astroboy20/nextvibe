import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/dashboard/event/create"
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Check expiry
function isTokenExpired(token: string) {
  try {
    const payload = decodeJwt(token);

    if (!payload.exp) return false;

    // Refresh 1 min before expiry (Best practice)
    const expiresIn = payload.exp * 1000 - Date.now();

    return expiresIn < 60 * 1000;
  } catch {
    return true;
  }
}

// Redirect helper
function redirectToLogin(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/auth/login", req.url));

  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");

  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;



  // No tokens
  if (!accessToken || !refreshToken) {
    return redirectToLogin(req);
  }

  // Access token still valid
  if (!isTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  // Try refresh
  try {
    const res = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: "POST",

      // VERY IMPORTANT
      credentials: "include",

      headers: {
        "Content-Type": "application/json",

        // pass cookies
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (!res.ok) {
      return redirectToLogin(req);
    }

    const data = await res.json();

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = data.data;

    const response = NextResponse.next();

    // Replace access token
    response.cookies.set("accessToken", newAccessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    // Replace refresh token
    response.cookies.set("refreshToken", newRefreshToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};