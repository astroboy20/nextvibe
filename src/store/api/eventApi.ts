import { baseApi } from "./baseApi";
import { IGalleryItem } from "@/types/event.type";
import {
  phaseToTiming,
  type PostcardPhase,
} from "@/types/postcards.type";

// ── Withdrawal types ──────────────────────────────────────────────────────────
/**
 * @deprecated Superseded by the payout system in `./payoutApi`.
 *
 * The old flow recomputed payout as the gross sum of an event's completed
 * purchases on every request, never subtracting what had already been paid — so
 * the same revenue could be requested repeatedly. It also had no admin path to
 * approve or mark a request paid, and typed bank details in per request with no
 * support for non-Nigerian accounts.
 *
 * Use `useGetBalancesQuery` / `useRequestPayoutMutation` from `./payoutApi`.
 * Nothing references these any more; they remain only until the backend's
 * `withdrawals` table is confirmed empty and dropped.
 */
export interface WithdrawalRecord {
  id: string;
  eventId: string;
  organizerId: string;
  amount: string;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedAt: string;
  processedAt: string | null;
  notes: string | null;
}

export const eventsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
    getEvents: builder.query<
      any,
      { page?: number; limit?: number; isPublic?: boolean } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.page) p.set("page", String(params.page));
        if (params?.limit) p.set("limit", String(params.limit));
        if (params?.isPublic !== undefined)
          p.set("isPublic", String(params.isPublic));
        const qs = p.toString();
        return `/v1/events${qs ? `?${qs}` : ""}`;
      },
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
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    updateTicket: builder.mutation<
      any,
      { eventId: string; ticketData: any; ticketId: string }
    >({
      query: ({ eventId, ticketData, ticketId }) => ({
        url: `/v1/events/${eventId}/tickets/${ticketId}`,
        method: "PATCH",
        body: ticketData,
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    deleteTicket: builder.mutation<any, { eventId: string; ticketId: any }>({
      query: ({ eventId, ticketId }) => ({
        url: `/v1/events/${eventId}/tickets/${ticketId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    getTickets: builder.query<any, string>({
      query: (eventId) => `/v1/events/${eventId}/tickets`,
      providesTags: (_, __, id) => [{ type: "Event", id }],
    }),

    //event api

    // Step A of presigned upload flow: get a short-lived upload URL + final CDN URL
    uploadIntent: builder.mutation<
      { success: boolean; data: { uploadUrl: string; fileUrl: string } },
      { filename: string; contentType: string; folder: string }
    >({
      query: (body) => ({
        url: "/v1/events/upload-intent",
        method: "POST",
        body,
      }),
    }),

    createEvent: builder.mutation<any, Record<string, any>>({
      query: (eventData) => ({
        url: "/v1/events",
        method: "POST",
        body: eventData, // plain JSON — files were already streamed to MinIO
      }),
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
          Object.entries(data).filter(
            ([_, value]) => value !== null && value !== undefined,
          ),
        );

        return {
          url: `/v1/events/${eventId}`,
          method: "PATCH",
          body: filteredData,
        };
      },
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
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

    rsvp: builder.mutation<
      any,
      {
        eventId: string;
        status: "CONFIRMED" | "WAITLIST" | "CANCELLED";
        ticketTierId?: string;
      }
    >({
      query: ({ eventId, status, ticketTierId }) => ({
        url: `/v1/events/${eventId}/rsvp`,
        method: "POST",
        body: { status, ...(ticketTierId ? { ticketTierId } : {}) },
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    getMyCreatedEvents: builder.query<
      {
        success: boolean;
        /**
         * Double-nested, and deliberately typed that way. The handler returns
         * `{ data, meta }` for pagination and the global ResponseInterceptor
         * wraps *that* in `{ success, data }` — so the array lives at
         * `response.data.data`. Reading `response.data` gives the envelope, not
         * a list, and `.length` on it is silently `undefined`.
         */
        data: {
          data: { id: string; name: string }[];
          meta: {
            total: number;
            page: number;
            limit: number;
            hasNext: boolean;
          };
        };
      },
      void
    >({
      // A high limit because this feeds an event picker, not a paged list —
      // the default page size would hide events past the first page.
      query: () => "/v1/events/me/created?limit=100",
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

    /** POST /v1/events/checkin  { qrCode: event.qrCode } */
    checkinEvent: builder.mutation<any, { qrCode: string; eventId: string }>({
      query: ({ qrCode }) => ({
        url: `/v1/events/checkin`,
        method: "POST",
        body: { qrCode },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
        { type: "Event", id: `game-status-${eventId}` },
      ],
    }),

    /** GET /v1/events/:eventId/attendees */
    getEventAttendees: builder.query<
      any,
      { eventId: string; page?: number; limit?: number }
    >({
      query: ({ eventId, page = 1, limit = 20 }) =>
        `/v1/events/${eventId}/attendees?page=${page}&limit=${limit}`,
      providesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
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
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Gallery", id: `vibetags-${eventId}` },
        { type: "PublishPreview", id: eventId },
      ],
    }),
    getVibeTags: builder.query<
      any,
      { eventId: string; activityTiming?: string }
    >({
      query: ({ eventId }) => `/v1/vibe-tags?eventId=${eventId}`,
      providesTags: (_, __, { eventId }) => [
        { type: "Gallery", id: `vibetags-${eventId}` },
      ],
    }),

    /** POST /v1/events/:id/tags/add — add vibe tags to an event (organizer only, locked once started) */
    addEventTags: builder.mutation<any, { eventId: string; tagIds: string[] }>({
      query: ({ eventId, tagIds }) => ({
        url: `/v1/events/${eventId}/tags/add`,
        method: "POST",
        body: { tagIds },
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    /** POST /v1/events/:id/tags/remove — remove vibe tags from an event (organizer only, locked once started) */
    removeEventTags: builder.mutation<
      any,
      { eventId: string; tagIds: string[] }
    >({
      query: ({ eventId, tagIds }) => ({
        url: `/v1/events/${eventId}/tags/remove`,
        method: "POST",
        body: { tagIds },
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    // ── Publish Preview ───────────────────────────────────────────────────────
    /**
     * GET /v1/organizer-payments/publish-preview/:eventId
     * Returns valid plan options + prices before publishing.
     * Invalidated automatically when games or vibetags are created.
     */
    getPublishPreview: builder.query<any, string>({
      query: (eventId) => `/v1/organizer-payments/publish-preview/${eventId}`,
      providesTags: (_, __, eventId) => [
        { type: "PublishPreview", id: eventId },
      ],
    }),

    /**
     * @deprecated Use `useRequestPayoutMutation` from `./payoutApi` instead.
     *
     * POST /v1/events/:eventId/withdrawals
     */
    requestWithdrawal: builder.mutation<
      { data: WithdrawalRecord },
      {
        eventId: string;
        bankName: string;
        accountNumber: string;
        accountName: string;
      }
    >({
      query: ({ eventId, bankName, accountNumber, accountName }) => ({
        url: `/v1/events/${eventId}/withdrawals`,
        method: "POST",
        body: { bankName, accountNumber, accountName },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Withdrawals", id: eventId },
      ],
    }),

    /**
     * @deprecated Use `useGetMyPayoutsQuery` from `./payoutApi` instead.
     *
     * GET /v1/events/:eventId/withdrawals
     */
    getWithdrawals: builder.query<{ data: WithdrawalRecord[] }, string>({
      query: (eventId) => `/v1/events/${eventId}/withdrawals`,
      providesTags: (_, __, eventId) => [{ type: "Withdrawals", id: eventId }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetMyCreatedEventsQuery,
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
  useUploadGalleryMediaMutation,
  useGetUserGalleryMediaQuery,
  useGetPromotedGalleryItemsQuery,
  useSendCustomInviteMutation,
  useGetEventMessagesQuery,
  useDeleteScheduledMessageMutation,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useGetTicketsQuery,
  useCheckinEventMutation,
  useCreateVibeTagMutation,
  useGetVibeTagsQuery,
  useGetEventAttendeesQuery,
  useGetPublishPreviewQuery,
  useUploadIntentMutation,
  useAddEventTagsMutation,
  useRemoveEventTagsMutation,
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
} = eventsApi;
