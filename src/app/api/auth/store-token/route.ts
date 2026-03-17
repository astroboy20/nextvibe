import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ message: "Token is required" }, { status: 400 })
        }

        const response = NextResponse.json({ message: "Token stored successfully" }, { status: 200 })
        response.cookies.set("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
        })
        return response
    } catch (error) {
        return NextResponse.json({ message: "An error occurred while storing the token" }, { status: 500 })
    }
}