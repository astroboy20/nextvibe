/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Tag, Heart, MessageCircle, Sparkles, ImageOff, Loader2, RefreshCw } from "lucide-react";
import { PostcardCreator, type VibeTagOverlay } from "./postcard-creator";
import { AttendeePostcardLeaderboard } from "./attendee-postcard-creator";
import { toast } from "sonner";
import {
  PostcardViewer,
  type PostcardData,
} from "@/components/postcard-viewer";
import {
  useGetEventPostcardsQuery,
  useToggleLikePostcardMutation,
} from "@/app/provider/api/eventApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Cookies from "js-cookie";

type ActivityTiming = "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" ;

const TIMING_META: Record<ActivityTiming, { label: string; phase: string }> = {
  PRE_EVENT: { label: "Pre-Event", phase: "pre-event" },
  DURING_EVENT: { label: "Main Event", phase: "main-event" },
  POST_EVENT: { label: "Post-Event", phase: "post-event" },
};

interface VibeTag {
  id: string;
  name: string;
  imageUrl: string;
  activityTiming?: string;
}

interface EventVibeTagsTabProps {
  eventId?: string;
  vibeTag?: VibeTag[] | null;
  eventName?: string;
  eventStartsAt?: string | null;
}

const TIMING_PILL: Record<string, { label: string; color: string }> = {
  PRE_EVENT: { label: "Pre", color: "bg-amber-400 text-white" },
  DURING_EVENT: { label: "Main", color: "bg-primary text-white" },
  POST_EVENT: { label: "Post", color: "bg-emerald-500 text-white" },
  BOTH: { label: "All", color: "bg-violet-500 text-white" },
};

/** Single postcard tile — renders actual postcard media */
function PostcardTile({
  postcard, vibeTagMap, onLike, onClick,
}: {
  postcard: any; vibeTagMap: Record<string, VibeTag>; onLike: (id: string) => void; onClick: () => void;
}) {
  const tag = vibeTagMap[postcard?.vibeTagId];
  const timing: string = tag?.activityTiming ?? "";
  const pill = TIMING_PILL[timing];
  const authorName = postcard?.author?.displayName ?? postcard?.author?.username ?? "";

  const storageBase = process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? "http://minio-production-5cff.up.railway.app:443/nextvibe";
  const mediaItems: any[] = postcard?.media ?? [];
  const firstMedia = mediaItems[0];
  const src = firstMedia?.mediaUrl
    ? firstMedia.mediaUrl
    : firstMedia?.storageKey ? `${storageBase}/${firstMedia.storageKey}` : tag?.imageUrl ?? "";
  const isVideo = firstMedia?.mediaType === "VIDEO";

  if (!src) return null;

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl animate-fade-in cursor-pointer" onClick={onClick}>
      {isVideo ? (
        <video src={src} muted loop playsInline className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      ) : (
        <img src={src} alt={tag?.name ?? "Postcard"} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      )}
      {pill && (
        <span className={`absolute top-2 left-2 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${pill.color}`}>
          {pill.label}
        </span>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {authorName && <p className="mb-1 truncate text-xs font-medium text-white">@{authorName}</p>}
        <div className="flex items-center gap-3 text-white/80">
          <button onClick={(e) => { e.stopPropagation(); onLike(postcard?.id); }}
            className="flex items-center gap-1 text-xs transition-colors hover:text-red-400" aria-label="Like postcard">
            <Heart className="h-3.5 w-3.5 fill-current" />
            {postcard?.likeCount ?? 0}
          </button>
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="h-3.5 w-3.5" />
            {postcard?.commentCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Fetches postcards for one phase and renders the grid */
function PhasePostcards({
  eventId, phase, vibeTagMap, onLike, onSelect,
}: {
  eventId: string; phase: string; vibeTagMap: Record<string, VibeTag>;
  onLike: (id: string) => void; onSelect: (p: any) => void;
}) {
  const { data, isLoading } = useGetEventPostcardsQuery(
    { eventId, phase: phase === "all" ? undefined : phase },
    { skip: !eventId }
  );

  const rawList: any[] = data?.data?.data ?? data?.data ?? [];
  const postcards: any[] = rawList.filter((p: any) =>
    (p?.media ?? []).some((m: any) => !!m.mediaUrl)
  );

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      {postcards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No postcards yet for this phase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {postcards.map((postcard: any, index: number) => (
            <PostcardTile
              key={postcard?.id ?? index}
              postcard={postcard}
              vibeTagMap={vibeTagMap}
              onLike={onLike}
              onClick={() => onSelect(postcard)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function EventVibeTagsTab({
  eventId,
  vibeTag,
  eventName = "Event",
  eventStartsAt,
}: EventVibeTagsTabProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [activeTiming, setActiveTiming] = useState<ActivityTiming>("PRE_EVENT");
  const [postcardPhase, setPostcardPhase] = useState<string>("all");
  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(null);

  // Same query as PhasePostcards — RTK Query deduplicates the request, no extra network call
  const { data: countData } = useGetEventPostcardsQuery(
    { eventId: eventId ?? "", phase: postcardPhase === "all" ? undefined : postcardPhase },
    { skip: !eventId }
  );
  const countRaw: any[] = countData?.data?.data ?? countData?.data ?? [];
  const postcardCount = countRaw.filter((p: any) =>
    (p?.media ?? []).some((m: any) => !!m.mediaUrl)
  ).length;

  const eventHasStarted = eventStartsAt
    ? new Date() >= new Date(eventStartsAt)
    : true;

  const allTags: VibeTag[] = Array.isArray(vibeTag) ? vibeTag : [];

  const timingTabs: ActivityTiming[] = ["PRE_EVENT", "DURING_EVENT", "POST_EVENT"];

  const resolvedTiming: ActivityTiming = activeTiming;

  const activeTag: VibeTag | null =
    allTags.find((t) => t.activityTiming === resolvedTiming) ??
    allTags[0] ??
    null;

  const [toggleLike] = useToggleLikePostcardMutation();
  const requireAuth = useRequireAuth();

  // Build a lookup map: vibeTagId → VibeTag so tiles can resolve image + timing
  const vibeTagMap: Record<string, VibeTag> = Object.fromEntries(
    allTags.map((t) => [t.id, t])
  );

  const vibeTagOverlay: VibeTagOverlay | null = activeTag?.imageUrl
    ? { imageUrl: activeTag.imageUrl, name: activeTag.name }
    : null;

  const handleLike = async (postcardId: string) => {
    if (!eventId) return;
    if (!requireAuth({ tab: "postcard" })) return;
    try {
      await toggleLike({ eventId, postcardId }).unwrap();
    } catch {
      toast.error("Could not like postcard. Try again.");
    }
  };

  // ── Swap state ────────────────────────────────────────────────────────────
  const [showSwapPicker, setShowSwapPicker] = useState(false);
  const [swapPostcardId, setSwapPostcardId] = useState<string | undefined>(undefined);
  const [swapLikeCount, setSwapLikeCount] = useState(0);
  const [swapCommentCount, setSwapCommentCount] = useState(0);

  // Fetch the current user's postcards for the swap picker
  const currentUserId = typeof window !== "undefined" && Cookies.get("accessToken") ? "me" : null;
  const { data: myPostcardsData } = useGetEventPostcardsQuery(
    { eventId: eventId ?? "", limit: 50 },
    { skip: !eventId || !currentUserId }
  );
  const myPostcardsRaw: any[] = myPostcardsData?.data?.data ?? myPostcardsData?.data ?? [];

  const handleCreatePostcard = () => {
    if (!activeTag) return;
    // Check if the cap is hit — show swap picker instead of normal creator
    if (myPostcardsRaw.length >= 20) {
      setShowSwapPicker(true);
    } else {
      setSwapPostcardId(undefined);
      setShowCreator(true);
    }
  };

  const handlePickSwapTarget = (postcard: any) => {
    setSwapPostcardId(postcard.id);
    setSwapLikeCount(postcard.likeCount ?? 0);
    setSwapCommentCount(postcard.commentCount ?? 0);
    setShowSwapPicker(false);
    setShowCreator(true);
  };

  return (
    <>
      {showCreator && (
        <PostcardCreator
          vibeTagName={activeTag?.name ?? "Event VibeTag"}
          vibeTagOverlay={vibeTagOverlay}
          vibeTagId={activeTag?.id}
          eventName={eventName}
          eventId={eventId}
          onClose={() => { setShowCreator(false); setSwapPostcardId(undefined); }}
          onSubmit={() => {
            toast.success(swapPostcardId ? "Postcard replaced!" : "Your memory has been added to the event gallery");
            setShowCreator(false);
            setSwapPostcardId(undefined);
          }}
          swapPostcardId={swapPostcardId}
          swapLikeCount={swapLikeCount}
          swapCommentCount={swapCommentCount}
        />
      )}

      {/* Swap picker bottom sheet */}
      {showSwapPicker && (
        <div className="fixed inset-0 z-[100001] flex flex-col bg-background" style={{ height: "100dvh" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <button
              onClick={() => setShowSwapPicker(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium">Cancel</span>
            </button>
            <div className="text-center">
              <h2 className="font-semibold text-sm">Replace a Postcard</h2>
              <p className="text-[11px] text-muted-foreground">You&apos;ve hit the 20-postcard limit</p>
            </div>
            <div className="w-16" />
          </div>
          <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Pick a postcard to replace with your new one. Its likes and comments will be removed.
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {myPostcardsRaw.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No postcards found to replace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myPostcardsRaw.map((postcard: any) => {
                  const storageBase = process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? "http://minio-production-5cff.up.railway.app:443/nextvibe";
                  const firstMedia = postcard?.media?.[0];
                  const src = firstMedia?.mediaUrl
                    ? firstMedia.mediaUrl
                    : firstMedia?.storageKey ? `${storageBase}/${firstMedia.storageKey}` : "";
                  const isVideo = firstMedia?.mediaType === "VIDEO";
                  if (!src) return null;
                  return (
                    <div
                      key={postcard.id}
                      className="relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer ring-2 ring-transparent hover:ring-destructive transition-all"
                      onClick={() => handlePickSwapTarget(postcard)}
                    >
                      {isVideo ? (
                        <video src={src} muted playsInline className="h-full w-full object-cover" />
                      ) : (
                        <img src={src} alt="Postcard" className="h-full w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="flex items-center gap-2 text-white/80">
                          <span className="flex items-center gap-0.5 text-xs">
                            <Heart className="h-3 w-3 fill-current" />
                            {postcard.likeCount ?? 0}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs">
                            <MessageCircle className="h-3 w-3" />
                            {postcard.commentCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6 animate-fade-in">

        {/* Phase tabs — controls both the vibeTag card and postcards below */}
        <Tabs
          value={resolvedTiming}
          onValueChange={(v) => setActiveTiming(v as ActivityTiming)}
        >
          <TabsList className="w-full grid grid-cols-3 h-10">
            {timingTabs.map((timing) => (
              <TabsTrigger key={timing} value={timing} className="text-xs">
                {TIMING_META[timing].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* VibeTag info card — updates when tab changes */}
        <Card className="overflow-hidden bg-linear-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {TIMING_META[resolvedTiming].label} VibeTag
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTag?.name ?? "No VibeTag set for this event"}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] border-primary/40 text-primary"
              >
                {TIMING_META[resolvedTiming].label}
              </Badge>
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-linear-to-br from-primary via-accent to-primary p-1">
                <div className="relative h-full w-full rounded-xl bg-background overflow-hidden flex items-center justify-center">
                  {activeTag?.imageUrl ? (
                    <img
                      src={activeTag.imageUrl}
                      alt={activeTag.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm text-foreground">
                        VibeTag
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No VibeTag set
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {activeTag && (
              <Badge
                variant="outline"
                className="mb-3 w-full justify-center gap-1 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                This VibeTag will be applied to your postcards
              </Badge>
            )}

            {resolvedTiming === "DURING_EVENT" && !eventHasStarted && (
              <div className="mb-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Event hasn&apos;t started yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This VibeTag unlocks once the main event begins.
                </p>
              </div>
            )}

            <Button
              className="w-full rounded-xl gap-2"
              disabled={
                !activeTag ||
                (resolvedTiming === "DURING_EVENT" && !eventHasStarted)
              }
              onClick={() => {
                if (!activeTag) return;
                handleCreatePostcard();
              }}
            >
              <Camera className="h-4 w-4" />
              Create Your Postcard
            </Button>
          </CardContent>
        </Card>

        {/* Postcards section — has its own phase tabs, independent from the vibeTag card above */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Event Postcards</h3>
            {postcardCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {postcardCount} postcard{postcardCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <Tabs
            value={postcardPhase}
            onValueChange={setPostcardPhase}
          >
            <TabsList className="w-full grid grid-cols-4 h-10">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="pre-event" className="text-xs">Pre</TabsTrigger>
              <TabsTrigger value="main-event" className="text-xs">Main</TabsTrigger>
              <TabsTrigger value="post-event" className="text-xs">Post</TabsTrigger>
            </TabsList>
          </Tabs>

          {eventId && (
            <PhasePostcards
              eventId={eventId}
              phase={postcardPhase}
              vibeTagMap={vibeTagMap}
              onLike={handleLike}
              onSelect={(p) => setSelectedPostcard(p)}
            />
          )}
        </div>

        <AttendeePostcardLeaderboard eventId={eventId} showEngagement={true} />
      </div>

      {selectedPostcard && eventId && (
        <PostcardViewer
          postcard={selectedPostcard}
          eventId={eventId}
          eventName={eventName}
          onClose={() => setSelectedPostcard(null)}
          zIndex={60}
        />
      )}
    </>
  );
}
