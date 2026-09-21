"use client";

import Discover from "./container/discover";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { setLocation, setLocationSynced } from "@/app/provider/slices/location-slice";
import { setLocationConsentAsked } from "@/app/provider/slices/consent-slice";
import { useUserLocation } from "@/hooks/get-location";
import { LocationConsentDialog } from "@/components/location-consent-dialog";
import { RootState } from "@/app/provider/store";

/**
 * DiscoverPage
 *
 * NDPC/NDPA 2023 compliant location flow:
 *  1. On first visit, show LocationConsentDialog before touching the browser API.
 *  2. If the user grants consent → trigger geolocation → resolve city/country only.
 *  3. If the user declines → skip location entirely.
 *  4. City/country are synced to the backend (PATCH /v1/users/me), never raw coords.
 */
export default function DiscoverPage() {
  const dispatch = useDispatch();
  const locationConsentAsked = useSelector(
    (s: RootState) => s.consent.locationConsentAsked
  );
  const locationConsent = useSelector(
    (s: RootState) => s.consent.locationConsent
  );
  const synced = useSelector((s: RootState) => s.location.synced);

  // Show consent dialog on the first visit (when we haven't asked yet)
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);

  // Only render the dialog once the component mounts (client-side only)
  useEffect(() => {
    if (!locationConsentAsked) {
      setShowConsentDialog(true);
    } else if (locationConsent === true && !synced) {
      // Already consented in a previous session but not yet synced this session
      setGeolocationEnabled(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConsentAccept = () => {
    setShowConsentDialog(false);
    setGeolocationEnabled(true);
    dispatch(setLocationConsentAsked(true));
  };

  const handleConsentDecline = () => {
    setShowConsentDialog(false);
    dispatch(setLocationConsentAsked(true));
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 w-full 2xl:max-w-7xl 2xl:mx-auto">
      {/* Consent dialog — shown before any geolocation call */}
      <LocationConsentDialog
        open={showConsentDialog}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      {/* Only mount the geolocation tracker when consent is granted */}
      {geolocationEnabled && <LocationSyncer />}

      <Discover />
    </div>
  );
}

/**
 * LocationSyncer
 *
 * Isolated component that triggers geolocation and syncs city/country to Redux
 * and the backend. Rendered only after explicit user consent.
 */
function LocationSyncer() {
  const dispatch = useDispatch();
  const { location } = useUserLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!location?.city && !location?.country) return;
    if (hasRun.current) return;
    hasRun.current = true;

    // 1. Push resolved location into Redux (city + country only)
    dispatch(setLocation({ city: location.city, country: location.country }));
    dispatch(setLocationSynced(true));

    // 2. Read token directly from document.cookie
    const token =
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("accessToken="))
        ?.split("=")[1] ??
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("admin_accessToken="))
        ?.split("=")[1];

    if (!token) return;

    // 3. PATCH /v1/users/me — city + country only, fire and forget
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.city, location?.country]);

  return null;
}
