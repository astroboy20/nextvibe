export interface VibeTagOverlay {
  imageUrl: string;
  name: string;
}

export interface PostcardCreatorProps {
  vibeTagName?: string;
  vibeTagOverlay?: VibeTagOverlay | null;
  vibeTagId?: string;
  eventName?: string;
  eventId?: string;
  onClose?: () => void;
  onSubmit?: (data: { image: string; caption: string }) => void;
  /** When provided, the creator is in swap mode — it replaces this postcard instead of creating a new one */
  swapPostcardId?: string;
  /** The number of likes on the postcard being replaced (shown in confirmation step) */
  swapLikeCount?: number;
  /** The number of comments on the postcard being replaced (shown in confirmation step) */
  swapCommentCount?: number;
}

export type MediaKind = "image" | "video";

export interface QueuedItem {
  id: string;
  kind: MediaKind;
  raw: string;
  baked: string | null;
  caption: string;
  baking: boolean;
  blob?: Blob;
  /** Overlay image URL for videos that skipped canvas baking (>BAKE_SIZE_LIMIT_MB).
   *  Rendered as an absolute CSS layer on top of the video in preview & viewer. */
  overlayUrl?: string | null;
}
