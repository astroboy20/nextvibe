/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Gamepad2,
  ImageOff,
  MapPin,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetEventsQuery } from "@/app/provider/api/eventApi";
import { useEventDiscovery } from "@/hooks/use-event-dicovery";
import ViewToggle from "../components/view-toggle";
import { EventCard } from "../components/event-card";

const INTEREST_OPTIONS = [
  "music", "tech", "party", "art", "food",
  "fitness", "travel", "nightlife", "festival", "wedding",
];

const PAGE_SIZE = 20;

// ── Pagination bar ────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                page === p
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              {p}
            </button>
          )
        )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const Discover = () => {
  const [activeView, setActiveView] = useState<"events" | "postcards">("events");
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "nearby">("foryou");
  const [locationFilter, setLocationFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [vibeFilter, setVibeFilter] = useState("");
  const [autoLocating, setAutoLocating] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // separate page state per view
  const [eventsPage, setEventsPage] = useState(1);
  const [postcardsPage, setPostcardsPage] = useState(1);

  const { data: eventsData, isLoading: isLoadingEvents } = useGetEventsQuery({
    page: eventsPage,
    limit: PAGE_SIZE,
  });
  const { userInterests } = useEventDiscovery();

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    setEventsPage(1);
  };

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
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const country = data.address?.country || "";
          const value = city || country;
          setLocationFilter(value);
          localStorage.setItem("nextvibe_location", JSON.stringify({ city, country }));
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
    setEventsPage(1);
    localStorage.removeItem("nextvibe_location");
  };

  const hasFilters = locationFilter || interestFilter || vibeFilter || activeFilters.length > 0;

  const allEvents: any[] = eventsData?.data?.data ?? [];
  const eventsMeta = eventsData?.data?.meta;
  // total pages: prefer server meta, fall back to local count
  const eventsTotalPages = eventsMeta?.totalPages
    ?? (eventsMeta?.total ? Math.ceil(eventsMeta.total / PAGE_SIZE) : 1);
  const postcardsTotalPages = eventsMeta?.totalPages
    ?? (eventsMeta?.total ? Math.ceil(eventsMeta.total / PAGE_SIZE) : 1);

  const filteredEvents = useMemo(() => {
    let list =
      activeTab === "trending"
        ? [...allEvents].sort((a, b) => (b.attendees ?? 0) - (a.attendees ?? 0))
        : activeTab === "nearby" && locationFilter
        ? [...allEvents].sort((a) =>
            (a.locationName ?? "").toLowerCase().includes(locationFilter.toLowerCase()) ? -1 : 1
          )
        : allEvents;

    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      list = list.filter((e) => (e.locationName ?? "").toLowerCase().includes(l));
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
    if (vibeFilter) list = list.filter((e) => e.hasVibetag);
    if (activeFilters.includes("games")) list = list.filter((e) => e.hasGame);
    if (activeFilters.includes("vibetag")) list = list.filter((e) => e.hasVibetag);
    if (activeFilters.includes("free")) list = list.filter((e) => !e.isPaid && !e.ticketPrice);
    if (activeFilters.includes("soon")) {
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      list = list.filter((e) => {
        const start = new Date(e.startsAt).getTime();
        return start > now && start - now <= threeDays;
      });
    }
    return list;
  }, [allEvents, activeTab, locationFilter, interestFilter, vibeFilter, activeFilters]);

  const filters = [
    { id: "games", label: "Has Games", icon: Gamepad2 },
    { id: "vibetag", label: "Has VibeTag", icon: Tag },
    { id: "free", label: "Free", icon: Ticket },
    { id: "soon", label: "Starting Soon", icon: Clock },
  ];

  // reset to page 1 when filters/tab change
  useEffect(() => { setEventsPage(1); }, [activeTab, locationFilter, interestFilter, vibeFilter, activeFilters]);
  useEffect(() => { setPostcardsPage(1); }, []);

  if (isLoadingEvents) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-36 sm:h-48 w-full rounded-2xl" />
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

      {/* ── Events view ── */}
      {activeView === "events" && (
        <>
          {/* Filters */}
          <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-3">
            <div className="flex items-center gap-2">
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
                <MapPin className={autoLocating ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
              </Button>
            </div>

            <select
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Vibe</option>
              {INTEREST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </option>
              ))}
              {userInterests
                .filter((u) => !INTEREST_OPTIONS.includes(u.interest))
                .map((u) => (
                  <option key={u.id} value={u.interest}>{u.interest}</option>
                ))}
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

          {/* Tabs + chip filters */}
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
                {hasFilters ? "No events match your filters." : "Nothing to see here yet, check back later!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredEvents.map((event: any, index: number) => (
                  <div
                    key={event.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <EventCard
                      variant="event"
                      id={event?.id}
                      title={event?.name}
                      date={event?.startsAt}
                      location={event?.locationName}
                      image={event?.flierUrl || event?.image || event?.data?.flierUrl}
                      promoVideoUrl={event?.promoVideoUrl || event?.promotionalVideoUrl || event?.data?.promotionalVideoUrl}
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
              <Pagination
                page={eventsPage}
                totalPages={eventsTotalPages}
                onChange={(p) => { setEventsPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            </>
          )}
        </>
      )}

      {/* ── Postcards view ── */}
      {activeView === "postcards" && (
        <>
          {allEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ImageOff className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No events yet. Check back later!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {allEvents.map((event: any, index: number) => (
                  <div
                    key={event.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <EventCard
                      variant="postcard"
                      id={event?.id}
                      title={event?.name}
                      date={event?.startsAt}
                      location={event?.locationName}
                      image={event?.flierUrl || event?.image || event?.data?.flierUrl}
                      promoVideoUrl={event?.promoVideoUrl || event?.promotionalVideoUrl || event?.data?.promotionalVideoUrl}
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
              <Pagination
                page={postcardsPage}
                totalPages={postcardsTotalPages}
                onChange={(p) => { setPostcardsPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default Discover;
