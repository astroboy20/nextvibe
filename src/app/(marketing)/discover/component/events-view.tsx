"use client";
import { useMemo, useState } from "react";
import { useGetEventsQuery } from "@/features/events/api/events-api";
import { EventCard } from "@/features/events/components/discovery/event-card";
import DiscoverSkeleton from "./discover-skeleton";
import DiscoverPagination from "./discover-pagination";

const PAGE_SIZE = 20;

export default function EventsView() {
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

  return (
    <>
      {isLoading ? (
        <DiscoverSkeleton />
      ) : allEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing to see here yet — check back later!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {allEvents.map((event: any, index: number) => (
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
