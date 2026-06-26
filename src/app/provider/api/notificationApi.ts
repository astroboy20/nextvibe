import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface NotificationActor {
  username: string;
  avatarUrl?: string;
  displayName?: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "rsvp" | "game" | "reward" | string;
  actor: NotificationActor;
  targetType?: string;
  targetId?: string;
  isRead: boolean;
  createdAt: string;
  message?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    data: Notification[];
    meta: {
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
      unreadCount: number;
    };
  };
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications"],
  keepUnusedDataFor: 60, // notifications are more time-sensitive, 1 minute cache
  endpoints: (builder) => ({
    /** GET /v1/notifications */
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => "/v1/notifications",
      providesTags: ["Notifications"],
    }),

    /** PATCH /v1/notifications/read-all */
    markAllRead: builder.mutation<{ success: boolean; data: { updatedCount: number } }, void>({
      query: () => ({
        url: "/v1/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    /** PATCH /v1/notifications/:id/read */
    markOneRead: builder.mutation<{ success: boolean; data: { isRead: boolean } }, string>({
      query: (id) => ({
        url: `/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
} = notificationApi;
