/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Tag, Heart, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostcardCreator } from "@/components/postcard/PostcardCreator";
import { useToast } from "@/hooks/use-toast";
import { AttendeePostcardLeaderboard } from "./AttendeePostcardLeaderboard";
import { useVibeTagStorage } from "@/hooks/use-vibetag-storage";

interface Postcard {
  id: string;
  image: string;
  author: string;
  likes: number;
  comments: number;
  phase: "pre-event" | "main-event";
}

const mockPostcards: Postcard[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=400&fit=crop",
    author: "@chioma",
    likes: 42,
    comments: 8,
    phase: "pre-event",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=400&fit=crop",
    author: "@tunde",
    likes: 36,
    comments: 5,
    phase: "pre-event",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=400&fit=crop",
    author: "@ngozi",
    likes: 28,
    comments: 3,
    phase: "main-event",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=400&fit=crop",
    author: "@ade",
    likes: 51,
    comments: 12,
    phase: "main-event",
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=400&fit=crop",
    author: "@funke",
    likes: 19,
    comments: 2,
    phase: "pre-event",
  },
  {
    id: "6",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop",
    author: "@kola",
    likes: 33,
    comments: 7,
    phase: "main-event",
  },
];

interface EventVibeTagsTabProps {
  eventId?: string;
}

export function EventVibeTagsTab({ eventId }: EventVibeTagsTabProps) {
  const { toast } = useToast();
  const { fetchVibeTags } = useVibeTagStorage();
  const [activePhase, setActivePhase] = useState<
    "all" | "pre-event" | "main-event"
  >("all");
  const [showCreator, setShowCreator] = useState(false);
  const [activeVibeTag, setActiveVibeTag] = useState<{
    name: string;
    designUrl: string;
    phase: string;
  } | null>(null);
  const [availableVibeTags, setAvailableVibeTags] = useState<any[]>([]);

  useEffect(() => {
    const loadVibeTags = async () => {
      const tags = await fetchVibeTags(eventId);
      setAvailableVibeTags(tags);
      // Auto-select the first active vibetag
      if (tags.length > 0) {
        setActiveVibeTag({
          name: tags[0].name,
          designUrl: tags[0].design_url,
          phase: tags[0].phase,
        });
      }
    };
    loadVibeTags();
  }, [eventId, fetchVibeTags]);

  const filteredPostcards =
    activePhase === "all"
      ? mockPostcards
      : mockPostcards.filter((p) => p.phase === activePhase);

  const vibeTagOverlay = activeVibeTag
    ? { designUrl: activeVibeTag.designUrl, name: activeVibeTag.name }
    : null;

  const handlePostcardSubmit = () => {
    toast({
      title: "Postcard shared! 🎉",
      description: "Your memory has been added to the event gallery",
    });
    setShowCreator(false);
  };

  return (
    <>
      {showCreator && (
        <PostcardCreator
          vibeTagName={activeVibeTag?.name || "Event VibeTag"}
          vibeTagOverlay={vibeTagOverlay}
          eventName="Detty December 2025"
          onClose={() => setShowCreator(false)}
          onSubmit={handlePostcardSubmit}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {/* VibeTag Display */}
        <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Event VibeTag</h3>
                <p className="text-sm text-muted-foreground">
                  {activeVibeTag?.name || "No VibeTag set"}
                </p>
              </div>
            </div>

            {/* VibeTag selector if multiple exist */}
            {availableVibeTags.length > 1 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Available VibeTags
                </p>
                <div className="flex gap-2 flex-wrap">
                  {availableVibeTags.map((tag: any) => (
                    <button
                      key={tag.id}
                      onClick={() =>
                        setActiveVibeTag({
                          name: tag.name,
                          designUrl: tag.design_url,
                          phase: tag.phase,
                        })
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                        activeVibeTag?.name === tag.name
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
            <div className="relative aspect-video w-full max-w-full mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-1">
              <div className="relative h-full w-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                {activeVibeTag?.designUrl?.startsWith("http") ? (
                  <img
                    src={activeVibeTag.designUrl}
                    alt={activeVibeTag.name}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                  />
                ) : null}
                <div className="text-center p-4">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-display text-sm font-bold text-foreground">
                    {activeVibeTag?.name || "VibeTag"}
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

        {/* Phase Filter */}
        <Tabs
          value={activePhase}
          onValueChange={(v) => setActivePhase(v as any)}
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

        {/* Postcards Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Event Postcards</h3>
            <span className="text-sm text-muted-foreground">
              {filteredPostcards.length} postcards
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredPostcards.map((postcard, index) => (
              <div
                key={postcard.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={postcard.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

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

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-medium text-white mb-1">
                    {postcard.author}
                  </p>
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="flex items-center gap-1 text-xs">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      {postcard.likes}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {postcard.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
            View All Postcards
          </button>
        </div>

        {/* Postcard Leaderboard */}
        <AttendeePostcardLeaderboard showEngagement={true} />
      </div>
    </>
  );
}
