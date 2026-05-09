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
  Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "@/components/ui/carousel";
import {
  Heart, MessageCircle, Share2, X, Send, Loader2,
  Volume2, VolumeX, ImageOff,
} from "lucide-react";
import {
  useToggleLikePostcardMutation,
  useCommentOnPostcardMutation,
  useGetPostcardCommentsQuery,
  useGetPostcardQuery,
} from "@/app/provider/api/eventApi";

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
  author?: { displayName?: string; username?: string; avatarUrl?: string | null };
  media?: PostcardMediaItem[];
}

export interface CommentData {
  id: string;
  content: string;
  createdAt?: string;
  author?: { displayName?: string; username?: string; avatarUrl?: string | null };
}

// ─── ProgressiveImage ─────────────────────────────────────────────────────────

export function ProgressiveImage({
  src, alt, className, fullscreen, eager,
}: {
  src: string; alt: string; className?: string; fullscreen?: boolean; eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <div className={cn("relative w-full min-h-[120px]", fullscreen ? "h-full" : "")}>
      {!loaded && !error && (
        <div className={cn("absolute inset-0 bg-muted animate-pulse", fullscreen ? "" : "rounded-inherit")} />
      )}
      {error ? (
        <div className={cn("flex items-center justify-center bg-muted", fullscreen ? "h-full" : "rounded-inherit")} style={{ minHeight: 120 }}>
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
            "transition-opacity duration-300",
            fullscreen ? "w-full h-full object-contain" : "w-full h-auto block",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

export function VideoPlayer({ src, active = true }: { src: string; active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active) vid.play().catch(() => {});
    else { vid.pause(); vid.currentTime = 0; }
  }, [active]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) vid.play().catch(() => {});
    setMuted((m) => { vid.muted = !m; return !m; });
  };

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
        {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
      </div>
    </div>
  );
}

// ─── CommentSheet ─────────────────────────────────────────────────────────────

export function CommentSheet({ postcardId, onClose }: { postcardId: string; onClose: () => void }) {
  const [body, setBody] = useState("");
  const [postComment, { isLoading: isPosting }] = useCommentOnPostcardMutation();
  const { data: commentsData, isLoading: loadingComments, refetch } = useGetPostcardCommentsQuery(postcardId);
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
    <div className="fixed inset-0 z-[70] flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-base">
          Comments {comments.length > 0 && `(${comments.length})`}
        </span>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
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
          <p className="text-center text-sm text-muted-foreground py-8">No comments yet. Be the first!</p>
        ) : comments.map((c) => {
          const name = c.author?.displayName ?? c.author?.username ?? "User";
          return (
            <div key={c.id} className="flex gap-3">
              {c.author?.avatarUrl ? (
                <img src={c.author.avatarUrl} alt={name} className="h-8 w-8 rounded-full object-cover shrink-0" />
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
        })}
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
          {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── PostcardViewer ───────────────────────────────────────────────────────────

export function PostcardViewer({
  postcard, eventId, eventName, onClose, zIndex = 50,
}: {
  postcard: PostcardData;
  eventId: string;
  eventName: string;
  onClose: () => void;
  /** Override z-index when used inside other overlays. Default: 50 */
  zIndex?: number;
}) {
  const dispatch = useDispatch();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postcard.likeCount ?? 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [sharing, setSharing] = useState(false);
  const lastTapRef = useRef<number>(0);
  const [toggleLikeMutation] = useToggleLikePostcardMutation();

  // Fetch fresh like state on open
  const { data: freshPostcard } = useGetPostcardQuery(postcard.id!, { skip: !postcard.id });
  useEffect(() => {
    const fresh = freshPostcard?.data ?? freshPostcard;
    if (!fresh) return;
    if (fresh.likeCount !== undefined) setLikeCount(fresh.likeCount);
    if (fresh.isLiked !== undefined) setLiked(fresh.isLiked);
  }, [freshPostcard]);

  // Live comment count
  const { data: commentsData } = useGetPostcardCommentsQuery(postcard.id!, { skip: !postcard.id });
  const liveComments: CommentData[] = commentsData?.data ?? commentsData ?? [];
  const commentCount = liveComments.length > 0 ? liveComments.length : (postcard.commentCount ?? 0);

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
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const media = (postcard.media ?? []).filter((m) => !!m.mediaUrl);
  const authorName = postcard.author?.displayName ?? postcard.author?.username ?? eventName;
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
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);
    try {
      const result = await toggleLikeMutation({ eventId, postcardId: postcard.id }).unwrap();
      if (result?.currentLikes !== undefined) setLikeCount(result.currentLikes);
      if (result?.liked !== undefined) setLiked(result.liked);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => wasLiked ? c + 1 : c - 1);
      toast.error("Could not update like.");
    }
  }, [liked, postcard.id, eventId, toggleLikeMutation]);

  const handleMediaTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTapRef.current = now;
  }, [liked, handleLike]);

  const handleShare = async () => {
    const currentMedia = media[activeIndex];
    const authorLabel = postcard.author?.displayName ?? postcard.author?.username ?? eventName;
    const text = postcard.caption
      ? `${postcard.caption}\n\n— ${authorLabel} at ${eventName} via NextVibe`
      : `Check out this memory from ${eventName} by ${authorLabel} — NextVibe`;

    if (!navigator.share) {
      await navigator.clipboard.writeText(text).catch(() => {});
      toast.success("Caption copied to clipboard");
      return;
    }

    if (currentMedia?.mediaUrl) {
      setSharing(true);
      try {
        const res = await fetch(currentMedia.mediaUrl);
        if (res.ok) {
          const blob = await res.blob();
          const isVideo = currentMedia.mediaType === "VIDEO";
          const file = new File(
            [blob],
            `nextvibe-postcard.${isVideo ? "mp4" : "jpg"}`,
            { type: isVideo ? "video/mp4" : "image/jpeg" }
          );
          try {
            await navigator.share({ files: [file], title: `${eventName} — NextVibe`, text });
            setSharing(false);
            return;
          } catch (e: any) {
            if (e?.name === "AbortError") { setSharing(false); return; }
          }
        }
      } catch { /* fall through */ }
      setSharing(false);
    }

    try {
      await navigator.share({ title: `${eventName} — NextVibe`, text });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        await navigator.clipboard.writeText(text).catch(() => {});
        toast.success("Caption copied to clipboard");
      }
    }
  };

  if (media.length === 0) { onClose(); return null; }

  return (
    <>
      <div
        className="fixed inset-0 flex flex-col bg-background overflow-hidden"
        style={{ zIndex }}
      >
        {/* Author row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
          {postcard.author?.avatarUrl ? (
            <Image
              src={postcard.author.avatarUrl}
              alt={authorName}
              width={40} height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {authorName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">{authorName}</p>
            {timeAgo && <p className="text-xs text-muted-foreground">{timeAgo}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative flex-1 w-full bg-black overflow-hidden" onClick={handleMediaTap}>
          <Carousel setApi={setCarouselApi} opts={{ loop: false }} className="w-full h-full">
            <CarouselContent className="ml-0 h-full">
              {media.map((m, i) => (
                <CarouselItem key={m.id ?? i} className="pl-0 h-full">
                  {m.mediaType === "VIDEO" ? (
                    <VideoPlayer src={m.mediaUrl!} active={i === activeIndex} />
                  ) : (
                    <ProgressiveImage
                      src={m.mediaUrl!}
                      alt={postcard.caption ?? "Postcard"}
                      eager={i === 0}
                      fullscreen
                    />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="h-24 w-24 fill-white text-white opacity-90 animate-ping" />
            </div>
          )}
        </div>

        {/* Dot indicators */}
        {media.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2 bg-background shrink-0">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => carouselApi?.scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-3 bg-background shrink-0">
          <button onClick={handleLike} className="flex items-center gap-1.5 transition-transform active:scale-90">
            <Heart className={cn("h-6 w-6 transition-all duration-150", liked ? "fill-red-500 text-red-500 scale-110" : "text-foreground")} />
            <span className="text-sm font-medium text-foreground">{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5">
            <MessageCircle className="h-6 w-6 text-foreground" />
            <span className="text-sm font-medium text-foreground">{commentCount}</span>
          </button>
          <button onClick={handleShare} disabled={sharing} className="flex items-center gap-1.5 ml-auto disabled:opacity-50">
            {sharing
              ? <Loader2 className="h-6 w-6 animate-spin text-foreground" />
              : <Share2 className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {postcard.caption && (
          <div className="px-4 pb-4 pt-1 bg-background shrink-0">
            <span className="text-sm font-semibold mr-1">{authorName}</span>
            <span className="text-sm text-foreground">{postcard.caption}</span>
          </div>
        )}
      </div>

      {showComments && postcard.id && (
        <CommentSheet postcardId={postcard.id} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}
