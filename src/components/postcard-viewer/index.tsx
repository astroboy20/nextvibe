/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import Image from "next/image";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Heart,
  MessageCircle,
  X,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  ImageOff,
  ChevronLeft,
  Eye,
} from "lucide-react";
import {
  useToggleLikePostcardMutation,
  useCommentOnPostcardMutation,
  useGetPostcardCommentsQuery,
  useGetPostcardQuery,
} from "@/app/provider/api/eventApi";
import { usePostcardViewTracker } from "@/hooks/use-views";
import { useGetUserQuery } from "@/app/provider/api/authApi";
import { getGuestSessionId } from "@/hooks/get-guest-sessionId";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostcardMediaItem {
  id?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
}

export interface PostcardData {
  id?: string;
  caption?: string | null;
  likeCount?: number;
  commentCount?: number;
  eventId?: string;
  createdAt?: string;
  author?: {
    displayName?: string;
    username?: string;
    avatarUrl?: string | null;
  };
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
  author?: {
    displayName?: string;
    username?: string;
    avatarUrl?: string | null;
  };
}

// ─── ProgressiveImage ─────────────────────────────────────────────────────────

export function ProgressiveImage({
  src,
  alt,
  className,
  fullscreen,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  fullscreen?: boolean;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0)
      setLoaded(true);
  }, [src]);

  if (fullscreen) {
    // In fullscreen mode render as a flex-fill container so height is always
    // driven by the parent (CarouselItem) rather than the image's intrinsic size.
    return (
      <div className="flex items-center justify-center w-full h-full bg-black">
        {!loaded && !error && (
          <div className="absolute inset-0 bg-black animate-pulse" />
        )}
        {error ? (
          <div className="flex items-center justify-center w-full h-full">
            <ImageOff className="h-8 w-8 text-white/40" />
          </div>
        ) : (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={cn(
              "max-w-full max-h-full h-full transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0",
              className
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-30 ">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-inherit" />
      )}
      {error ? (
        <div
          className="flex items-center justify-center bg-muted rounded-inherit"
          style={{ minHeight: 120 }}
        >
          <ImageOff className="h-8 w-8 text-muted-foreground/40" />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "w-full h-auto block transition-opacity duration-300 ",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

export function VideoPlayer({
  src,
  active = true,
  onSingleTap,
  onDoubleTap,
}: {
  src: string;
  active?: boolean;
  /** Called when the user single-taps the video (toggle mute) */
  onSingleTap?: () => void;
  /** Called when the user double-taps the video (like) */
  onDoubleTap?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active) vid.play().catch(() => {});
    else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [active]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;

    if (delta < 300) {
      // Double tap — cancel pending single-tap and fire double-tap
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      onDoubleTap?.();
    } else {
      // Potential single tap — wait to see if a second tap follows
      singleTapTimerRef.current = setTimeout(() => {
        singleTapTimerRef.current = null;
        // Single tap: toggle mute
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.paused) vid.play().catch(() => {});
        const next = !muted;
        vid.muted = next;
        setMuted(next);
        onSingleTap?.();
      }, 300);
    }
  };

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    },
    []
  );

  return (
    <div className="relative w-full h-full bg-black" onClick={handleTap}>
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm z-10">
        {muted ? (
          <VolumeX className="h-4 w-4 text-white" />
        ) : (
          <Volume2 className="h-4 w-4 text-white" />
        )}
      </div>
    </div>
  );
}

// ─── CommentSheet ─────────────────────────────────────────────────────────────

export function CommentSheet({
  postcardId,
  onClose,
}: {
  postcardId: string;
  onClose: () => void;
}) {
  const [body, setBody] = useState("");
  const [postComment, { isLoading: isPosting }] =
    useCommentOnPostcardMutation();
  const {
    data: commentsData,
    isLoading: loadingComments,
    refetch,
  } = useGetPostcardCommentsQuery(postcardId);
  const comments: CommentData[] = commentsData?.data ?? commentsData ?? [];

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setBody("");
    try {
      await postComment({ postcardId, content: trimmed }).unwrap();
      refetch();
    } catch {
      setBody(trimmed);
      toast.error("Could not post comment.");
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-base">
          Comments {comments.length > 0 && `(${comments.length})`}
        </span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {loadingComments ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((c) => {
            const name = c.author?.displayName ?? c.author?.username ?? "User";
            return (
              <div key={c.id} className="flex gap-3">
                {c.author?.avatarUrl ? (
                  <img
                    src={c.author.avatarUrl}
                    alt={name}
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold">{name}</span>
                  <p className="text-sm text-foreground mt-0.5">{c.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-background">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder="Add a comment…"
          className="flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm outline-none focus:border-primary"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!body.trim() || isPosting}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── DotIndicator ─────────────────────────────────────────────────────────────
// Shows at most 5 dots. The active dot is always centred in the window.
// Dots at the edges of the window shrink to signal there are more items.

const DOT_WINDOW = 5;

function DotIndicator({
  total,
  active,
  onSelect,
}: {
  total: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  if (total <= 1) return null;

  // Clamp the window so active is centred as much as possible
  const half = Math.floor(DOT_WINDOW / 2);
  let start = active - half;
  let end = start + DOT_WINDOW - 1;

  if (start < 0) {
    start = 0;
    end = Math.min(DOT_WINDOW - 1, total - 1);
  }
  if (end >= total) {
    end = total - 1;
    start = Math.max(0, end - DOT_WINDOW + 1);
  }

  const dots: number[] = [];
  for (let i = start; i <= end; i++) dots.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 py-2 bg-background shrink-0">
      {dots.map((i) => {
        const isActive = i === active;
        // Edge dots (first/last in window when there are more items outside) shrink
        const isEdge =
          (i === start && start > 0) || (i === end && end < total - 1);
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "rounded-full transition-all duration-200",
              isActive
                ? "w-4 h-1.5 bg-primary"
                : isEdge
                ? "w-1 h-1 bg-muted-foreground/20"
                : "w-1.5 h-1.5 bg-muted-foreground/30"
            )}
          />
        );
      })}
    </div>
  );
}

// ─── PostcardViewer ───────────────────────────────────────────────────────────

export function PostcardViewer({
  postcard,
  eventId,
  eventName,
  onClose,
  zIndex = 50,
  postcardList,
  initialPostcardIndex,
  onNavigatePostcard,
}: {
  postcard: PostcardData;
  eventId: string;
  eventName: string;
  onClose: () => void;
  /** Override z-index when used inside other overlays. Default: 50 */
  zIndex?: number;
  /** Optional list of all postcards to enable swipe-up/down navigation */
  postcardList?: PostcardData[];
  /** Index of the current postcard in postcardList */
  initialPostcardIndex?: number;
  /** Called when user swipes to navigate; receives the new index */
  onNavigatePostcard?: (index: number) => void;
}) {
  const dispatch = useDispatch();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postcard.likeCount ?? 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [toggleLikeMutation] = useToggleLikePostcardMutation();

  // ─── Vertical swipe between postcards ────────────────────────────────────
  const currentPostcardIndex = initialPostcardIndex ?? 0;
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const swipeTouchStartY = useRef<number | null>(null);
  const swipeTouchStartX = useRef<number | null>(null);
  const swipeDeltaY = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeTransitioning, setSwipeTransitioning] = useState(false);

  useEffect(() => {
    const el = swipeContainerRef.current;
    if (!el || !postcardList || postcardList.length <= 1) return;

    const onTouchStart = (e: TouchEvent) => {
      swipeTouchStartY.current = e.touches[0].clientY;
      swipeTouchStartX.current = e.touches[0].clientX;
      swipeDeltaY.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (swipeTouchStartY.current === null || swipeTouchStartX.current === null) return;

      const dy = swipeTouchStartY.current - e.touches[0].clientY;
      const dx = swipeTouchStartX.current - e.touches[0].clientX;

      // Lock direction: if moving more horizontally, don't intercept
      if (Math.abs(dx) > Math.abs(dy) * 0.9) return;

      // Prevent pull-to-refresh and page scroll
      e.preventDefault();

      swipeDeltaY.current = dy;
      // Rubber-band feel: resist at the edges
      const hasNext = currentPostcardIndex < postcardList.length - 1;
      const hasPrev = currentPostcardIndex > 0;
      const resistedDy =
        (!hasNext && dy > 0) || (!hasPrev && dy < 0)
          ? dy * 0.2 // heavy resistance at boundary
          : dy * 0.85; // slight resistance for smoothness

      setSwipeOffset(-resistedDy);
    };

    const onTouchEnd = () => {
      if (swipeTouchStartY.current === null) return;

      const dy = swipeDeltaY.current;
      const threshold = 80;

      setSwipeTransitioning(true);

      if (dy > threshold) {
        // Swipe up → next postcard
        const nextIndex = currentPostcardIndex + 1;
        if (nextIndex >= postcardList.length) {
          toast("You've reached the last postcard", { icon: "🏁" });
          setSwipeOffset(0);
        } else {
          onNavigatePostcard?.(nextIndex);
        }
      } else if (dy < -threshold) {
        // Swipe down → previous postcard
        const prevIndex = currentPostcardIndex - 1;
        if (prevIndex < 0) {
          toast("You're already at the first postcard", { icon: "🔝" });
          setSwipeOffset(0);
        } else {
          onNavigatePostcard?.(prevIndex);
        }
      } else {
        // Snap back
        setSwipeOffset(0);
      }

      swipeTouchStartY.current = null;
      swipeTouchStartX.current = null;
      swipeDeltaY.current = 0;

      setTimeout(() => {
        setSwipeTransitioning(false);
        setSwipeOffset(0);
      }, 300);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [postcardList, currentPostcardIndex, onNavigatePostcard]);

  // Fetch fresh data in the background — isLoading is only true on the very
  // first fetch when there is no cached data at all. Since the parent already
  // passes full postcard data as a prop, we use that immediately and let RTK
  // Query silently update once the fresh response arrives.
  // Poll every 5 s while the viewer is open so viewCount (and likes) stay
  // real-time for all viewers — not just the one who triggered the view.
  const { data: freshPostcard, isLoading } = useGetPostcardQuery(postcard.id!, {
    skip: !postcard.id,
    pollingInterval: 5_000,
    refetchOnMountOrArgChange: true,
  });

  const { data: userData } = useGetUserQuery();

  //views
  const cardRef = usePostcardViewTracker({
    postId: postcard?.id ?? "",
    sessionId: userData?.data?.id || getGuestSessionId(),
  });

  const freshData = freshPostcard?.data ?? freshPostcard;

  // Merge fresh author data over the prop — list queries may return partial author
  const resolvedAuthor = freshData?.author ?? postcard.author;

  useEffect(() => {
    if (!freshData) return;
    if (freshData.likeCount !== undefined) setLikeCount(freshData.likeCount);
    if (freshData.isLiked !== undefined) setLiked(freshData.isLiked);
  }, [freshData]);

  // Live comment count
  const { data: commentsData } = useGetPostcardCommentsQuery(postcard.id!, {
    skip: !postcard.id,
  });
  const liveComments: CommentData[] = commentsData?.data ?? commentsData ?? [];
  const commentCount =
    liveComments.length > 0 ? liveComments.length : postcard.commentCount ?? 0;

  const [expandedCaption, setExpandedCaption] = useState(false);

  const MAX_CAPTION_LENGTH = 120;

  const caption = postcard.caption ?? "";

  const isLongCaption = caption.length > MAX_CAPTION_LENGTH;

  const displayedCaption =
    expandedCaption || !isLongCaption
      ? caption
      : `${caption.slice(0, MAX_CAPTION_LENGTH)}...`;

  // Lock scroll + hide header
  useEffect(() => {
    dispatch(setHideHeader(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dispatch(setHideHeader(false));
      document.body.style.overflow = prev;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const media = (postcard.media ?? []).filter((m) => !!m.mediaUrl);
  const displayName = resolvedAuthor?.displayName ?? resolvedAuthor?.username;
  const resolvedEventName = postcard.event?.name ?? eventName;

  const timeAgo = postcard.createdAt
    ? formatDistanceToNow(new Date(postcard.createdAt), { addSuffix: true })
    : "";

  // Preload adjacent images
  useEffect(() => {
    [activeIndex - 1, activeIndex, activeIndex + 1].forEach((i) => {
      const m = media[i];
      if (m?.mediaUrl && m.mediaType !== "VIDEO") {
        const img = new window.Image();
        img.src = m.mediaUrl;
      }
    });
  }, [activeIndex, media]);

  const handleLike = useCallback(async () => {
    if (!postcard.id) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      const result = await toggleLikeMutation({
        eventId,
        postcardId: postcard.id,
      }).unwrap();
      if (result?.currentLikes !== undefined) setLikeCount(result.currentLikes);
      if (result?.liked !== undefined) setLiked(result.liked);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      toast.error("Could not update like.");
    }
  }, [liked, postcard.id, eventId, toggleLikeMutation]);

  const triggerLikeAnimation = useCallback(() => {
    if (!liked) handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  }, [liked, handleLike]);

  // Double-tap handler for images (photos) — videos handle their own taps
  const lastImageTapRef = useRef<number>(0);
  const handleImageTap = useCallback(() => {
    const now = Date.now();
    if (now - lastImageTapRef.current < 300) {
      triggerLikeAnimation();
    }
    lastImageTapRef.current = now;
  }, [triggerLikeAnimation]);

  const handleShare = async () => {
    const currentMedia = media[activeIndex];

    const authorLabel = resolvedAuthor?.displayName;
    const text = postcard.caption
      ? `${postcard.caption}\n\n— ${authorLabel} at ${resolvedEventName} via NextVibe`
      : `Check out this memory from ${resolvedEventName} by ${authorLabel} — NextVibe`;
    const shareUrl = postcard.id
      ? `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/postcard/${postcard.id}`
      : typeof window !== "undefined"
      ? window.location.href
      : "";
    if (!navigator.share) {
      await navigator.clipboard
        .writeText(`${text}\n\n${shareUrl}`)
        .catch(() => {});
      toast.success("Link copied to clipboard");

      return;
    }

    if (currentMedia?.mediaUrl) {
      setSharing(true);
      try {
        const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(
          currentMedia.mediaUrl
        )}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const blob = await res.blob();
          const isVideo = currentMedia.mediaType === "VIDEO";
          const ext = isVideo
            ? blob.type.includes("webm")
              ? "webm"
              : "mp4"
            : "jpg";
          const file = new File([blob], `nextvibe-postcard.${ext}`, {
            type: blob.type || (isVideo ? "video/mp4" : "image/jpeg"),
          });
          if (navigator.canShare?.({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${resolvedEventName} — NextVibe`,
                text,
                url: shareUrl,
              });
              setSharing(false);
              return;
            } catch (e: any) {
              if (e?.name === "AbortError") {
                setSharing(false);
                return;
              }
            }
          }
        }
      } catch {
        /* fall through to text share */
      }
      setSharing(false);
    }

    try {
      await navigator.share({
        title: `${resolvedEventName} — NextVibe`,
        text,
        url: shareUrl,
      });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        await navigator.clipboard
          .writeText(`${text}\n\n${shareUrl}`)
          .catch(() => {});
        toast.success("Link copied to clipboard");
      }
    }
  };

  if (media.length === 0) {
    onClose();
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 flex flex-col bg-background overflow-hidden"
        style={{ zIndex }}
        ref={swipeContainerRef}
      >
        {/* Inner wrapper that slides during swipe */}
        <div
          className="flex flex-col w-full h-full overflow-y-auto no-scrollbar"
          ref={cardRef}
          style={{
            transform: `translateY(${swipeOffset}px)`,
            transition: swipeTransitioning ? "transform 0.3s cubic-bezier(0.32,0.72,0,1)" : "none",
            willChange: "transform",
          }}
        >
        <div className="flex items-center gap-2 p-4  bg-background shrink-0">
          <button
            onClick={onClose}
            className=" z-30 flex h-9 w-9 items-center justify-center rounded-full text-black"
            aria-label="Close"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div>
            {isLoading && !resolvedAuthor ? (
              <Skeleton className="rounded-full w-10 h-10" />
            ) : resolvedAuthor?.avatarUrl ? (
              <Image
                src={resolvedAuthor.avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {displayName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          {isLoading && !resolvedAuthor ? (
              <Skeleton className="h-4 w-1/4" />
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">
                  {displayName}
                </p>
              </div>
            )}
        </div>
        {/* Carousel — flex-1 so it fills remaining height */}
        <div className="relative  h-full w-full bg-black ">
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: false }}
            className="w-full h-full"
          >
            <CarouselContent className="ml-0 h-full">
              {media.map((m, i) => (
                <CarouselItem
                  key={m.id ?? i}
                  className="pl-0 basis-full h-full"
                >
                  {m.mediaType === "VIDEO" ? (
                    <VideoPlayer
                      src={m.mediaUrl!}
                      active={i === activeIndex}
                      onDoubleTap={triggerLikeAnimation}
                    />
                  ) : (
                    <div className="w-full h-full" onClick={handleImageTap}>
                      <ProgressiveImage
                        src={m.mediaUrl!}
                        alt={postcard.caption ?? "Postcard"}
                        eager={i === 0}
                        fullscreen
                      />
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <Heart className="h-24 w-24 fill-[#5B1A57] text-[#5B1A57] opacity-90 animate-ping" />
            </div>
          )}
        </div>

        {/* Dot indicators — windowed, max 5 visible */}
        <DotIndicator
          total={media.length}
          active={activeIndex}
          onSelect={(i) => carouselApi?.scrollTo(i)}
        />

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 pt-5 bg-background shrink-0">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                "h-6 w-6 transition-all duration-150",
                liked
                  ? "fill-[#5B1A57] text-[#5B1A57] scale-110"
                  : "text-foreground"
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {likeCount}
            </span>
          </button>
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5"
          >
            <MessageCircle className="h-6 w-6 text-foreground" />
            <span className="text-sm font-medium text-foreground">
              {commentCount}
            </span>
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-1.5 disabled:opacity-50"
          >
            {sharing ? (
              <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            ) : (
              <Send className="h-6 w-6 text-foreground" />
            )}
          </button>
          <div className="flex items-center gap-1.5  py-2 text-sm text-foreground shrink-0 ">
            <Eye className="h-6 w-6 text-foreground" />{" "}
            {freshData?.viewCount ?? 0}
          </div>
        </div>

        <>
          {/* Author row — top, with close button */}

          <div className="flex items-center gap-3 px-4 py-5  bg-background shrink-0">
            {/* {isLoading ? (
              <Skeleton className="rounded-full w-10 h-q0" />
            ) : resolvedAuthor?.avatarUrl ? (
              <Image
                src={resolvedAuthor.avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {displayName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )} */}

            {isLoading && !resolvedAuthor ? (
              <Skeleton className="h-4 w-1/4" />
            ) : (
              <div className="flex-1 min-w-0">
                <div className="text-base">
                  <div className="flex items-center gap-1 flex-wrap">
                    <p className="font-semibold leading-tight">{displayName}</p>

                    <p className="wrap-break-word">
                      {displayedCaption}

                      {isLongCaption && (
                        <button
                          onClick={() => setExpandedCaption((prev) => !prev)}
                          className="ml-1 text-primary font-medium hover:underline"
                        >
                          {expandedCaption ? "Read less" : "Read more"}
                        </button>
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground truncate">
                  {timeAgo ? `${timeAgo}` : timeAgo}
                </p>
              </div>
            )}
          </div>
        </>

        {/* {postcard.caption && (
          <div className="px-4 pb-4 pt-1 bg-background shrink-0">
            <span className="text-sm font-semibold mr-1">{displayName}</span>
            <span className="text-sm text-foreground">{postcard.caption}</span>
          </div>
        )} */}
        </div>{/* end inner swipe wrapper */}
      </div>

      {showComments && postcard.id && (
        <CommentSheet
          postcardId={postcard.id}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}
