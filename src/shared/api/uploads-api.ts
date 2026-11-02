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

/**
 * Step B of the presigned flow: PUT the file straight to storage. XHR rather
 * than fetch because fetch can't report upload progress.
 */
export function uploadFileToCDN(
  file: File,
  uploadUrl: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded * 100) / e.total));
      };
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}
