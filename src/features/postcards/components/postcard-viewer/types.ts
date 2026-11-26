export interface PostcardMediaItem {
  id?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  /**
   * Raw object-storage key (e.g. "general/1234-postcard.mp4").
   * When the API omits a pre-signed `mediaUrl`, the client builds one from
   * this key + NEXT_PUBLIC_STORAGE_BASE_URL.
   */
  storageKey?: string | null;
  /**
   * Storage key for the composited thumbnail frame (VIDEO only).
   * Used as a fallback display URL when `mediaUrl` is null.
   */
  thumbnailKey?: string | null;
  /**
   * Composited preview frame URL (VIDEO only) — the first frame of the video
   * with the vibe tag baked onto it. Used in feeds/grids/leaderboards whenever
   * the video isn't actively playing. null for photos (the photo IS the thumbnail).
   */
  thumbnailUrl?: string | null;
  /** VibeTag overlay URL — set when canvas baking was skipped (large file). */
  vibeTagOverlayUrl?: string | null;
}

export interface PostcardAuthor {
  displayName?: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface PostcardData {
  id?: string;
  caption?: string | null;
  likeCount?: number;
  commentCount?: number;
  eventId?: string;
  /** ID of the vibe tag applied to this postcard — used to resolve the overlay image URL. */
  vibeTagId?: string | null;
  createdAt?: string;
  /** Public place name for the stamp. null = no location, or hidden by the author. */
  locationLabel?: string | null;
  /** Author-only: a stamp exists (possibly hidden) and can be toggled. */
  hasLocation?: boolean;
  author?: PostcardAuthor;
  event?: {
    id?: string;
    name?: string;
    locationName?: string | null;
  };
  media?: PostcardMediaItem[];
}

export interface CommentData {
  id: string;
  content: string;
  createdAt?: string;
  author?: PostcardAuthor;
}

export interface PostcardViewerActionHandlers {
  /** Optional UI-only action. The existing like/comment/share/download logic is untouched. */
  onAddPostcard?: () => void;
  /** Optional filter action. */
  onFilter?: () => void;
  /** Optional repost action. */
  onRepost?: () => void;
  /** Optional save/bookmark action. */
  onSave?: () => void;
  /** Optional overflow/menu action. */
  onMore?: () => void;
}

export interface PostcardViewerProps extends PostcardViewerActionHandlers {
  postcard: PostcardData;
  eventId: string;
  eventName: string;
  onClose: () => void;
  /** Override z-index when used inside other overlays. Default: 50. */
  zIndex?: number;
  /** Optional list of all postcards to enable swipe-up/down navigation. */
  postcardList?: PostcardData[];
  /** Index of the current postcard in postcardList. */
  initialPostcardIndex?: number;
  /** Called when user swipes to navigate; receives the new index. */
  onNavigatePostcard?: (index: number) => void;
  /**
   * Optional map of vibeTagId → { imageUrl } used to resolve the overlay URL
   * for videos where the server stored "true" instead of the actual image URL.
   */
  vibeTagMap?: Record<string, { imageUrl?: string | null }>;
}
