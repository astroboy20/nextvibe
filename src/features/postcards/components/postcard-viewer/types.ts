export interface PostcardMediaItem {
  id?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
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
  createdAt?: string;
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
}
