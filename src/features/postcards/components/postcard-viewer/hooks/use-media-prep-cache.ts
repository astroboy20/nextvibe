"use client";

import { useCallback, useRef } from "react";
import type { PostcardMediaItem } from "@/features/postcards/components/postcard-viewer/types";
import {
  fetchAndBuildFile,
  type PreparedEntry,
} from "@/features/postcards/components/postcard-viewer/media-prep";

const MAX_PREPARED_ITEMS = 4;

/**
 * Derive the overlay URL from a media item.
 * "true" is a legacy sentinel stored by old posts — not a usable URL, ignore it.
 */
function overlayFrom(media: PostcardMediaItem): string | null {
  const v = media.vibeTagOverlayUrl;
  if (!v || v === "true") return null;
  if (media.mediaType?.toUpperCase() !== "VIDEO") return null;
  return v;
}

function cacheKey(mediaUrl: string, overlay: string | null): string {
  return overlay ? `${mediaUrl}||${overlay}` : mediaUrl;
}

export function useMediaPrepCache() {
  const preparedMediaRef = useRef<Map<string, PreparedEntry>>(new Map());

  const trimCache = useCallback((cache: Map<string, PreparedEntry>) => {
    while (cache.size > MAX_PREPARED_ITEMS) {
      const oldestKey = cache.keys().next().value as string | undefined;
      if (!oldestKey) break;
      cache.delete(oldestKey);
    }
  }, []);

  const prepareMedia = useCallback(
    (media?: PostcardMediaItem) => {
      if (!media?.mediaUrl) return;

      const isVideo = media.mediaType?.toUpperCase() === "VIDEO";
      const overlay = overlayFrom(media);
      const key = cacheKey(media.mediaUrl, overlay);
      const cache = preparedMediaRef.current;

      if (cache.has(key)) return; // already loading or ready

      const promise = fetchAndBuildFile(media.mediaUrl, isVideo, overlay).then(
        (file) => {
          cache.set(key, file ? { status: "ready", file } : { status: "error" });
          trimCache(cache);
          return file;
        }
      );

      cache.set(key, { status: "loading", promise });
      trimCache(cache);
    },
    [trimCache]
  );

  /**
   * Returns a File for the given media item.
   * Uses whatever vibeTagOverlayUrl is on the passed object — callers are
   * responsible for resolving "true" to the real URL before calling this.
   */
  const getOrFetchFile = useCallback(
    async (media: PostcardMediaItem): Promise<File | null> => {
      if (!media.mediaUrl) return null;

      const isVideo = media.mediaType?.toUpperCase() === "VIDEO";
      const overlay = overlayFrom(media); // respects already-resolved URL on media
      const key = cacheKey(media.mediaUrl, overlay);
      const cache = preparedMediaRef.current;
      const existing = cache.get(key);

      if (existing?.status === "ready" && existing.file) return existing.file;
      if (existing?.status === "loading" && existing.promise) return existing.promise;

      const promise = fetchAndBuildFile(media.mediaUrl, isVideo, overlay);
      cache.set(key, { status: "loading", promise });

      const file = await promise;
      cache.set(key, file ? { status: "ready", file } : { status: "error" });
      trimCache(cache);
      return file;
    },
    [trimCache]
  );

  return { preparedMediaRef, prepareMedia, getOrFetchFile };
}
