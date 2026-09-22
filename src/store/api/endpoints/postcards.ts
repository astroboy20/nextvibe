import { baseApi } from "../baseApi";
import { phaseToTiming, type PostcardPhase } from "@/types/postcards.type";

/**
 * Postcard endpoints — the gallery, creation and swapping, likes, comments,
 * views, and the postcard leaderboard.
 *
 * Injected into `baseApi` for the same reason as the game endpoints: RTK Query
 * tags belong to one createApi instance, and these use the shared "Gallery"
 * and "Event" tags. A separate slice would make those different tags, so
 * creating a postcard would stop refreshing the gallery.
 */
export const postcardEndpoints = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Takes the UI's phase slug ("pre-event", "all", …) and converts it to the
     * wire value here, so this is the single place the two vocabularies meet.
     * Callers pass what their tabs hold and never think about the enum; "all"
     * simply omits the param.
     */
    getEventPostcards: builder.query<
      any,
      {
        eventId: string;
        phase?: PostcardPhase;
        userId?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ eventId, phase, userId, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        const timing = phaseToTiming(phase);
        if (timing) params.set("timing", timing);
        if (userId) params.set("userId", userId);
        return `/v1/events/${eventId}/postcards?${params.toString()}`;
      },
      providesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    createPostcard: builder.mutation<
      any,
      { eventId: string; image: string; caption?: string; vibeTagId?: string }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/v1/events/${eventId}/postcards`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Gallery", id: eventId },
      ],
    }),

    // Step 2: create postcards with the returned fileKeys
    createPostcards: builder.mutation<
      any,
      {
        eventId: string;
        caption?: string;
        vibeTagId?: string;
        media: { fileKey: string; mediaType: string; mediaUrl?: string }[];
      }
    >({
      query: ({ eventId, vibeTagId, media, caption }) => ({
        url: "/v1/postcards",
        method: "POST",
        body: { eventId, vibeTagId, media, caption },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Gallery", id: eventId },
      ],
    }),

    /** POST /v1/postcards/:id/view — fire-and-forget view tracking */
    trackPostcardView: builder.mutation<
      void,
      { postcardId: string; sessionId?: string | null }
    >({
      query: ({ postcardId, sessionId }) => ({
        url: `/v1/postcards/${postcardId}/view`,
        method: "POST",
        body: { sessionId: sessionId ?? null },
      }),
    }),

    /** POST /v1/postcards/:id/like — toggle like, returns { liked, currentLikes } */
    toggleLikePostcard: builder.mutation<
      { liked: boolean; currentLikes: number },
      { eventId: string; postcardId: string }
    >({
      query: ({ postcardId }) => ({
        url: `/v1/postcards/${postcardId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { eventId, postcardId }) => [
        { type: "Gallery", id: eventId },
        { type: "Gallery", id: `postcard-${postcardId}` },
      ],
    }),

    /** POST /v1/postcards/:id/comment — add comment, returns comment with author */
    commentOnPostcard: builder.mutation<
      {
        id: string;
        content: string;
        createdAt: string;
        author: {
          displayName?: string;
          username?: string;
          avatarUrl?: string | null;
        };
      },
      { postcardId: string; content: string }
    >({
      query: ({ postcardId, content }) => ({
        url: `/v1/postcards/${postcardId}/comment`,
        method: "POST",
        body: { content },
      }),
    }),

    /** GET /v1/postcards/:id/likes — list of likes */
    getPostcardLikes: builder.query<any, string>({
      query: (postcardId) => `/v1/postcards/${postcardId}/likes`,
      providesTags: (_, __, id) => [{ type: "Gallery", id: `likes-${id}` }],
    }),

    /** GET /v1/postcards/:id/comments — list of comments */
    getPostcardComments: builder.query<any, string>({
      query: (postcardId) => `/v1/postcards/${postcardId}/comments`,
      providesTags: (_, __, id) => [{ type: "Gallery", id: `comments-${id}` }],
    }),

    /** GET /v1/postcards/:id — single postcard with likeCount */
    getPostcard: builder.query<any, string>({
      query: (postcardId) => `/v1/postcards/${postcardId}`,
      providesTags: (_, __, id) => [{ type: "Gallery", id: `postcard-${id}` }],
    }),

    /** GET /v1/postcards/event/:eventId/leaderboard — postcard leaderboard, optional ?activityTiming= */
    /**
     * The param is `timing`, not `activityTiming` — that mismatch is why the
     * leaderboard's phase tabs silently returned the backend's default phase
     * regardless of which tab was active.
     */
    getPostcardLeaderboard: builder.query<
      any,
      { eventId: string; phase?: PostcardPhase }
    >({
      query: ({ eventId, phase }) => {
        const timing = phaseToTiming(phase);
        const qs = timing ? `?timing=${timing}` : "";
        return `/v1/postcards/event/${eventId}/leaderboard${qs}`;
      },
      providesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    // Global postcards feed — /v1/postcards (optionally filtered by eventId or userId)
    getPostcards: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        eventId?: string;
        userId?: string;
      } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.page) p.set("page", String(params.page));
        if (params?.limit) p.set("limit", String(params.limit));
        if (params?.eventId) p.set("eventId", params.eventId);
        if (params?.userId) p.set("userId", params.userId);
        const qs = p.toString();
        return `/v1/postcards${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Gallery"],
    }),

    /** GET /v1/postcards/:eventId — total memories (postcards) for an event */
    getEventMemoriesCount: builder.query<any, string>({
      query: (eventId) => `/v1/postcards/${eventId}`,
      providesTags: (_, __, eventId) => [
        { type: "Gallery", id: `memories-${eventId}` },
      ],
    }),
    /**
     * POST /v1/postcards/:id/swap
     * Replace an existing postcard with new media (used when the 20-media cap is hit).
     * :id is the postcard being REPLACED (not the event).
     * Body is identical to createPostcards.
     * Response is the newly created postcard with a brand-new id.
     */
    swapPostcard: builder.mutation<
      any,
      {
        postcardId: string;
        eventId: string;
        vibeTagId?: string;
        caption?: string;
        media: { fileKey: string; mediaType: string; mediaUrl?: string }[];
      }
    >({
      query: ({ postcardId, eventId, vibeTagId, caption, media }) => ({
        url: `/v1/postcards/${postcardId}/swap`,
        method: "POST",
        body: { eventId, vibeTagId, caption, media },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Gallery", id: eventId },
      ],
    }),
  }),
});

export const {
  useGetEventPostcardsQuery,
  useCreatePostcardMutation,
  useToggleLikePostcardMutation,
  useCommentOnPostcardMutation,
  useGetPostcardQuery,
  useGetPostcardLikesQuery,
  useGetPostcardCommentsQuery,
  useGetPostcardLeaderboardQuery,
  useGetPostcardsQuery,
  useCreatePostcardsMutation,
  useGetEventMemoriesCountQuery,
  useTrackPostcardViewMutation,
  useSwapPostcardMutation,
} = postcardEndpoints;
