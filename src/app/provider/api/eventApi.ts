import { ICreateEvent, IGalleryItem } from "@/types/event.type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const eventsApi = createApi({
  reducerPath: "eventsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Events", "Event", "Gallery", "Messages"],

  endpoints: (builder) => ({
  

    getEvents: builder.query<any, void>({
      query: () => "/events",
      providesTags: ["Events"],
    }),

    getEventDetails: builder.query<any, string>({
      query: (eventId) => `/events/${eventId}`,
      providesTags: (_, __, id) => [{ type: "Event", id }],
    }),

    deleteEvent: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation<any, { eventId: string; data: any }>({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
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

    rsvp: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/rsvp`,
        method: "POST",
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

   

    createEvent: builder.mutation<any, ICreateEvent>({
      query: (eventData) => {
        const formData = new FormData();

        formData.append("name", eventData.name);
        formData.append("eventMode", eventData.eventMode);
        formData.append("description", eventData.description);
        formData.append("category", eventData.category);
        formData.append("startDateTime", eventData.startDateTime);
        formData.append("location", JSON.stringify(eventData.location));
        formData.append(
          "allowSponsorship",
          eventData.allowSponsorship ? "true" : "false"
        );

        formData.append("tags", JSON.stringify(eventData.tags));

        if (eventData.flier)
          formData.append("flier", eventData.flier);

        if (eventData.promotionalVideo)
          formData.append("promotionalVideo", eventData.promotionalVideo);

        if (eventData.backdrop)
          formData.append("backdrop", eventData.backdrop);

        formData.append(
          "gamification",
          JSON.stringify(eventData.activities ?? [])
        );

        return {
          url: "/events",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Events"],
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
  }),
});

export const {
  useGetEventsQuery,
  useGetEventDetailsQuery,
  useDeleteEventMutation,
  useUpdateEventMutation,
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
} = eventsApi;