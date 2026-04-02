import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const REFRESH_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/refresh`;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);


const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/forgot-password"];


async function refreshAccessToken(
    refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
        const res = await fetch(REFRESH_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) return null;

        const json = await res.json();
        const { accessToken, refreshToken: newRefreshToken } = json.data;

        return { accessToken, refreshToken: newRefreshToken };
    } catch {
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        PUBLIC_ROUTES.includes(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const accessToken =
        req.cookies.get("accessToken")?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");

    const refreshToken =
        req.cookies.get("refreshToken")?.value ||
        req.headers.get("x-refresh-token") ||
        undefined;

    if (!accessToken) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
        await jwtVerify(accessToken, JWT_SECRET);
        return NextResponse.next();
    } catch (err: any) {

        if (err?.code !== "ERR_JWT_EXPIRED") {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }


    if (!refreshToken) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const tokens = await refreshAccessToken(refreshToken);

    if (!tokens) {
        const response = NextResponse.redirect(new URL("/auth/login", req.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
    }

    const response = NextResponse.next();

    response.cookies.set("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return response;
}

export const config = {

    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};