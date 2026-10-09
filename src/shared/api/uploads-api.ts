import { baseApi } from "@/store/api/baseApi";

/** Presigned uploads, used by any feature that stores a file (event covers, ticket images). */
export const uploadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { useUploadIntentMutation } = uploadsApi;
