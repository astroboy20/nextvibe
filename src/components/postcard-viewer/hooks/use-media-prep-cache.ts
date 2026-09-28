"use client";

import { useCallback, useRef } from "react";
import type { PostcardMediaItem } from "../types";
import {
  fetchAndBuildFile,
  type PreparedEntry,
} from "../media-prep";

const MAX_PREPARED_ITEMS = 4;

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

      const key = media.mediaUrl;
      const cache = preparedMediaRef.current;
      const existing = cache.get(key);

      if (
        existing &&
        (existing.status === "ready" || existing.status === "loading")
      ) {
        return;
      }

      const isVideo = media.mediaType === "VIDEO";
      const promise = fetchAndBuildFile(key, isVideo).then((file) => {
        cache.set(key, file ? { status: "ready", file } : { status: "error" });
        trimCache(cache);
        return file;
      });

      cache.set(key, { status: "loading", promise });
      trimCache(cache);
    },
    [trimCache]
  );

  const getOrFetchFile = useCallback(
    async (media: PostcardMediaItem): Promise<File | null> => {
      if (!media.mediaUrl) return null;

      const key = media.mediaUrl;
      const cache = preparedMediaRef.current;
      const existing = cache.get(key);

      if (existing?.status === "ready" && existing.file) {
        return existing.file;
      }

      if (existing?.status === "loading" && existing.promise) {
        return existing.promise;
      }

      const isVideo = media.mediaType === "VIDEO";
      const promise = fetchAndBuildFile(key, isVideo);
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
