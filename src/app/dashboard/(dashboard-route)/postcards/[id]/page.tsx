"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  ImageOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetEventPostcardsQuery,
  useGetEventDetailsQuery,
  useToggleLikePostcardMutation,
} from "@/app/provider/api/eventApi";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import BottomNav from "@/components/navbar/bottom-navbar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

// ─── Types

interface MediaItem {
  id?: string;
  mediaUrl?: string | null;
  storageKey?: string | null;
  mediaType?: string | null;
}

interface Postcard {
  id?: string;
  caption?: string | null;
  likeCount?: number;
  commentCount?: number;
  eventId?: string;
  author?: { displayName?: string; username?: string; avatarUrl?: string | null };
  media?: MediaItem[];
}

type Phase = "all" | "pre-event" | "main-event" | "post-event";
const VALID_PHASES: Phase[] = ["all", "pre-event", "main-event", "post-event"];

// ─── Instagram-style viewer ───────────────────────────────────────────────────

interface ViewerProps {
  postcard: Postcard;
  eventId: string;
  onClose: () => void;
}

function PostcardViewer({ postcard, eventId, onClose }: ViewerProps) {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postcard.likeCount ?? 0);
  const [showUI, setShowUI] = useState(true);
  const [toggleLike] = useToggleLikePostcardMutation();

  // Hide header + bottom nav while viewer is open
  useEffect(() => {
    dispatch(setHideHeader(true));
    return () => { dispatch(setHideHeader(false)); };
  }, [dispatch]);

  // Only show media items that have a real mediaUrl
  const media = (postcard.media ?? []).filter((m) => !!m.mediaUrl);
  const current = media[activeIndex];
  const src = current?.mediaUrl ?? "";
  const isVideo = current?.mediaType === "VIDEO";
  const authorName = postcard.author?.displayName ?? postcard.author?.username ?? "";

  const handleLike = async () => {
    if (!postcard.id) return;
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await toggleLike({ eventId, postcardId: postcard.id }).unwrap();
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
      toast.error("Could not like. Try again.");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/postcards/${eventId}`;
    const text = postcard.caption
      ? `"${postcard.caption}" — check out this postcard on NextVibe`
      : "Check out this postcard on NextVibe";
    try {
      if (navigator.share) {
        await navigator.share({ title: "NextVibe Postcard", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(media.length - 1, i + 1));

  // Toggle UI on tap
  const toggleUI = () => setShowUI((v) => !v);

  if (media.length === 0) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header — fades out when UI hidden */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300",
          showUI ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {postcard.author?.avatarUrl ? (
          <Image
            src={postcard.author.avatarUrl}
            alt={authorName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
            {authorName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {authorName && (
            <p className="text-sm font-semibold leading-tight text-white">@{authorName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Media — tap to toggle UI */}
      <div
        className="relative flex flex-1 items-center justify-center"
        onClick={toggleUI}
      >
        {isVideo ? (
          <video
            key={src}
            src={src}
            controls={showUI}
            autoPlay
            playsInline
            loop
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Image
            key={src}
            src={src}
            alt={postcard.caption ?? "Postcard"}
            fill
            className="object-contain"
          />
        )}

        {/* Prev / Next arrows — only show when UI visible and multiple media */}
        {showUI && media.length > 1 && (
          <>
            {activeIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {activeIndex < media.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}

        {/* Dot indicators — always visible */}
        {media.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions — fades out when UI hidden */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300",
          showUI ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-5 px-5 py-4 text-white">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-transform active:scale-90"
            aria-label="Like"
          >
            <Heart
              className={cn(
                "h-7 w-7 transition-colors",
                liked ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button className="flex items-center gap-1.5" aria-label="Comments">
            <MessageCircle className="h-7 w-7 text-white" />
            <span className="text-sm font-medium">{postcard.commentCount ?? 0}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 ml-auto"
            aria-label="Share"
          >
            <Share2 className="h-7 w-7 text-white" />
          </button>
        </div>

        {/* Caption */}
        {postcard.caption && (
          <div className="px-5 pb-4 text-white">
            <span className="text-sm font-semibold mr-1">@{authorName}</span>
            <span className="text-sm text-white/80">{postcard.caption}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventPostcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    eventId: id,
    page,
    limit: LIMIT,
    ...(phase !== "all" ? { phase } : {}),
  });

  const postcards: Postcard[] = postcardsData?.data ?? [];
  const meta = postcardsData?.meta;
  const eventName = eventDetails?.data?.name ?? "Event";

  // Show only postcards that have at least one media item with a real mediaUrl
  const gridItems = postcards.filter(
    (p) => (p.media ?? []).some((m) => !!m.mediaUrl)
  );

  const handlePhaseChange = (value: string) => {
    setPhase(value as Phase);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Go back"
          >
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

      {/* Grid */}
      <div className="px-0.5 pt-1">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : gridItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No postcards{phase !== "all" ? ` for ${phase}` : ""} yet.
            </p>
          </div>
        ) : (
          <>
            {/* Instagram-style 3-col grid */}
            <div className="grid grid-cols-3 gap-0.5">
              {gridItems.map((postcard, index) => {
                const primaryMedia = postcard.media?.[0];
                const src = primaryMedia?.mediaUrl ?? "";
                const isVideo = primaryMedia?.mediaType === "VIDEO";
                const hasMultiple = (postcard.media?.length ?? 0) > 1;

                return (
                  <div
                    key={postcard.id ?? index}
                    onClick={() => setSelectedPostcard(postcard)}
                    className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={src}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        {/* Centered play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <Image
                        src={src}
                        alt="postcard"
                        fill
                        className="object-cover"
                        sizes="33vw"
                      />
                    )}

                    {/* Multiple media indicator — top right */}
                    {hasMultiple && (
                      <div className="absolute top-1.5 right-1.5">
                        <svg className="h-4 w-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H7zM3 7a2 2 0 012-2v-.5A2.5 2.5 0 002.5 7H3zm0 0v8a2 2 0 002 2H4.5A2.5 2.5 0 012 14.5V7h1z" />
                        </svg>
                      </div>
                    )}

                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {meta?.hasNext && (
              <div className="flex justify-center pt-6 pb-2">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instagram-style viewer */}
      {selectedPostcard && (
        <PostcardViewer
          postcard={selectedPostcard}
          eventId={id}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
