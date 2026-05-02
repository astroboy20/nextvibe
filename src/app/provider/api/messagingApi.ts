import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getTokens } from "@/hooks/getToken";

export interface Participant {
  username: string;
  avatarUrl: string;
}

export interface LastMessage {
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: Participant;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
}

export interface StartConversationResponse {
  success: boolean;
  data: Conversation;
}

export const messagingApi = createApi({
  reducerPath: "messagingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const { accessToken } = getTokens();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
    },
  }),
  tagTypes: ["Conversations", "Messages"],
  endpoints: (build) => ({
    getConversations: build.query<ConversationsResponse, void>({
      query: () => ({ url: "/v1/conversations", method: "GET" }),
      providesTags: ["Conversations"],
    }),

    startConversation: build.mutation<StartConversationResponse, { userId: string }>({
      query: (body) => ({
        url: "/v1/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversations"],
    }),

    getMessages: build.query<MessagesResponse, { conversationId: string; page?: number; limit?: number }>({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `/v1/conversations/${conversationId}/messages`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _err, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useStartConversationMutation,
  useGetMessagesQuery,
} = messagingApi;
