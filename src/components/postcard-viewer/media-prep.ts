export type PreparedEntry = {
  status: "loading" | "ready" | "error";
  file?: File;
  promise?: Promise<File | null>;
};

export function buildProxyUrl(mediaUrl: string, isVideo: boolean) {
  return isVideo
    ? `/api/media-convert?url=${encodeURIComponent(mediaUrl)}`
    : `/api/media-proxy?url=${encodeURIComponent(mediaUrl)}`;
}

export async function fetchAndBuildFile(
  mediaUrl: string,
  isVideo: boolean
): Promise<File | null> {
  try {
    const res = await fetch(buildProxyUrl(mediaUrl, isVideo));
    if (!res.ok) return null;

    const blob = await res.blob();
    return new File(
      [blob],
      `nextvibe-postcard.${isVideo ? "mp4" : "jpg"}`,
      { type: isVideo ? "video/mp4" : blob.type || "image/jpeg" }
    );
  } catch {
    return null;
  }
}
