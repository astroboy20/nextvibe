export type PreparedEntry = {
  status: "loading" | "ready" | "error";
  file?: File;
  promise?: Promise<File | null>;
};

export function buildProxyUrl(
  mediaUrl: string,
  isVideo: boolean,
  vibeTagOverlayUrl?: string | null
) {
  if (isVideo) {
    // When the video didn't have the VibeTag baked in at capture time
    // (large files skip canvas baking), burn the overlay in during
    // server-side conversion so downloads/shares carry the tag.
    const overlayParam = vibeTagOverlayUrl
      ? `&overlay=${encodeURIComponent(vibeTagOverlayUrl)}`
      : "";
    return `/api/media-convert?url=${encodeURIComponent(
      mediaUrl
    )}${overlayParam}`;
  }
  return `/api/media-proxy?url=${encodeURIComponent(mediaUrl)}`;
}

export async function fetchAndBuildFile(
  mediaUrl: string,
  isVideo: boolean,
  vibeTagOverlayUrl?: string | null
): Promise<File | null> {
  try {
    const res = await fetch(buildProxyUrl(mediaUrl, isVideo, vibeTagOverlayUrl));
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
