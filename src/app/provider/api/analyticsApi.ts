import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// ── Analytics API ─────────────────────────────────────────────────────────────
// All endpoints are read-only consumer models per the Analytics Frontend Guide.
// Spatial/location data is never submitted here — it flows via PATCH /users/me.

export const analyticsApi = createApi({
    reducerPath: "analyticsApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Analytics"],
    keepUnusedDataFor: 120, // 2-minute cache

    endpoints: (builder) => ({
        /** GET /analytics/overview — cross-event summary for the organizer */
        getAnalyticsOverview: builder.query<any, void>({
            query: () => "/v1/analytics/overview",
            providesTags: ["Analytics"],
        }),

        /** GET /analytics/events/:id — full telemetry bundle for a single event */
        getEventAnalytics: builder.query<any, string>({
            query: (eventId) => `/v1/analytics/events/${eventId}`,
            providesTags: (_, __, id) => [{ type: "Analytics", id }],
        }),

        /** GET /analytics/events/:id/vibetags — vibe-tag engagement metrics */
        getEventVibeTagAnalytics: builder.query<any, string>({
            query: (eventId) => `/v1/analytics/events/${eventId}/vibetags`,
            providesTags: (_, __, id) => [{ type: "Analytics", id: `vibetags-${id}` }],
        }),

        /** GET /analytics/events/:id/postcards — postcard asset performance */
        getEventPostcardAnalytics: builder.query<any, string>({
            query: (eventId) => `/v1/analytics/events/${eventId}/postcards`,
            providesTags: (_, __, id) => [{ type: "Analytics", id: `postcards-${id}` }],
        }),

        /** GET /analytics/events/:id/revenue — financial revenue metrics */
        getEventRevenueAnalytics: builder.query<any, string>({
            query: (eventId) => `/v1/analytics/events/${eventId}/revenue`,
            providesTags: (_, __, id) => [{ type: "Analytics", id: `revenue-${id}` }],
        }),

        /** GET /analytics/events/:id/social — social velocity & engagement */
        getEventSocialAnalytics: builder.query<any, string>({
            query: (eventId) => `/v1/analytics/events/${eventId}/social`,
            providesTags: (_, __, id) => [{ type: "Analytics", id: `social-${id}` }],
        }),
    }),
});

export const {
    useGetAnalyticsOverviewQuery,
    useGetEventAnalyticsQuery,
    useGetEventVibeTagAnalyticsQuery,
    useGetEventPostcardAnalyticsQuery,
    useGetEventRevenueAnalyticsQuery,
    useGetEventSocialAnalyticsQuery,
} = analyticsApi;
