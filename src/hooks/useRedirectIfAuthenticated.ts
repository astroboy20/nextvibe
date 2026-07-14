"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

/**
 * Redirects an already-authenticated visitor away from auth pages
 * (login/register) to their intended destination or a sensible default.
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isAdmin = !!Cookies.get("admin_accessToken");
    const isAuthenticated = isAdmin || !!Cookies.get("accessToken");
    if (!isAuthenticated) return;

    const rawFrom = searchParams.get("from");
    const from = rawFrom
      ? (() => {
        try { return decodeURIComponent(rawFrom); } catch { return rawFrom; }
      })()
      : null;
    const validFrom = from && from.startsWith("/") && !from.startsWith("/auth") ? from : null;
    const destination = isAdmin ? (validFrom ?? "/admin") : (validFrom ?? "/events");

    router.replace(destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
