"use client";

import Discover from "./container/discover";
import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { setLocation, setLocationSynced } from "@/app/provider/slices/location-slice";
import { useUserLocation } from "@/hooks/get-location";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const { location } = useUserLocation();
  const hasSynced = useRef(false);

  useEffect(() => {
    // location not resolved yet
    if (!location) return;

    // always keep Redux in sync
    dispatch(setLocation(location));

    // only sync to backend once per mount, and only when we have something useful
    if (hasSynced.current) return;
    if (!location.city && !location.country) return;

    hasSynced.current = true;
    dispatch(setLocationSynced(true));

    // Read token at call time — avoids stale closure
    const token =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1] ??
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_accessToken="))
        ?.split("=")[1];

    if (!token) return;

    // PATCH /v1/users/me — fire and forget, never blocks UI
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...(location.city ? { city: location.city } : {}),
        ...(location.country ? { country: location.country } : {}),
      }),
    }).catch(() => {/* fail silently */});

  }, [location, dispatch]);

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 w-full 2xl:max-w-7xl 2xl:mx-auto">
      <Discover />
    </div>
  );
}
