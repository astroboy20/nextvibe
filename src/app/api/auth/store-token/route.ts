import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE  = 60 * 60 * 24 * 7;  // 7 days
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, isAdmin } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ message: "accessToken is required" }, { status: 400 });
    }

    const response = NextResponse.json({ message: "Tokens stored successfully" }, { status: 200 });

    const cookieBase = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Always set the unprefixed cookie so non-admin routes can find the token
    response.cookies.set("accessToken", accessToken, { ...cookieBase, maxAge: ACCESS_TOKEN_MAX_AGE });

    if (refreshToken) {
      response.cookies.set("refreshToken", refreshToken, { ...cookieBase, maxAge: REFRESH_TOKEN_MAX_AGE });
    }

    // Additionally set the admin-prefixed cookies for the admin panel
    if (isAdmin) {
      response.cookies.set("admin_accessToken", accessToken, { ...cookieBase, maxAge: ACCESS_TOKEN_MAX_AGE });
      if (refreshToken) {
        response.cookies.set("admin_refreshToken", refreshToken, { ...cookieBase, maxAge: REFRESH_TOKEN_MAX_AGE });
      }
    }

    return response;
  } catch {
    return NextResponse.json({ message: "An error occurred while storing the tokens" }, { status: 500 });
  }
}
