import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const { searchParams } = request.nextUrl;
  const isAdmin = searchParams.get("isAdmin") === "true";

  const cookieName = isAdmin ? "admin_accessToken" : "accessToken";
  const token = cookieStore?.get(cookieName)?.value;

  return NextResponse.json({ token });
}
