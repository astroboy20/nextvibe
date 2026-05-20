import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE  = 60 * 60 * 24 * 7;  // 7 days
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, isAdmin } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ message: "accessToken is required" }, { status: 400 });
    }

    const prefix = isAdmin ? "admin_" : "";
    const response = NextResponse.json({ message: "Tokens stored successfully" }, { status: 200 });

    response.cookies.set(`${prefix}accessToken`, accessToken, {
      httpOnly: false, // must be readable by js-cookie on the client for Authorization headers
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    if (refreshToken) {
      response.cookies.set(`${prefix}refreshToken`, refreshToken, {
        httpOnly: false, // must be readable by JS to send in the refresh POST body
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ message: "An error occurred while storing the tokens" }, { status: 500 });
  }
}
