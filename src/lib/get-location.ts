/* eslint-disable react-hooks/set-state-in-effect */
"use client";

/**
 * useUserLocation
 *
 * NDPC/NDPA 2023 compliant location hook.
 *
 * - Only collects city and country — no precise coordinates are stored or
 *   returned. This satisfies the data minimisation principle.
 * - The browser geolocation API is used solely to reverse-geocode a city/country
 *   via Google Maps. Lat/lng are held in memory only for the duration of the
 *   geocoder call and are never persisted to state or the backend.
 * - This hook should only be called after the user has explicitly granted
 *   location consent (see consent-slice + LocationConsentDialog).
 */

import { useState, useEffect, useCallback } from "react";

export interface CityLocation {
  city: string;
  country: string;
}

export function useUserLocation() {
  const [location, setLocation] = useState<CityLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Use Google Maps Geocoder to resolve city + country only.
        // Lat/lng are used transiently here and never stored downstream.
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === "OK" && results?.[0]) {
              const components = results[0].address_components;

              const city =
                components.find((c) => c.types.includes("locality"))
                  ?.long_name ||
                components.find((c) =>
                  c.types.includes("administrative_area_level_1")
                )?.long_name ||
                "";

              const country =
                components.find((c) => c.types.includes("country"))
                  ?.long_name || "";

              // Only city + country — no lat/lng, no full address
              setLocation({ city, country });
            } else {
              setLocation({ city: "", country: "" });
            }

            setLoading(false);
          }
        );
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied.",
          2: "Unable to determine your location.",
          3: "Location request timed out.",
        };
        setError(messages[err.code] || "Failed to get location.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 }
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    // Wait for the Google Maps script to be ready
    const waitForGoogle = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(waitForGoogle);
        getLocation();
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(waitForGoogle);
      setError("Google Maps failed to load.");
      setLoading(false);
    }, 10000);

    return () => {
      clearInterval(waitForGoogle);
      clearTimeout(timeout);
    };
  }, [getLocation]);

  return { location, loading, error, getLocation };
}
