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
