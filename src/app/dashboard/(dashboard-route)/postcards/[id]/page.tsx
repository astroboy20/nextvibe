/* eslint-disable @next/next/no-img-element */
"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Heart, MessageCircle, Share2, X,
  ImageOff, Send, Loader2, Volume2, VolumeX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "@/components/ui/carousel";
import {
  useGetEventPostcardsQuery,
  useGetEventDetailsQuery,
  useToggleLikePostcardMutation,
  useCommentOnPostcardMutation,
} from "@/app/provider/api/eventApi";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import BottomNav from "@/components/navbar/bottom-navbar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface MediaItem {
  id?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
}

interface Postcard {
  id?: string;
  caption?: string | null;
  likeCount?: number;
  commentCount?: number;
  eventId?: string;
  createdAt?: string;
  author?: { displayName?: string; username?: string; avatarUrl?: string | null };
  media?: MediaItem[];
}

type Phase = "all" | "pre-event" | "main-event" | "post-event";
const VALID_PHASES: Phase[] = ["all", "pre-event", "main-event", "post-event"];

// ─── Image with loading shimmer ───────────────────────────────────────────────
// Shows a shimmer skeleton while the image is fetching, then fades it in.
// Works on slow connections — the skeleton stays visible until onLoad fires.

function ProgressiveImage({
  src,
  alt,
  className,
  style,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image is already in the browser cache it fires onLoad synchronously
  // before React attaches the handler — check naturalWidth to catch that case.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className="relative w-full" style={style}>
      {/* Shimmer placeholder — visible until image loads */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-inherit" />
      )}

      {error ? (
        <div className="flex items-center justify-center bg-muted rounded-inherit" style={{ minHeight: 160 }}>
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
            "w-full h-auto block transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}

// ─── Comment Sheet ────────────────────────────────────────────────────────────

function CommentSheet({ postcardId, onClose }: { postcardId: string; onClose: () => void }) {
  const [body, setBody] = useState("");
  const [localComments, setLocalComments] = useState<{ id: string; text: string }[]>([]);
  const [postComment, { isLoading: isPosting }] = useCommentOnPostcardMutation();

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const tempId = Date.now().toString();
    setLocalComments((prev) => [...prev, { id: tempId, text: trimmed }]);
    setBody("");
    try {
      await postComment({ postcardId, content: trimmed }).unwrap();
    } catch {
      setLocalComments((prev) => prev.filter((c) => c.id !== tempId));
      setBody(trimmed);
      toast.error("Could not post comment.");
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-base">Comments</span>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {localComments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No comments yet. Be the first!</p>
        ) : localComments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">Y</div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold">You</span>
              <p className="text-sm text-foreground mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
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

// ─── Video player ─────────────────────────────────────────────────────────────

function VideoPlayer({ src, active = true }: { src: string; active?: boolean }) {
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
    <div className="relative w-full bg-black" onClick={handleTap}>
      {/* Buffering shimmer */}
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
        // Only load metadata initially — actual data loads on play
        preload="metadata"
        onCanPlay={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        className="w-full h-auto block"
        style={{ maxHeight: "70vh" }}
      />
      <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm z-10">
        {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
      </div>
    </div>
  );
}

// ─── Viewer ───────────────────────────────────────────────────────────────────

function PostcardViewer({
  postcard, eventId, eventName, onClose,
}: {
  postcard: Postcard; eventId: string; eventName: string; onClose: () => void;
}) {
  const dispatch = useDispatch();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postcard.likeCount ?? 0);
  const [commentCount] = useState(postcard.commentCount ?? 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const lastTapRef = useRef<number>(0);
  const [toggleLikeMutation] = useToggleLikePostcardMutation();

  useEffect(() => {
    dispatch(setHideHeader(true));
    return () => { dispatch(setHideHeader(false)); };
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

  // Preload adjacent images using the browser Image API (works even on slow connections,
  // doesn't block the main thread, and respects the browser cache).
  useEffect(() => {
    const toPreload = [activeIndex - 1, activeIndex, activeIndex + 1];
    toPreload.forEach((i) => {
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
      await toggleLikeMutation({ eventId, postcardId: postcard.id }).unwrap();
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

  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    const currentMedia = media[activeIndex];
    const authorLabel = postcard.author?.displayName ?? postcard.author?.username ?? eventName;
    const text = postcard.caption
      ? `${postcard.caption}\n\n— ${authorLabel} at ${eventName} via NextVibe`
      : `Check out this memory from ${eventName} by ${authorLabel} — NextVibe`;

    // If no Web Share API (desktop), fall back to clipboard
    if (!navigator.share) {
      await navigator.clipboard.writeText(text).catch(() => {});
      toast.success("Caption copied to clipboard");
      return;
    }

    // Try to share the actual media file via our server proxy (bypasses CORS)
    if (currentMedia?.mediaUrl) {
      setSharing(true);
      try {
        const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(currentMedia.mediaUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const blob = await res.blob();
          const isVideo = currentMedia.mediaType === "VIDEO";
          const ext = isVideo ? "mp4" : "jpg";
          const mimeType = isVideo ? "video/mp4" : "image/jpeg";
          const file = new File([blob], `nextvibe-postcard.${ext}`, { type: mimeType });

          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${eventName} — NextVibe`,
              text,
            });
            setSharing(false);
            return;
          }
        }
      } catch (e: any) {
        if (e?.name === "AbortError") { setSharing(false); return; }
        // proxy failed — fall through to URL share
      }
      setSharing(false);
    }

    // Fallback: share just the text + link (no media attachment)
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
      <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto">
        {/* Author row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
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
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative w-full bg-black" onClick={handleMediaTap}>
          <Carousel setApi={setCarouselApi} opts={{ loop: false }} className="w-full">
            <CarouselContent className="ml-0">
              {media.map((m, i) => (
                <CarouselItem key={m.id ?? i} className="pl-0">
                  {m.mediaType === "VIDEO" ? (
                    <VideoPlayer src={m.mediaUrl!} active={i === activeIndex} />
                  ) : (
                    <ProgressiveImage
                      src={m.mediaUrl!}
                      alt={postcard.caption ?? "Postcard"}
                      eager={i === 0}
                      // Reserve approximate height so the carousel doesn't collapse
                      // while the image loads — avoids layout shift
                      style={i !== 0 && !true ? { minHeight: 300 } : undefined}
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
          <div className="flex justify-center gap-1.5 py-2">
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
        <div className="flex items-center gap-4 px-4 py-2">
          <button onClick={handleLike} className="flex items-center gap-1.5 transition-transform active:scale-90">
            <Heart className={cn("h-6 w-6 transition-all duration-150", liked ? "fill-red-500 text-red-500 scale-110" : "text-foreground")} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5">
            <MessageCircle className="h-6 w-6 text-foreground" />
            <span className="text-sm font-medium">{commentCount}</span>
          </button>
          <button onClick={handleShare} disabled={sharing} className="flex items-center gap-1.5 ml-auto disabled:opacity-50">
            {sharing ? <Loader2 className="h-6 w-6 animate-spin text-foreground" /> : <Share2 className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {postcard.caption && (
          <div className="px-4 pb-4">
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

// ─── Grid tile ────────────────────────────────────────────────────────────────

function GridTile({ postcard, onClick }: { postcard: Postcard; onClick: () => void }) {
  const primaryMedia = (postcard.media ?? []).find((m) => !!m.mediaUrl);
  const src = primaryMedia?.mediaUrl ?? "";
  const isVideo = primaryMedia?.mediaType === "VIDEO";
  const hasMultiple = (postcard.media ?? []).filter((m) => !!m.mediaUrl).length > 1;

  return (
    <div onClick={onClick} className="relative mb-1 break-inside-avoid overflow-hidden rounded-lg cursor-pointer bg-muted">
      {isVideo ? (
        <div className="relative">
          {/* Thumbnail only — no autoplay, no preload of video data */}
          <video
            src={src}
            muted
            playsInline
            preload="none"
            className="w-full object-cover rounded-lg"
          />
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/40 rounded-full px-1.5 py-0.5 backdrop-blur-sm">
            <svg className="h-3 w-3 text-white fill-white" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        </div>
      ) : (
        <ProgressiveImage
          src={src}
          alt={postcard.caption ?? "Postcard"}
          className="rounded-lg"
        />
      )}
      {hasMultiple && (
        <div className="absolute top-1.5 right-1.5">
          <svg className="h-4 w-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H7a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2zM5 7H3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2H5V7z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventPostcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPhase = (): Phase => {
    const p = searchParams.get("phase") as Phase;
    return VALID_PHASES.includes(p) ? p : "all";
  };

  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const LIMIT = 40;

  const { data: eventDetails } = useGetEventDetailsQuery(id);
  const { data: postcardsData, isLoading } = useGetEventPostcardsQuery({
    eventId: id, page, limit: LIMIT,
    ...(phase !== "all" ? { phase } : {}),
  });

  const postcards: Postcard[] = postcardsData?.data ?? [];
  const meta = postcardsData?.meta;
  const eventName = eventDetails?.data?.name ?? "Event";
  const gridItems = postcards.filter((p) => (p.media ?? []).some((m) => !!m.mediaUrl));

  const handlePhaseChange = (value: string) => { setPhase(value as Phase); setPage(1); };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold text-base leading-tight truncate">Postcards</h1>
            <p className="text-xs text-muted-foreground truncate">{eventName}</p>
          </div>
        </div>
        <div className="px-4 pb-3">
          <Tabs value={phase} onValueChange={handlePhaseChange}>
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="pre-event" className="text-xs">Pre</TabsTrigger>
              <TabsTrigger value="main-event" className="text-xs">Main</TabsTrigger>
              <TabsTrigger value="post-event" className="text-xs">Post</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-1 pt-1">
        {isLoading ? (
          <div className="columns-2 gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-1 break-inside-avoid">
                <Skeleton className="w-full rounded-lg" style={{ height: `${160 + (i % 3) * 60}px` }} />
              </div>
            ))}
          </div>
        ) : gridItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No postcards{phase !== "all" ? ` for ${phase}` : ""} yet.</p>
          </div>
        ) : (
          <>
            <div className="columns-2 gap-1">
              {gridItems.map((postcard, index) => (
                <GridTile key={postcard.id ?? index} postcard={postcard} onClick={() => setSelectedPostcard(postcard)} />
              ))}
            </div>
            {meta?.hasNext && (
              <div className="flex justify-center pt-6 pb-2">
                <button onClick={() => setPage((p) => p + 1)} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPostcard && (
        <PostcardViewer
          postcard={selectedPostcard}
          eventId={id}
          eventName={eventName}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
