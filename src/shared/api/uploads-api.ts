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

    /**
     * Step A (postcard variant) — same presigned flow but routed through the
     * postcards upload-intent endpoint.
     *
     * Returns { uploadUrl, fileUrl } where:
     *   uploadUrl — PUT your bytes here (goes straight to storage)
     *   fileUrl   — public CDN URL; extract the storage key from the path
     *               e.g. "https://…/nextvibe/postcards/1234-photo.jpg"
     *               → key is "postcards/1234-photo.jpg"
     */
    postcardUploadIntent: builder.mutation<
      { success: boolean; data: { uploadUrl: string; fileUrl: string } },
      { filename: string; contentType: string }
    >({
      query: (body) => ({
        url: "/v1/postcards/upload-intent",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useUploadIntentMutation, usePostcardUploadIntentMutation } = uploadsApi;

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

/**
 * Same as uploadFileToCDN but accepts a raw Blob (e.g. recorded video chunks)
 * plus an explicit contentType — the presigned PUT requires the exact
 * Content-Type header that was used when requesting the upload URL.
 */
export function uploadBlobToCDN(
  blob: Blob,
  contentType: string,
  uploadUrl: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
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
    xhr.send(blob);
  });
}

/**
 * Extract the storage key from a full CDN fileUrl.
 *
 * e.g. "https://…/nextvibe/postcards/1234-photo.jpg"
 *       → "postcards/1234-photo.jpg"
 *
 * The storage bucket root ("nextvibe/") is stripped; only the path after it
 * is sent to the postcard endpoint as fileKey / thumbnailKey.
 */
export function fileUrlToStorageKey(fileUrl: string): string {
  try {
    const url = new URL(fileUrl);
    // pathname looks like "/nextvibe/postcards/1234-photo.jpg"
    // strip the leading slash and the bucket segment ("nextvibe/")
    const path = url.pathname.replace(/^\//, "");
    const bucketEnd = path.indexOf("/");
    return bucketEnd === -1 ? path : path.slice(bucketEnd + 1);
  } catch {
    // fallback: everything after the last occurrence of "/nextvibe/"
    const marker = "/nextvibe/";
    const idx = fileUrl.lastIndexOf(marker);
    return idx === -1 ? fileUrl : fileUrl.slice(idx + marker.length);
  }
}
