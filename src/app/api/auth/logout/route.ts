import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST() {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("accessToken")?.value ??
    cookieStore.get("admin_accessToken")?.value;
  const refreshToken =
    cookieStore.get("refreshToken")?.value ??
    cookieStore.get("admin_refreshToken")?.value;

  // Best-effort — revoke the token on the backend. If this fails we still
  // clear the cookies so the user is logged out locally.
  if (accessToken && refreshToken) {
    try {
      await fetch(`${API_URL}/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore
    }
  }

  const response = NextResponse.json({ message: "Logged out" });
  const cookieOpts = { path: "/" };
  response.cookies.delete({ name: "accessToken", ...cookieOpts });
  response.cookies.delete({ name: "refreshToken", ...cookieOpts });
  response.cookies.delete({ name: "admin_accessToken", ...cookieOpts });
  response.cookies.delete({ name: "admin_refreshToken", ...cookieOpts });
  return response;
}
