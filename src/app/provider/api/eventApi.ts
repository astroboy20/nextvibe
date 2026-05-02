
import { IGalleryItem } from "@/types/event.type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const eventsApi = createApi({
  reducerPath: "eventsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const accessToken = Cookies.get("accessToken")

      if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
      return headers;
    },
  }),

  tagTypes: ["Events", "Event", "Gallery", "Messages", "Games"],

  endpoints: (builder) => ({


    getEvents: builder.query<any, void>({
      query: () => "/v1/events",
      providesTags: ["Events"],
    }),

    getEventDetails: builder.query<any, string>({
      query: (eventId) => `/v1/events/${eventId}`,
      providesTags: (_, __, id) => [{ type: "Event", id }],
    }),

    //ticket api
    createTicket: builder.mutation<any, { eventId: string; ticketData: any }>({
      query: ({ eventId, ticketData }) => ({
        url: `/v1/events/${eventId}/tickets`,
        method: "POST",
        body: ticketData,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
      ],
    }),
    updateTicket: builder.mutation<any, { eventId: string; ticketData: any; ticketId: string }>({
      query: ({ eventId, ticketData, ticketId }) => ({
        url: `/v1/events/${eventId}/tickets/${ticketId}`,
        method: "PATCH",
        body: ticketData,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
      ],
    }),
    deleteTicket: builder.mutation<any, { eventId: string; ticketId: any }>({
      query: ({ eventId, ticketId }) => ({
        url: `/v1/events/${eventId}/tickets/${ticketId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
      ],
    }),
    getTickets: builder.query<any, string>({
      query: (eventId) => `/v1/events/${eventId}/tickets`,
      providesTags: (_, __, id) => [{ type: "Event", id }],
    }),

    //event api
    createEvent: builder.mutation({
      query: (eventData) => {
        const formData = new FormData();

        Object.entries(eventData).forEach(([key, value]) => {
          if (value === undefined || value === null) return;

          // File handling
          if (value instanceof File) {
            formData.append(key, value);
          }
          // Objects (location, tags, etc.)
          else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          }
          // Primitives
          else {
            formData.append(key, String(value));
          }
        });

        return {
          url: "/v1/events",
          method: "POST",
          // headers: { "Content-Type": "multipart/form-data" },
          body: formData,
        };
      },
      invalidatesTags: ["Events"],
    }),

    deleteEvent: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/v1/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation<any, { eventId: string; data: any }>({
      query: ({ eventId, data }) => {
        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value !== null && value !== undefined)
        );

        return {
          url: `/v1/events/${eventId}`,
          method: "PATCH",
          body: filteredData,
        };
      },
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
      ],
    }),

    /** PATCH /v1/events/:id/status — DRAFT→PUBLISHED, PUBLISHED→CANCELLED or PUBLISHED→ENDED */
    updateEventStatus: builder.mutation<
      any,
      { eventId: string; status: "PUBLISHED" | "CANCELLED" | "ENDED" }
    >({
      query: ({ eventId, status }) => ({
        url: `/v1/events/${eventId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
        "Events",
      ],
    }),



    updateMedia: builder.mutation<
      any,
      {
        eventId: string;
        flier: File;
        promotionalVideo: File;
        backdrop?: File;
      }
    >({
      query: ({ eventId, flier, promotionalVideo, backdrop }) => {
        const formData = new FormData();
        formData.append("flier", flier);
        formData.append("promotionalVideo", promotionalVideo);
        if (backdrop) formData.append("backdrop", backdrop);

        return {
          url: `/events/${eventId}/media`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Event"],
    }),


    toggleLikeEvent: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Event"],
    }),

    toggleBookmarkEvent: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/bookmark`,
        method: "POST",
      }),
    }),

    shareEvent: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/share`,
        method: "POST",
      }),
    }),

    checkin: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/checkin`,
        method: "POST",
      }),
    }),

    rsvp: builder.mutation<any, any>({
      query: ({ eventId, ticketTierId }: { eventId: string; ticketTierId: any }) => ({
        url: `/v1/events/${eventId}/rsvp`,
        method: "POST",
        body: { ticketTierId: ticketTierId },
      }),
    }),



    getUpcomingEvents: builder.query<any, void>({
      query: () => "/events/explore/upcoming",
    }),

    getLiveEvents: builder.query<any, void>({
      query: () => "/events/explore/live",
    }),

    getPromotedEvents: builder.query<any, void>({
      query: () => "/events/explore/promoted",
    }),

    explore: builder.query<any, void>({
      query: () => "/events/explore",
    }),

    recommendedEvents: builder.query<any, void>({
      query: () => "/events/for-you",
    }),

    getUserEvents: builder.query<any, void>({
      query: () => "/events/user",
    }),







    uploadGalleryMedia: builder.mutation<
      any,
      { eventId: string; media: File | Blob }
    >({
      query: ({ eventId, media }) => {
        const formData = new FormData();
        formData.append("media", media);
        formData.append("type", "image");
        formData.append("tags", `"event","gallery"`);

        return {
          url: `/events/${eventId}/gallery`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Gallery"],
    }),

    getUserGalleryMedia: builder.query<any, string>({
      query: (eventId) => `/events/${eventId}/gallery`,
      providesTags: ["Gallery"],
    }),

    getPromotedGalleryItems: builder.query<
      { message: string; data: IGalleryItem[]; status: string },
      void
    >({
      query: () => "/events/gallery/promoted",
    }),


    sendCustomInvite: builder.mutation<
      any,
      {
        eventId: string;
        subject: string;
        message: string;
        recipientFilter?: string;
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/messages/invite`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Messages"],
    }),

    getEventMessages: builder.query<any, string>({
      query: (eventId) => `/events/${eventId}/messages`,
      providesTags: ["Messages"],
    }),

    deleteScheduledMessage: builder.mutation<
      any,
      { eventId: string; messageId: string }
    >({
      query: ({ eventId, messageId }) => ({
        url: `/events/${eventId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Messages"],
    }),


    playGame: builder.mutation<
      any,
      {
        eventId: string;
        gameData: { timeSpent: number; score: number };
        gameType: "word-puzzle" | "trivia";
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/games/play`,
        method: "POST",
        body,
      }),
    }),

    //Games
    createGame: builder.mutation<any, any>({
      query: ({ body, eventId }: { body: any, eventId: string }) => ({
        url: `/v1/events/${eventId}/game-sessions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Games"]
    }),

    updateGameStatus: builder.mutation<
      any,
      { roundId: string; status: "ACTIVE" | "ENDED" }
    >({
      query: ({ roundId, status }) => ({
        url: `/v1/game-sessions/${roundId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Games"],
    }),

    updateRoundStatus: builder.mutation<
      any,
      { roundId: string; status: "ACTIVE" | "ENDED" }
    >({
      query: ({ roundId, status }) => ({
        url: `/v1/game-rounds/${roundId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Games"],
    }),

    getGames: builder.query<any, string>({
      query: (eventId) => ({
        url: `/v1/events/${eventId}/game-sessions`,
      }),
      providesTags: ["Games"]
    }),

    /** POST /v1/game-sessions/:sessionId/join */
    joinGameSession: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/v1/game-sessions/${sessionId}/join`,
        method: "POST",
      }),
      invalidatesTags: ["Games"],
    }),

    /** POST /v1/game-rounds/:roundId/submit */
    submitRoundAnswers: builder.mutation<
      any,
      { roundId: string; answers: (number | string)[]; timeTakenMs?: number }
    >({
      query: ({ roundId, answers, timeTakenMs }) => ({
        url: `/v1/game-rounds/${roundId}/submit`,
        method: "POST",
        body: {
          answers,
          metadata: { timeTakenMs: timeTakenMs ?? 0 },
        },
      }),
    }),

    /** GET /v1/game-sessions/:sessionId/leaderboard */
    getSessionLeaderboard: builder.query<any, string>({
      query: (sessionId) => `/v1/game-sessions/${sessionId}/leaderboard`,
      providesTags: ["Games"],
    }),

    /** POST /v1/events/checkin  { qrCode: event.qrCode } */
    checkinEvent: builder.mutation<any, { qrCode: string; eventId: string }>({
      query: ({ qrCode }) => ({
        url: `/v1/events/checkin`,
        method: "POST",
        body: { qrCode },
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    createVibeTag: builder.mutation({
      query: ({ eventId, name, imageKey, activityTiming }) => {
        const formData = new FormData();
        formData.append("eventId", eventId as string);
        formData.append("name", name);
        formData.append("imageKey", imageKey);
        formData.append("activityTiming", activityTiming);
        return {
          url: "/v1/vibe-tags",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    getVibeTags: builder.query<any, { eventId: string; activityTiming?: string }>({
      query: ({ eventId }) => `/v1/vibe-tags?eventId=${eventId}`,
      providesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    getEventPostcards: builder.query<any, { eventId: string; phase?: string; page?: number; limit?: number }>({
      query: ({ eventId, phase, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (phase && phase !== "all") params.set("phase", phase);
        return `/v1/events/${eventId}/postcards?${params.toString()}`;
      },
      providesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    createPostcard: builder.mutation<any, { eventId: string; image: string; caption?: string; vibeTagId?: string }>({
      query: ({ eventId, ...body }) => ({
        url: `/v1/events/${eventId}/postcards`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    // Step 1: upload raw files, get back fileKeys
    uploadMultipleFiles: builder.mutation<
      { success: boolean; data: { url: string; fileKey: string; mediaType: string }[] },
      FormData
    >({
      query: (formData) => ({
        url: "/v1/storage/upload-multiple",
        method: "POST",
        body: formData,
      }),
    }),

    // Step 2: create postcards with the returned fileKeys
    createPostcards: builder.mutation<
      any,
      { eventId: string; vibeTagId?: string; media: { fileKey: string; mediaType: string }[] }
    >({
      query: ({ eventId, vibeTagId, media }) => ({
        url: "/v1/postcards",
        method: "POST",
        body: { eventId, vibeTagId, media },
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    toggleLikePostcard: builder.mutation<any, { eventId: string; postcardId: string }>({
      query: ({ eventId, postcardId }) => ({
        url: `/v1/events/${eventId}/postcards/${postcardId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    getPostcardLeaderboard: builder.query<any, { eventId: string; phase?: "pre-event" | "main-event" }>({
      query: ({ eventId, phase }) => {
        const params = phase ? `?phase=${phase}` : "";
        return `/v1/events/${eventId}/postcards/leaderboard${params}`;
      },
      providesTags: (_, __, { eventId }) => [{ type: "Gallery", id: eventId }],
    }),

    // Global postcards feed — /v1/postcards (optionally filtered by eventId or userId)
    getPostcards: builder.query<any, { page?: number; limit?: number; eventId?: string; userId?: string } | void>({
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

  }),
});

export const {
  useGetEventsQuery,
  useGetEventDetailsQuery,
  useDeleteEventMutation,
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
  useCreateEventMutation,
  useToggleLikeEventMutation,
  useToggleBookmarkEventMutation,
  useShareEventMutation,
  useCheckinMutation,
  useRsvpMutation,
  useGetUpcomingEventsQuery,
  useGetLiveEventsQuery,
  useGetPromotedEventsQuery,
  useExploreQuery,
  useRecommendedEventsQuery,
  useGetUserEventsQuery,
  useUploadGalleryMediaMutation,
  useGetUserGalleryMediaQuery,
  useGetPromotedGalleryItemsQuery,
  useSendCustomInviteMutation,
  useGetEventMessagesQuery,
  useDeleteScheduledMessageMutation,
  usePlayGameMutation,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useGetTicketsQuery,
  useCreateGameMutation,
  useGetGamesQuery,
  useUpdateGameStatusMutation,
  useUpdateRoundStatusMutation,
  useJoinGameSessionMutation,
  useSubmitRoundAnswersMutation,
  useGetSessionLeaderboardQuery,
  useCheckinEventMutation,
  useCreateVibeTagMutation,
  useGetVibeTagsQuery,
  useGetEventPostcardsQuery,
  useCreatePostcardMutation,
  useToggleLikePostcardMutation,
  useGetPostcardLeaderboardQuery,
  useGetPostcardsQuery,
  useUploadMultipleFilesMutation,
  useCreatePostcardsMutation,
} = eventsApi;