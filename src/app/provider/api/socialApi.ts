import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getTokens } from "@/hooks/getToken";

export interface PostcardUser {
  id: string;
  name: string;
  avatar: string;
  username?: string;
}

export interface PostcardGalleryItem {
  url: string;
  type: string;
  _id: string;
}

export interface PostcardItem {
  _id: string;
  post_id?: string;
  createdAt: string;
  updatedAt: string;
  event_id?: string;
  eventId?: string;
  event?: { id: string; name: string };
  gallery_items?: PostcardGalleryItem[];
  media?: PostcardGalleryItem[];
  user: PostcardUser;
  caption?: string;
  vibeTag?: { name: string };
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  tags?: string[];
}

export interface PostcardsMeta {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface PostcardsResponse {
  success: boolean;
  data: {
    data: PostcardItem[];
    meta: PostcardsMeta;
  };
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: PostcardUser;
  parentId?: string | null;
  repliesCount?: number;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
}

export interface SuggestedUser {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  bio?: string;
  eventsAttended?: number;
  postcardsCount?: number;
  isFollowing?: boolean;
  mutualEventsCount?: number;
}

export interface SuggestedUsersResponse {
  success: boolean;
  data: SuggestedUser[];
}

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const { accessToken } = getTokens();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
    },
  }),
  tagTypes: ["Postcards", "Comments", "People"],
  endpoints: (build) => ({
    // ── Feed ──────────────────────────────────────────────────────────────────
    getPostcardsFeed: build.query<PostcardsResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.page) p.set("page", String(params.page));
        if (params?.limit) p.set("limit", String(params.limit ?? 20));
        const qs = p.toString();
        return `/v1/postcards${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Postcards"],
    }),

    // ── Likes ─────────────────────────────────────────────────────────────────
    likeTarget: build.mutation<any, { targetType: "postcard" | "event"; targetId: string }>({
      query: (body) => ({
        url: "/v1/likes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Postcards"],
    }),

    unlikeTarget: build.mutation<any, { targetType: "postcard" | "event"; targetId: string }>({
      query: (body) => ({
        url: "/v1/likes",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Postcards"],
    }),

    // ── Comments ──────────────────────────────────────────────────────────────
    getComments: build.query<CommentsResponse, { targetType: "postcard" | "event"; targetId: string; page?: number; limit?: number }>({
      query: ({ targetType, targetId, page = 1, limit = 20 }) => ({
        url: `/v1/comments?targetType=${targetType}&targetId=${targetId}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (_r, _e, { targetId }) => [{ type: "Comments", id: targetId }],
    }),

    postComment: build.mutation<any, { targetType: "postcard" | "event"; targetId: string; body: string; parentId?: string | null }>({
      query: ({ targetType, targetId, body, parentId = null }) => ({
        url: "/v1/comments",
        method: "POST",
        body: { targetType, targetId, body, parentId },
      }),
      invalidatesTags: (_r, _e, { targetId }) => [{ type: "Comments", id: targetId }],
    }),

    deleteComment: build.mutation<any, string>({
      query: (commentId) => ({
        url: `/v1/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments"],
    }),

    getCommentReplies: build.query<CommentsResponse, string>({
      query: (commentId) => `/v1/comments/${commentId}/replies`,
      providesTags: (_r, _e, commentId) => [{ type: "Comments", id: commentId }],
    }),

    // ── Shares ────────────────────────────────────────────────────────────────
    recordShare: build.mutation<any, { targetType: "postcard" | "event"; targetId: string; platform: string }>({
      query: (body) => ({
        url: "/v1/shares",
        method: "POST",
        body,
      }),
    }),

    // ── People ────────────────────────────────────────────────────────────────
    getSuggestedUsers: build.query<SuggestedUsersResponse, void>({
      query: () => "/v1/users/suggested",
      providesTags: ["People"],
    }),

    followUser: build.mutation<any, string>({
      query: (userId) => ({
        url: `/v1/users/${userId}/follow`,
        method: "POST",
      }),
      invalidatesTags: ["People"],
    }),

    unfollowUser: build.mutation<any, string>({
      query: (userId) => ({
        url: `/v1/users/${userId}/unfollow`,
        method: "POST",
      }),
      invalidatesTags: ["People"],
    }),
  }),
});

export const {
  useGetPostcardsFeedQuery,
  useLikeTargetMutation,
  useUnlikeTargetMutation,
  useGetCommentsQuery,
  usePostCommentMutation,
  useDeleteCommentMutation,
  useGetCommentRepliesQuery,
  useRecordShareMutation,
  useGetSuggestedUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = socialApi;
