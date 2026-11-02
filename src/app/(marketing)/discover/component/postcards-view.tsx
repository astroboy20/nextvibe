"use client";
import { useMemo, useState } from "react";
import { useGetEventsQuery } from "@/features/events/api/events-api";
import { EventCard } from "@/features/events/components/discovery/event-card";
import DiscoverSkeleton from "./discover-skeleton";
import DiscoverPagination from "./discover-pagination";

const PAGE_SIZE = 20;

export default function PostcardsView() {
  const [page, setPage] = useState(1);

  const { data: postcardsData, isLoading } = useGetEventsQuery({
    page,
    limit: PAGE_SIZE,
    isPublic: true,
  });

  const allEvents: any[] = useMemo(
    () =>
      (postcardsData?.data?.data ?? []).filter(
        (e: any) => e.isPublic !== false && ((e.postcardCount ?? 0) > 0 || e.hasVibetag)
      ),
    [postcardsData]
  );
  const meta = postcardsData?.data?.meta;
  const totalPages = meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);

  return (
    <>
      {isLoading ? (
        <DiscoverSkeleton />
      ) : allEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No postcards yet — check back later!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {allEvents.map((event: any, index: number) => (
              <EventCard
                key={event.id}
                variant="postcard"
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
