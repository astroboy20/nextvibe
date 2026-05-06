/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Tag, Heart, MessageCircle, Sparkles } from "lucide-react";
import { PostcardCreator, type VibeTagOverlay } from "./postcard-creator";
import { AttendeePostcardLeaderboard } from "./attendee-postcard-creator";
import { toast } from "sonner";
import {
  useGetEventPostcardsQuery,
  useToggleLikePostcardMutation,
} from "@/app/provider/api/eventApi";

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

type ActivityTiming = "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH";

const TIMING_ORDER: ActivityTiming[] = [
  "PRE_EVENT",
  "DURING_EVENT",
  "POST_EVENT",
  "BOTH",
];

const TIMING_META: Record<ActivityTiming, { label: string; phase: string }> = {
  PRE_EVENT: { label: "Pre-Event", phase: "pre-event" },
  DURING_EVENT: { label: "Main Event", phase: "main-event" },
  POST_EVENT: { label: "Post-Event", phase: "post-event" },
  BOTH: { label: "All Phases", phase: "all" },
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

export function EventVibeTagsTab({
  eventId,
  vibeTag,
  eventName = "Event",
  eventStartsAt,
}: EventVibeTagsTabProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [activeTiming, setActiveTiming] = useState<ActivityTiming | null>(null);

  const eventHasStarted = eventStartsAt ? new Date() >= new Date(eventStartsAt) : true;

  const allTags: VibeTag[] = Array.isArray(vibeTag) ? vibeTag : [];

  const availableTimings: ActivityTiming[] = TIMING_ORDER.filter((t) =>
    allTags.some((tag) => tag.activityTiming === t)
  );

  const resolvedTiming: ActivityTiming | null =
    activeTiming && availableTimings.includes(activeTiming)
      ? activeTiming
      : availableTimings[0] ?? null;

  const activeTag: VibeTag | null = resolvedTiming
    ? allTags.find((t) => t.activityTiming === resolvedTiming) ?? null
    : allTags[0] ?? null;

  const activePhase = resolvedTiming
    ? TIMING_META[resolvedTiming].phase
    : "all";

  const { data: postcardsData, isLoading: isLoadingPostcards } =
    useGetEventPostcardsQuery(
      { eventId: eventId ?? "", phase: activePhase },
      { skip: !eventId }
    );
  const [toggleLike] = useToggleLikePostcardMutation();

  const postcards: any[] = postcardsData?.data?.data ?? [];

  const vibeTagOverlay: VibeTagOverlay | null = activeTag?.imageUrl
    ? { imageUrl: activeTag.imageUrl, name: activeTag.name }
    : null;

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
          vibeTagName={activeTag?.name ?? "Event VibeTag"}
          vibeTagOverlay={vibeTagOverlay}
          vibeTagId={activeTag?.id}
          eventName={eventName}
          eventId={eventId}
          onClose={() => setShowCreator(false)}
          onSubmit={() => {
            toast.success("Your memory has been added to the event gallery");
            setShowCreator(false);
          }}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {availableTimings.length > 1 && (
          <Tabs
            value={resolvedTiming ?? availableTimings[0]}
            onValueChange={(v) => setActiveTiming(v as ActivityTiming)}
          >
            <TabsList
              className="w-full grid h-10"
              style={{
                gridTemplateColumns: `repeat(${availableTimings.length}, 1fr)`,
              }}
            >
              {availableTimings.map((timing) => (
                <TabsTrigger key={timing} value={timing} className="text-xs">
                  {TIMING_META[timing].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <Card className="overflow-hidden bg-linear-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {resolvedTiming
                    ? `${TIMING_META[resolvedTiming].label} VibeTag`
                    : "Event VibeTag"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTag?.name ?? "No VibeTag set for this event"}
                </p>
              </div>
              {resolvedTiming && (
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] border-primary/40 text-primary"
                >
                  {TIMING_META[resolvedTiming].label}
                </Badge>
              )}
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative w-40 aspect-3/4 rounded-2xl overflow-hidden bg-linear-to-br from-primary via-accent to-primary p-1">
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

            {/* Lock DURING_EVENT until event starts */}
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
              onClick={() => activeTag && setShowCreator(true)}
            >
              <Camera className="h-4 w-4" />
              Create Your Postcard
            </Button>
          </CardContent>
        </Card>

        <div>
          {!isLoadingPostcards && postcards.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {postcards.map((postcard: any, index: number) => {
                  const src = resolveMediaUrl(postcard?.media?.[0]);
                  const authorName =
                    postcard?.author?.displayName ??
                    postcard?.author?.username ??
                    "";
                  if (!src) return null;
                  return (
                    <div
                      key={postcard?.id ?? index}
                      className="group relative aspect-3/4 overflow-hidden rounded-2xl animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <img
                        src={src}
                        alt={postcard?.caption ?? ""}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
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
                })}
              </div>
              <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
                View All Postcards
              </button>
            </>
          )}
        </div>

        <AttendeePostcardLeaderboard eventId={eventId} showEngagement={true} />
      </div>
    </>
  );
}
