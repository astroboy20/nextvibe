import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface VibeTag {
  id: string;
  name: string;
  isPlatformDefault: boolean;
  imageUrl?: string | null;
  orderIndex: number;
}

export const interestsApi = createApi({
  reducerPath: "interestsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VibeTags"],
  keepUnusedDataFor: 300, // cache for 5 minutes — avoids re-fetching on every mount

  endpoints: (builder) => ({
    /**
     * GET /v1/discover/tags  — public, no auth required
     * Returns platform-default vibe tags sorted by orderIndex.
     */
    getInterestTags: builder.query<VibeTag[], void>({
      query: () => "/v1/discover/tags",
      transformResponse: (res: any) => {
        const tags: VibeTag[] = Array.isArray(res) ? res : (res?.data ?? []);
        return [...tags].sort((a, b) => a.orderIndex - b.orderIndex);
      },
      providesTags: ["VibeTags"],
    }),

    /**
     * PATCH /v1/users/me/vibes  — auth required
     * Saves the user's selected vibe tag IDs to their profile.
     */
    saveUserVibes: builder.mutation<
      { message: string } | any,
      { tagIds: string[] }
    >({
      query: (body) => ({
        url: "/v1/users/me/vibes",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["VibeTags"],
    }),

    /**
     * POST /v1/discover/tags  — auth required
     * Creates a new tag. Returns the new tag with its real id.
     * The backend may wrap the response as { data: { id, name, slug } } or
     * return the tag directly — transformResponse unwraps either shape.
     */
    createInterestTag: builder.mutation<
      { id: string; name: string; slug: string },
      { name: string }
    >({
      query: (body) => ({
        url: "/v1/discover/tags",
        method: "POST",
        body,
      }),
      // Unwrap { data: tag } or { success, data: tag } or a bare tag object
      transformResponse: (res: any) => {
        const tag = res?.data ?? res;
        return { id: tag.id, name: tag.name, slug: tag.slug ?? "" };
      },
      invalidatesTags: ["VibeTags"],
    }),

  }),
});

export const {
  useGetInterestTagsQuery,
  useSaveUserVibesMutation,
  useCreateInterestTagMutation,
} = interestsApi;
