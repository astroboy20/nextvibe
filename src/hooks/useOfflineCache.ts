"use client";

import { useEffect, useState } from "react";

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 1 hour)
  key: string;
}

export const useOfflineCache = <T,>(
  data: T | undefined,
  options: CacheOptions
) => {
  const { ttl = 60 * 60 * 1000, key } = options;
  const [cachedData, setCachedData] = useState<T | undefined>(data);

  // Save to cache when data changes
  useEffect(() => {
    if (data && typeof window !== "undefined") {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      try {
        localStorage.setItem(key, JSON.stringify(cacheEntry));
      } catch (e) {
        console.warn("Failed to cache data:", e);
      }
    }
  }, [data, key]);

  // Load from cache on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data: cachedValue, timestamp } = JSON.parse(cached);

        // Check if cache is still valid
        if (Date.now() - timestamp < ttl) {
          setCachedData(cachedValue);
        } else {
          // Cache expired, remove it
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Failed to load cached data:", e);
    }
  }, [key, ttl]);

  return cachedData || data;
};
