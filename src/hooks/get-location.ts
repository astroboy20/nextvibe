/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";

interface UserLocation {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
}

export function useUserLocation() {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                const geocoder = new google.maps.Geocoder();

                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                    if (status === "OK" && results?.[0]) {
                        const components = results[0].address_components;

                        const city =
                            components.find((c) => c.types.includes("locality"))?.long_name ||
                            components.find((c) =>
                                c.types.includes("administrative_area_level_1")
                            )?.long_name ||
                            "";

                        const country =
                            components.find((c) => c.types.includes("country"))?.long_name ||
                            "";

                        setLocation({
                            latitude,
                            longitude,
                            address: results[0].formatted_address,
                            city,
                            country,
                        });
                    } else {
                        setLocation({ latitude, longitude, address: "", city: "", country: "" });
                    }

                    setLoading(false);
                });
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
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [])



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