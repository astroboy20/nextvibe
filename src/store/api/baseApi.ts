import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

/**
 * The single RTK Query instance every endpoint file injects into.
 *
 * Why one instance rather than a slice per domain: **tags are scoped to a
 * createApi instance.** A `"Event"` tag in a separate games slice would be a
 * different tag from `"Event"` here, so cross-domain invalidation silently
 * stops firing — and the game endpoints make five such references into the
 * event domain (createGame invalidates Event and PublishPreview, for instance).
 * Splitting into separate slices would leave the event page showing stale data
 * after a game is created, with no error anywhere.
 *
 * `injectEndpoints` gives the file-level split without that cost: one reducer,
 * one cache, one tag registry, endpoints declared wherever they belong.
 *
 * Every tag type must be declared here — `injectEndpoints` cannot add new ones.
 * reducerPath stays "eventsApi" so the store wiring and cache keys are unchanged.
 */
export const baseApi = createApi({
  reducerPath: "eventsApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Events",
    "Event",
    "Gallery",
    "Messages",
    "Games",
    "PublishPreview",
    "Withdrawals",
  ],
  keepUnusedDataFor: 300, // cache for 5 minutes — avoids re-fetching on every mount/navigation
  endpoints: () => ({}),
});
