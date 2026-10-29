"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetEventsQuery } from "@/features/events/api/events-api";
import { EventCard } from "@/features/events/components/discovery/event-card";
import DiscoverFilterBar from "./discover-filter-bar";
import DiscoverTabs, { CHIP_FILTERS, type ChipId, type TabValue } from "./discover-tabs";
import DiscoverSkeleton from "./discover-skeleton";
import DiscoverPagination from "./discover-pagination";

const PAGE_SIZE = 20;

function applyFilters(
  list: any[],
  searchQuery: string,
  locationFilter: string,
  interestFilter: string,
  activeFilters: ChipId[]
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
    const i = interestFilter.toLowerCase();
    result = result.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(i) ||
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

export default function EventsView() {
  const [activeTab, setActiveTab] = useState<TabValue>("foryou");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<ChipId[]>([]);
  const [autoLocating, setAutoLocating] = useState(false);
  const [page, setPage] = useState(1);

  const { data: eventsData, isLoading } = useGetEventsQuery({
    page,
    limit: PAGE_SIZE,
    isPublic: true,
  });

  const allEvents: any[] = useMemo(
    () => (eventsData?.data?.data ?? []).filter((e: any) => e.isPublic !== false),
    [eventsData]
  );
  const meta = eventsData?.data?.meta;
  const totalPages = meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, locationFilter, interestFilter, activeFilters]);

  const toggleFilter = useCallback((id: ChipId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
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
          const city =
            data.address?.city || data.address?.town || data.address?.village || "";
          setLocationFilter(city || data.address?.country || "");
        } catch {}
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
  }, []);

  const hasFilters =
    !!searchQuery || !!locationFilter || !!interestFilter || activeFilters.length > 0;

  const filteredEvents = useMemo(() => {
    let list =
      activeTab === "trending"
        ? [...allEvents].sort((a, b) => (b.attendees ?? 0) - (a.attendees ?? 0))
        : activeTab === "nearby" && locationFilter
        ? [...allEvents].sort((a) =>
            (a.locationName ?? "").toLowerCase().includes(locationFilter.toLowerCase()) ? -1 : 1
          )
        : allEvents;

    return applyFilters(list, searchQuery, locationFilter, interestFilter, activeFilters);
  }, [allEvents, activeTab, searchQuery, locationFilter, interestFilter, activeFilters]);

  return (
    <>
      <DiscoverFilterBar
        searchQuery={searchQuery}
        locationFilter={locationFilter}
        interestFilter={interestFilter}
        autoLocating={autoLocating}
        hasFilters={hasFilters}
        placeholder="Search events by name…"
        onSearchChange={setSearchQuery}
        onLocationChange={setLocationFilter}
        onInterestChange={setInterestFilter}
        onDetectLocation={detectLocation}
        onClearFilters={clearFilters}
      />

      <DiscoverTabs
        activeTab={activeTab}
        activeFilters={activeFilters}
        onTabChange={setActiveTab}
        onChipToggle={toggleFilter}
      />

      {isLoading ? (
        <DiscoverSkeleton />
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "No events match your filters."
              : "Nothing to see here yet — check back later!"}
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
                eventMode={event?.mode}
                className="animate-fade-in"
                style={{ "--delay": `${index * 40}ms` } as React.CSSProperties}
              />
            ))}
          </div>
          <DiscoverPagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </>
  );
}
