/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Tag, Heart, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostcardCreator, type VibeTagOverlay } from "./postcard-creator";
import { AttendeePostcardLeaderboard } from "./attendee-postcard-creator";
import { toast } from "sonner";
import {
  useGetEventPostcardsQuery,
  useToggleLikePostcardMutation,
} from "@/app/provider/api/eventApi";

// Minio base — resolves storageKey → full URL when mediaUrl is null
const STORAGE_BASE =
  process.env.NEXT_PUBLIC_STORAGE_BASE_URL ??
  "http://minio-production-5cff.up.railway.app:443/nextvibe";

function resolveMediaUrl(media?: {
  mediaUrl?: string | null;
  storageKey?: string | null;
}): string {
  if (media?.mediaUrl) return media.mediaUrl;
  if (media?.storageKey) return `${STORAGE_BASE}/${media.storageKey}`;
  return "";
}

interface VibeTag {
  id: string;
  name: string;
  imageUrl: string;
}

interface EventVibeTagsTabProps {
  eventId?: string;
  vibeTag?: VibeTag | null;
  eventName?: string;
}

export function EventVibeTagsTab({
  eventId,
  vibeTag,
  eventName = "Event",
}: EventVibeTagsTabProps) {
  const [activePhase, setActivePhase] = useState<"all" | "pre-event" | "main-event">("all");
  const [showCreator, setShowCreator] = useState(false);

  // ── API calls ──────────────────────────────────────────────────────────────
  const { data: postcardsData, isLoading: isLoadingPostcards } =
    useGetEventPostcardsQuery(
      { eventId: eventId ?? "", phase: activePhase },
      { skip: !eventId }
    );

  const [toggleLike] = useToggleLikePostcardMutation();

  // ── Derived data ───────────────────────────────────────────────────────────
  // Response shape: { data: { data: [], meta: {} } }
  const postcards: any[] = postcardsData?.data?.data ?? [];

  const vibeTagOverlay: VibeTagOverlay | null =
    vibeTag?.imageUrl
      ? { imageUrl: vibeTag.imageUrl, name: vibeTag.name }
      : null;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePostcardSubmit = () => {
    toast.success("Your memory has been added to the event gallery");
    setShowCreator(false);
  };

  const handleLike = async (postcardId: string) => {
    if (!eventId) return;
    try {
      await toggleLike({ eventId, postcardId }).unwrap();
    } catch {
      toast.error("Could not like postcard. Try again.");
    }
  };

  return (
    <>
      {showCreator && (
        <PostcardCreator
          vibeTagName={vibeTag?.name ?? "Event VibeTag"}
          vibeTagOverlay={vibeTagOverlay}
          vibeTagId={vibeTag?.id}
          eventName={eventName}
          eventId={eventId}
          onClose={() => setShowCreator(false)}
          onSubmit={handlePostcardSubmit}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {/* ── VibeTag Display ── */}
        <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Event VibeTag</h3>
                <p className="text-sm text-muted-foreground">
                  {vibeTag?.name ?? "No VibeTag set for this event"}
                </p>
              </div>
            </div>

            {/* VibeTag Preview */}
            <div className="flex justify-center mb-4">
              <div className="relative w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-1">
                <div className="relative h-full w-full rounded-xl bg-background overflow-hidden flex items-center justify-center">
                  {vibeTag?.imageUrl ? (
                    <img
                      src={vibeTag.imageUrl}
                      alt={vibeTag?.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm text-foreground">VibeTag</p>
                      <p className="text-xs text-muted-foreground mt-1">No VibeTag set</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {vibeTag && (
              <Badge variant="outline" className="mb-3 w-full justify-center gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                This VibeTag will be applied to your postcards
              </Badge>
            )}

            {vibeTag ? (
              <Button className="w-full rounded-xl gap-2" onClick={() => setShowCreator(true)}>
                <Camera className="h-4 w-4" />
                Create Your Postcard
              </Button>
            ) : (
              <Button className="w-full rounded-xl gap-2" disabled title="Create a VibeTag first">
                <Camera className="h-4 w-4" />
                Create Your Postcard
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── Phase Filter ── */}
        <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as typeof activePhase)}>
          <TabsList className="w-full grid grid-cols-3 h-10">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="pre-event" className="text-xs">Pre-Event</TabsTrigger>
            <TabsTrigger value="main-event" className="text-xs">Main Event</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ── Postcards Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Event Postcards</h3>
            {!isLoadingPostcards && (
              <span className="text-sm text-muted-foreground">
                {postcards.length} postcards
              </span>
            )}
          </div>

          {isLoadingPostcards && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!isLoadingPostcards && postcards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <Camera className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No postcards yet. Be the first to create one!
              </p>
            </div>
          )}

          {!isLoadingPostcards && postcards.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {postcards.map((postcard: any, index: number) => {
                  const primaryMedia = postcard?.media?.[0];
                  const src = resolveMediaUrl(primaryMedia);
                  const authorName =
                    postcard?.author?.displayName ??
                    postcard?.author?.username ??
                    "";
                  const likeCount = postcard?.likeCount ?? 0;
                  const commentCount = postcard?.commentCount ?? 0;

                  if (!src) return null;

                  return (
                    <div
                      key={postcard?.id ?? index}
                      className="group relative aspect-[3/4] overflow-hidden rounded-2xl animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <img
                        src={src}
                        alt={postcard?.caption ?? ""}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        {authorName && (
                          <p className="text-xs font-medium text-white mb-1 truncate">
                            @{authorName}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-white/80">
                          <button
                            onClick={() => handleLike(postcard?.id)}
                            className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors"
                            aria-label="Like postcard"
                          >
                            <Heart className="h-3.5 w-3.5 fill-current" />
                            {likeCount}
                          </button>
                          <span className="flex items-center gap-1 text-xs">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
                View All Postcards
              </button>
            </>
          )}
        </div>

        {/* ── Postcard Leaderboard ── */}
        <AttendeePostcardLeaderboard eventId={eventId} showEngagement={true} />
      </div>
    </>
  );
}
