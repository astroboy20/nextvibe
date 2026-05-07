/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Gamepad2,
  Heart,
  ImageOff,
  Locate,
  MapPin,
  MessageCircle,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  useGetEventsQuery,
  useGetPostcardsQuery,
} from "@/app/provider/api/eventApi";
import { useEventDiscovery } from "@/hooks/use-event-dicovery";
import ViewToggle from "../components/view-toggle";
import { EventCard } from "../components/event-card";
import { PostcardItem } from "../components/postcard-grid";
import Image from "next/image";

const INTEREST_OPTIONS = [
  "music",
  "tech",
  "party",
  "art",
  "food",
  "fitness",
  "travel",
  "nightlife",
  "festival",
  "wedding",
];

const Discover = () => {
  const router = useRouter();
  const { data: eventsData, isLoading: isLoadingEvents } = useGetEventsQuery();
  const { userInterests } = useEventDiscovery();

  const [activeView, setActiveView] = useState<"events" | "postcards">(
    "events"
  );
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "nearby">(
    "foryou"
  );
  const [locationFilter, setLocationFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [vibeFilter, setVibeFilter] = useState("");
  const [autoLocating, setAutoLocating] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [postcardPhase, setPostcardPhase] = useState<
    "all" | "pre-event" | "main-event"
  >("all");

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const { data: postcardsData, isLoading: isLoadingPostcards } =
    useGetPostcardsQuery(
      {
        page: 1,
        limit: 40,
        ...(postcardPhase !== "all" ? { phase: postcardPhase } : {}),
      },
      { skip: activeView !== "postcards" }
    );

  const postcards = postcardsData?.data?.data ?? [];

  // Restore saved location on mount
  useEffect(() => {
    const stored = localStorage.getItem("nextvibe_location");
    if (stored) {
      try {
        const loc = JSON.parse(stored);
        setLocationFilter(loc.city || loc.country || "");
      } catch {}
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setAutoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "";
          const country = data.address?.country || "";
          const value = city || country;
          setLocationFilter(value);
          localStorage.setItem(
            "nextvibe_location",
            JSON.stringify({ city, country })
          );
        } catch {}
        setAutoLocating(false);
      },
      () => setAutoLocating(false),
      { timeout: 8000 }
    );
  };

  const clearFilters = () => {
    setLocationFilter("");
    setInterestFilter("");
    setVibeFilter("");
    setActiveFilters([]);
    localStorage.removeItem("nextvibe_location");
  };

  const hasFilters =
    locationFilter || interestFilter || vibeFilter || activeFilters.length > 0;

  const allEvents: any[] = eventsData?.data?.data ?? [];

  const filteredEvents = useMemo(() => {
    let list =
      activeTab === "trending"
        ? [...allEvents].sort((a, b) => (b.attendees ?? 0) - (a.attendees ?? 0))
        : activeTab === "nearby" && locationFilter
        ? [...allEvents].sort((a) =>
            (a.locationName ?? "")
              .toLowerCase()
              .includes(locationFilter.toLowerCase())
              ? -1
              : 1
          )
        : allEvents;

    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      list = list.filter((e) =>
        (e.locationName ?? "").toLowerCase().includes(l)
      );
    }

    if (interestFilter) {
      const i = interestFilter.toLowerCase().replace(/-/g, " ");
      list = list.filter(
        (e) =>
          (e.name ?? "").toLowerCase().includes(i) ||
          (e.locationName ?? "").toLowerCase().includes(i) ||
          (e.category ?? "").toLowerCase().includes(i)
      );
    }

    if (vibeFilter) {
      list = list.filter((e) => e.hasVibetag);
    }

    if (activeFilters.includes("games")) {
      list = list.filter((e) => e.hasGame);
    }
    if (activeFilters.includes("vibetag")) {
      list = list.filter((e) => e.hasVibetag);
    }
    if (activeFilters.includes("free")) {
      list = list.filter((e) => !e.isPaid && !e.ticketPrice);
    }
    if (activeFilters.includes("soon")) {
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      list = list.filter((e) => {
        const start = new Date(e.startsAt).getTime();
        return start > now && start - now <= threeDays;
      });
    }

    return list;
  }, [
    allEvents,
    activeTab,
    locationFilter,
    interestFilter,
    vibeFilter,
    activeFilters,
  ]);
  const filters = [
    { id: "games", label: "Has Games", icon: Gamepad2 },
    { id: "vibetag", label: "Has VibeTag", icon: Tag },
    { id: "free", label: "Free", icon: Ticket },
    { id: "soon", label: "Starting Soon", icon: Clock },
  ];
  const handlePostcardClick = (postcard: PostcardItem) => {
    const eventId = postcard?.event?.id;
    if (eventId) {
      router.push(`/dashboard/events/${eventId}/postcards`);
    }
  };

  if (isLoadingEvents) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="container pt-6 mx-auto">
      <div className="mb-6 flex justify-center">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {activeView === "postcards" && (
        <Tabs
          value={postcardPhase}
          onValueChange={(v) => setPostcardPhase(v as typeof postcardPhase)}
          className="mb-6"
        >
          <TabsList className="w-full grid grid-cols-3 h-10">
            <TabsTrigger value="all" className="text-xs">
              All Phases
            </TabsTrigger>
            <TabsTrigger value="pre-event" className="text-xs">
              Pre-Event
            </TabsTrigger>
            <TabsTrigger value="main-event" className="text-xs">
              Main Event
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {activeView === "events" && (
        <>
          <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location"
                className="h-9"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={detectLocation}
                disabled={autoLocating}
                title="Use my location"
              >
                <Locate
                  className={autoLocating ? "h-4 w-4 animate-pulse" : "h-4 w-4"}
                />
              </Button>
            </div>

            <select
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Any interest</option>
              {INTEREST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </option>
              ))}
              {userInterests
                .filter((u) => !INTEREST_OPTIONS.includes(u.interest))
                .map((u) => (
                  <option key={u.id} value={u.interest}>
                    {u.interest}
                  </option>
                ))}
            </select>

            {/* VibeTag */}
            <select
              value={vibeFilter}
              onChange={(e) => setVibeFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Any VibeTag</option>
              <option value="games">Games</option>
              <option value="vibetag">VibeTag</option>
            </select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="sm:col-span-3 justify-start text-xs text-muted-foreground"
              >
                <X className="mr-1 h-3 w-3" /> Clear filters
              </Button>
            )}
          </div>

          <div className="mb-5">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              className="mb-4"
            >
              <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="foryou"
                  className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  For You
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="nearby"
                  className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Near You
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-card"
                        : "bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "foryou" && userInterests.length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Personalized based on your interests</span>
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No events match your filters."
                  : "Nothing to see here yet, check back later!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event: any, index: number) => (
                <div
                  key={event.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard
                    id={event?.id}
                    title={event?.name}
                    date={event?.startsAt}
                    location={event?.locationName}
                    image={
                      event?.flierUrl || event?.image || event?.data?.flierUrl
                    }
                    promoVideoUrl={
                      event?.promoVideoUrl ||
                      event?.promotionalVideoUrl ||
                      event?.data?.promotionalVideoUrl
                    }
                    attendees={event?.attendees}
                    hasGames={event?.hasGame}
                    hasVibeTag={event?.hasVibetag}
                    rsvpStartDateTime={event?.rsvpStartDateTime ?? null}
                    colorAccent={event?.colorAccent}
                    postcardCount={event?.postcardCount ?? 0}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === "postcards" && (
        <>
          {isLoadingPostcards ? (
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mb-3 break-inside-avoid">
                  <Skeleton
                    className="w-full rounded-2xl"
                    style={{ height: `${180 + (i % 3) * 60}px` }}
                  />
                </div>
              ))}
            </div>
          ) : postcards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ImageOff className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No postcards yet. Be the first to share a memory!
              </p>
            </div>
          ) : (
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
              {postcards.map((postcard: PostcardItem, index: number) => {
                const mediaItems = postcard?.media ?? [];
                const eventName = postcard?.event?.name ?? "";
                const authorName =
                  postcard?.author?.displayName ??
                  postcard?.author?.username ??
                  "";
                const storageBase =
                  process.env.NEXT_PUBLIC_STORAGE_BASE_URL ??
                  "http://minio-production-5cff.up.railway.app:443/nextvibe";

                const resolvedMedia = mediaItems
                  .map((m) => ({
                    src:
                      m.mediaUrl ||
                      (m.storageKey ? `${storageBase}/${m.storageKey}` : ""),
                    isVideo: m.mediaType === "VIDEO",
                  }))
                  .filter((m) => m.src);

                if (resolvedMedia.length === 0) return null;

                return (
                  <div
                    key={postcard?.id ?? index}
                    onClick={() => handlePostcardClick(postcard)}
                    className={cn(
                      "group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-card shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    {resolvedMedia.length === 1 ? (
                      <div className="relative aspect-auto">
                        {resolvedMedia[0].isVideo ? (
                          <video
                            src={resolvedMedia[0].src}
                            muted
                            loop
                            playsInline
                            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <Image
                            src={resolvedMedia[0].src}
                            alt={postcard?.caption ?? eventName}
                            height={300}
                            width={300}
                            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    ) : (
                      <Carousel
                        plugins={[
                          Autoplay({
                            delay: 2500,
                            stopOnInteraction: false,
                            stopOnMouseEnter: true,
                          }),
                        ]}
                        opts={{ loop: true }}
                        className="w-full"
                      >
                        <CarouselContent className="ml-0">
                          {resolvedMedia.map((media, mi) => (
                            <CarouselItem key={mi} className="pl-0">
                              <div className="relative aspect-auto">
                                {media.isVideo ? (
                                  <video
                                    src={media.src}
                                    muted
                                    loop
                                    playsInline
                                    className="w-full object-cover"
                                  />
                                ) : (
                                  <Image
                                    src={media.src}
                                    alt={`${eventName} ${mi + 1}`}
                                    className="w-full object-cover"
                                    height={300}
                                    width={300}
                                  />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {eventName && (
                        <p className="text-xs font-semibold line-clamp-1 mb-0.5">
                          {eventName}
                        </p>
                      )}
                      {authorName && (
                        <p className="text-[10px] text-white/70 line-clamp-1 mb-1">
                          @{authorName}
                        </p>
                      )}
                      {postcard?.caption && (
                        <p className="text-xs text-white/80 line-clamp-2 mb-1.5">
                          {postcard.caption}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs">
                          <Heart className="h-3.5 w-3.5" />
                          {postcard?.likeCount ?? 0}
                        </span>
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
          )}
        </>
      )}
    </main>
  );
};

export default Discover;
