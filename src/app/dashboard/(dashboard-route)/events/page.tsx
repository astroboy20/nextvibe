"use client";

import Discover from "./container/discover";
import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { setLocation, setLocationSynced } from "@/app/provider/slices/location-slice";
import { useUserLocation } from "@/hooks/get-location";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const { location } = useUserLocation();
  // Guard: run the whole block exactly once per mount
  const hasRun = useRef(false);

  useEffect(() => {
    // Wait until location resolves with real data
    if (!location?.city && !location?.country) return;
    // Only ever run once — prevents any re-render loop
    if (hasRun.current) return;
    hasRun.current = true;

    // 1. Push resolved location into Redux
    dispatch(setLocation(location));
    dispatch(setLocationSynced(true));

    // 2. Read token directly from document.cookie — works reliably in all contexts
    const token =
      document.cookie.split("; ").find((r) => r.startsWith("accessToken="))?.split("=")[1] ??
      document.cookie.split("; ").find((r) => r.startsWith("admin_accessToken="))?.split("=")[1];

    if (!token) return;

    // 3. PATCH /v1/users/me — fire and forget, fail silently
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        city: location.city,
        country: location.country,
      }),
    }).catch(() => {});
  // location is a new object reference each render — only re-run when city/country
  // actually become non-empty, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.city, location?.country]);

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 w-full 2xl:max-w-7xl 2xl:mx-auto">
      <Discover />
    </div>
  );
}
