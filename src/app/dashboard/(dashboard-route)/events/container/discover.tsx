/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Gamepad2,
  MapPin,
  Search,
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
import { useGetUserQuery } from "@/app/provider/api/authApi";
import { useEventDiscovery } from "@/hooks/use-event-dicovery";
import ViewToggle from "../components/view-toggle";
import { EventCard } from "../components/event-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INTEREST_OPTIONS = [
  "music", "tech", "party", "art", "food",
  "fitness", "travel", "nightlife", "festival", "wedding",
];

const PAGE_SIZE = 20;

// ── Pagination ────────────────────────────────────────────────────────────────
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

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
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

// ── Chip filters ──────────────────────────────────────────────────────────────
const CHIP_FILTERS = [
  { id: "games", label: "Has Games", icon: Gamepad2 },
  { id: "vibetag", label: "Has VibeTag", icon: Tag },
  { id: "free", label: "Free", icon: Ticket },
  { id: "soon", label: "Starting Soon", icon: Clock },
] as const;

type ChipId = typeof CHIP_FILTERS[number]["id"];

// ── Shared filter logic ───────────────────────────────────────────────────────
function applyCommonFilters(
  list: any[],
  searchQuery: string,
  locationFilter: string,
  interestFilter: string,
  activeFilters: string[]
) {
  let result = list;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.locationName ?? "").toLowerCase().includes(q)
    );
  }
  if (locationFilter) {
    const l = locationFilter.toLowerCase();
    result = result.filter((e) => (e.locationName ?? "").toLowerCase().includes(l));
  }
  if (interestFilter) {
    const i = interestFilter.toLowerCase().replace(/-/g, " ");
    result = result.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(i) ||
        (e.locationName ?? "").toLowerCase().includes(i) ||
        (e.category ?? "").toLowerCase().includes(i)
    );
  }
  if (activeFilters.includes("games")) result = result.filter((e) => e.hasGame);
  if (activeFilters.includes("vibetag")) result = result.filter((e) => e.hasVibetag);
  if (activeFilters.includes("free")) result = result.filter((e) => !e.isPaid && !e.ticketPrice);
  if (activeFilters.includes("soon")) {
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    result = result.filter((e) => {
      const start = new Date(e.startsAt).getTime();
      return start > now && start - now <= threeDays;
    });
  }
  return result;
}

// ── EventCardSkeleton ─────────────────────────────────────────────────────────
function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-36 sm:h-48 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ── Postcards view ────────────────────────────────────────────────────────────
function PostcardsView({ userInterests }: { userInterests: any[] }) {
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "nearby">("foryou");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<ChipId[]>([]);
  const [autoLocating, setAutoLocating] = useState(false);
  const [page, setPage] = useState(1);

  const { data: postcardsData, isLoading } = useGetEventsQuery({
    page,
    limit: PAGE_SIZE,
    isPublic: true,
  });

  const allEvents: any[] = useMemo(
    () => (postcardsData?.data?.data ?? []).filter((e: any) => e.isPublic !== false),
    [postcardsData]
  );
  const meta = postcardsData?.data?.meta;
  const totalPages = meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);

  const toggleFilter = useCallback((id: ChipId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    setPage(1);
  }, []);

  const detectLocation = useCallback(() => {
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
          setLocationFilter(city || country);
        } catch { }
        setAutoLocating(false);
      },
      () => setAutoLocating(false),
      { timeout: 8000 }
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setLocationFilter("");
    setInterestFilter("");
    setActiveFilters([]);
    setPage(1);
  }, []);

  const hasFilters = searchQuery || locationFilter || interestFilter || activeFilters.length > 0;

  const filteredEvents = useMemo(() => {
    let list =
      activeTab === "trending"
        ? [...allEvents].sort((a, b) => (b.postcardCount ?? 0) - (a.postcardCount ?? 0))
        : activeTab === "nearby" && locationFilter
          ? [...allEvents].sort((a) =>
            (a.locationName ?? "").toLowerCase().includes(locationFilter.toLowerCase()) ? -1 : 1
          )
          : allEvents;

    list = applyCommonFilters(list, searchQuery, locationFilter, interestFilter, activeFilters);
    return list.filter((e) => (e.postcardCount ?? 0) > 0 || e.hasVibetag);
  }, [allEvents, activeTab, searchQuery, locationFilter, interestFilter, activeFilters]);

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="mb-5 rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search postcards by name…"
            className="h-10 pl-9 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Location + Vibe row */}
        <div className={cn(hasFilters ? "grid-cols-3" : "grid grid-cols-2 gap-2 sm:grid-cols-3")}>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              placeholder="Location"
              className="h-9 pl-9 pr-9"
            />
            <button
              type="button"
              onClick={detectLocation}
              disabled={autoLocating}
              title="Use my location"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <MapPin className={cn("h-3.5 w-3.5", autoLocating && "animate-pulse text-primary")} />
            </button>
          </div>

          <Select
            value={interestFilter || "__all__"}
            onValueChange={(v) => { setInterestFilter(v === "__all__" ? "" : v); setPage(1); }}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Vibe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All vibes</SelectItem>
              {INTEREST_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </SelectItem>
              ))}
              {userInterests
                .filter((u: any) => !INTEREST_OPTIONS.includes(u.interest))
                .map((u: any) => (
                  <SelectItem key={u.id} value={u.interest}>{u.interest}</SelectItem>
                ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-xs text-muted-foreground sm:col-span-1"
            >
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Tab + chip filters ── */}
      <div className="mb-5">
        <Tabs
          value={activeTab}
          onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(1); }}
          className="mb-3"
        >
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="foryou" className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Trending
            </TabsTrigger>
            <TabsTrigger value="nearby" className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="h-3.5 w-3.5" /> Near You
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CHIP_FILTERS.map(({ id, label, icon: Icon }) => {
            const isActive = activeFilters.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleFilter(id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results ── */}
      {isLoading ? (
        <EventGridSkeleton />
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilters ? "No postcards match your filters." : "No postcards yet. Check back later!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filteredEvents.map((event: any, index: number) => (
              <EventCard
                key={event.id}
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
                eventMode={event?.mode}
                className="animate-fade-in"
                style={{ "--delay": `${index * 40}ms` } as React.CSSProperties}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </>
      )}
    </>
  );
}

// ── Main (Events view) ────────────────────────────────────────────────────────
const Discover = () => {
  const [activeView, setActiveView] = useState<"events" | "postcards">("events");
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "nearby">("foryou");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [vibeFilter, setVibeFilter] = useState("");
  const [autoLocating, setAutoLocating] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ChipId[]>([]);
  const [eventsPage, setEventsPage] = useState(1);

  const { data: currentUser } = useGetUserQuery();
  const displayName = currentUser?.data?.displayName ?? currentUser?.data?.username ?? null;

  const { data: eventsData, isLoading: isLoadingEvents } = useGetEventsQuery({
    page: eventsPage,
    limit: PAGE_SIZE,
    isPublic: true,
  });
  const { userInterests } = useEventDiscovery();

  const toggleFilter = useCallback((id: ChipId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    setEventsPage(1);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("nextvibe_location");
    if (stored) {
      try {
        const loc = JSON.parse(stored);
        setLocationFilter(loc.city || loc.country || "");
      } catch { }
    }
  }, []);

  // Reset to page 1 when filters/tab change
  useEffect(() => {
    setEventsPage(1);
  }, [activeTab, searchQuery, locationFilter, interestFilter, vibeFilter, activeFilters]);

  const detectLocation = useCallback(() => {
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
          setLocationFilter(city || country);
          localStorage.setItem("nextvibe_location", JSON.stringify({ city, country }));
        } catch { }
        setAutoLocating(false);
      },
      () => setAutoLocating(false),
      { timeout: 8000 }
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setLocationFilter("");
    setInterestFilter("");
    setVibeFilter("");
    setActiveFilters([]);
    setEventsPage(1);
    localStorage.removeItem("nextvibe_location");
  }, []);

  const hasFilters = searchQuery || locationFilter || interestFilter || vibeFilter || activeFilters.length > 0;

  const allEvents: any[] = useMemo(
    () => (eventsData?.data?.data ?? []).filter((e: any) => e.isPublic !== false),
    [eventsData]
  );
  const eventsMeta = eventsData?.data?.meta;
  const eventsTotalPages = eventsMeta?.totalPages
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

    list = applyCommonFilters(list, searchQuery, locationFilter, interestFilter, activeFilters);
    if (vibeFilter) list = list.filter((e) => e.hasVibetag);
    return list;
  }, [allEvents, activeTab, searchQuery, locationFilter, interestFilter, vibeFilter, activeFilters]);

  return (
    <main className="container pt-3 mx-auto pb-10 sm:pb-10">

      {/* ── Greeting ── */}
      {displayName && (
        <p className="text-2xl font-bold text-foreground mb-5">
          Hi, {displayName} 👋
        </p>
      )}

      {/* ── View toggle ── */}
      <div className="mb-6 flex justify-center">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* ══════════════ EVENTS VIEW ══════════════ */}
      {activeView === "events" && (
        <>
          {/* Filter card */}
          <div className="mb-5 rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name…"
                className="h-10 pl-9 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Location + Vibe + clear */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[140px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Location"
                  className="h-9 pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={autoLocating}
                  title="Use my location"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  <MapPin className={cn("h-3.5 w-3.5", autoLocating && "animate-pulse text-primary")} />
                </button>
              </div>

              <Select
                value={interestFilter || "__all__"}
                onValueChange={(v) => setInterestFilter(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="h-9 flex-1 min-w-[120px]">
                  <SelectValue placeholder="Vibe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All vibes</SelectItem>
                  {INTEREST_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </SelectItem>
                  ))}
                  {userInterests
                    .filter((u) => !INTEREST_OPTIONS.includes(u.interest))
                    .map((u) => (
                      <SelectItem key={u.id} value={u.interest}>{u.interest}</SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 shrink-0 text-xs text-muted-foreground"
                >
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="mb-3"
          >
            <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="foryou" className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" /> For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Trending
              </TabsTrigger>
              <TabsTrigger value="nearby" className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="h-3.5 w-3.5" /> Near You
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Chip filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {CHIP_FILTERS.map(({ id, label, icon: Icon }) => {
              const isActive = activeFilters.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleFilter(id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>

          {activeTab === "foryou" && userInterests.length > 0 && !searchQuery && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Personalized based on your interests</span>
            </div>
          )}

          {/* Results */}
          {isLoadingEvents ? (
            <EventGridSkeleton />
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No events match your filters."
                  : "Nothing to see here yet, check back later!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredEvents.map((event: any, index: number) => (
                  <EventCard
                    key={event.id}
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
                    eventMode={event?.mode}
                    className="animate-fade-in"
                    style={{ "--delay": `${index * 40}ms` } as React.CSSProperties}
                  />
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

      {/* ══════════════ POSTCARDS VIEW ══════════════ */}
      {activeView === "postcards" && (
        <PostcardsView userInterests={userInterests} />
      )}
    </main>
  );
};

export default Discover;
