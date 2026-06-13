import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCESS_TOKEN_MAX_AGE  = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const { searchParams } = request.nextUrl;
  const isAdmin = searchParams.get("isAdmin") === "true";

  const refreshToken = isAdmin
    ? (cookieStore.get("admin_refreshToken")?.value ?? cookieStore.get("refreshToken")?.value)
    : (cookieStore.get("refreshToken")?.value ?? cookieStore.get("admin_refreshToken")?.value);

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!backendRes.ok) {
      return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
    }

    const json = await backendRes.json();
    const newAccessToken: string = json.data?.accessToken ?? json.accessToken;
    const newRefreshToken: string = json.data?.refreshToken ?? json.refreshToken;

    if (!newAccessToken) {
      return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
    }

    const response = NextResponse.json({ accessToken: newAccessToken });

    const accessOpts = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    const refreshOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("accessToken", newAccessToken, { ...accessOpts, maxAge: ACCESS_TOKEN_MAX_AGE });
    if (newRefreshToken) {
      response.cookies.set("refreshToken", newRefreshToken, { ...refreshOpts, maxAge: REFRESH_TOKEN_MAX_AGE });
    }

    if (isAdmin) {
      response.cookies.set("admin_accessToken", newAccessToken, { ...accessOpts, maxAge: ACCESS_TOKEN_MAX_AGE });
      if (newRefreshToken) {
        response.cookies.set("admin_refreshToken", newRefreshToken, { ...refreshOpts, maxAge: REFRESH_TOKEN_MAX_AGE });
      }
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
  }
}
