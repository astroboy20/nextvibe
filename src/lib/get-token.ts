"use client";

import Cookies from "js-cookie";

export function getTokens() {
    return {
        accessToken: Cookies.get("accessToken") ?? null,
    };
}
