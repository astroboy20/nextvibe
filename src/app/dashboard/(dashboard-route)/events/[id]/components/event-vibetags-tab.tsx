/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Tag, Heart, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostcardCreator } from "./postcard-creator";
import { AttendeePostcardLeaderboard } from "./attendee-postcard-creator";
import { toast } from "sonner";
import {
  useGetVibeTagsQuery,
  useGetEventPostcardsQuery,
  useToggleLikePostcardMutation,
} from "@/app/provider/api/eventApi";

interface EventVibeTagsTabProps {
  eventId?: string;
}

export function EventVibeTagsTab({ eventId }: EventVibeTagsTabProps) {
  const [activePhase, setActivePhase] = useState<"all" | "pre-event" | "main-event">("all");
  const [showCreator, setShowCreator] = useState(false);
  const [activeVibeTagId, setActiveVibeTagId] = useState<string | null>(null);

  // ── API calls ──────────────────────────────────────────────────────────────
  const { data: vibeTagsData, isLoading: isLoadingTags } = useGetVibeTagsQuery(
    eventId ?? "",
    { skip: !eventId }
  );

  const { data: postcardsData, isLoading: isLoadingPostcards } =
    useGetEventPostcardsQuery(
      { eventId: eventId ?? "", phase: activePhase },
      { skip: !eventId }
    );

  const [toggleLike] = useToggleLikePostcardMutation();

  // ── Derived data ───────────────────────────────────────────────────────────
  const availableVibeTags: any[] = vibeTagsData?.data ?? [];

  // Auto-select first tag if none selected yet
  const activeVibeTag =
    availableVibeTags.find((t) => t.id === activeVibeTagId) ??
    availableVibeTags[0] ??
    null;

  const postcards: any[] = postcardsData?.data ?? [];

  const vibeTagOverlay = activeVibeTag
    ? { designUrl: activeVibeTag.design_url, name: activeVibeTag.name }
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
          vibeTagName={activeVibeTag?.name ?? "Event VibeTag"}
          vibeTagOverlay={vibeTagOverlay}
          eventName="Event"
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
                  {isLoadingTags
                    ? "Loading..."
                    : activeVibeTag?.name ?? "No VibeTag set"}
                </p>
              </div>
            </div>

            {/* VibeTag selector — shown when multiple exist */}
            {availableVibeTags.length > 1 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Available VibeTags
                </p>
                <div className="flex gap-2 flex-wrap">
                  {availableVibeTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setActiveVibeTagId(tag.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                        activeVibeTag?.id === tag.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VibeTag Preview */}
            <div className="relative aspect-[4/5] w-full max-w-[200px] mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-1">
              <div className="relative h-full w-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                {isLoadingTags ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : activeVibeTag?.design_url?.startsWith("http") ? (
                  <img
                    src={activeVibeTag.design_url}
                    alt={activeVibeTag.name}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                  />
                ) : null}
                <div className="text-center p-4">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-sm text-foreground">
                    {activeVibeTag?.name ?? "VibeTag"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your photo here
                  </p>
                </div>
              </div>
            </div>

            {activeVibeTag && (
              <Badge
                variant="outline"
                className="mb-3 w-full justify-center gap-1 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                This VibeTag will be applied to your postcards
              </Badge>
            )}

            <Button
              className="w-full rounded-xl gap-2"
              onClick={() => setShowCreator(true)}
            >
              <Camera className="h-4 w-4" />
              Create Your Postcard
            </Button>
          </CardContent>
        </Card>

        {/* ── Phase Filter ── */}
        <Tabs
          value={activePhase}
          onValueChange={(v) => setActivePhase(v as typeof activePhase)}
        >
          <TabsList className="w-full grid grid-cols-3 h-10">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="pre-event" className="text-xs">
              Pre-Event
            </TabsTrigger>
            <TabsTrigger value="main-event" className="text-xs">
              Main Event
            </TabsTrigger>
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
            <div className="grid grid-cols-2 gap-3">
              {postcards.map((postcard: any, index: number) => (
                <div
                  key={postcard._id ?? postcard.id ?? index}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={postcard.imageUrl ?? postcard.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {postcard.phase && (
                    <Badge
                      className={cn(
                        "absolute top-2 left-2 text-[10px]",
                        postcard.phase === "pre-event"
                          ? "bg-amber-500/90 text-white"
                          : "bg-primary/90 text-primary-foreground"
                      )}
                    >
                      {postcard.phase === "pre-event" ? "Pre" : "Main"}
                    </Badge>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-medium text-white mb-1">
                      {postcard.user?.name ?? postcard.author ?? ""}
                    </p>
                    <div className="flex items-center gap-3 text-white/80">
                      <button
                        onClick={() =>
                          handleLike(postcard._id ?? postcard.id)
                        }
                        className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors"
                        aria-label="Like postcard"
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        {postcard.likes ?? 0}
                      </button>
                      <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {postcard.comments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingPostcards && postcards.length > 0 && (
            <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
              View All Postcards
            </button>
          )}
        </div>

        {/* ── Postcard Leaderboard ── */}
        <AttendeePostcardLeaderboard
          eventId={eventId}
          showEngagement={true}
        />
      </div>
    </>
  );
}
