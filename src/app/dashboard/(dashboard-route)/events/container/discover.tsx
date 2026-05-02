"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEventsQuery, useGetPostcardsQuery } from "@/app/provider/api/eventApi";
import PostcardGrid from "../components/postcard-grid";
import ViewToggle from "../components/view-toggle";
import { EventCard } from "../components/event-card";
import { PostcardItem } from "../components/postcard-grid";

const Discover = () => {
  const router = useRouter();
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery();
  const [activeView, setActiveView] = useState<"events" | "postcards">("events");

  // Fetch postcards only when the postcards tab is active
  const { data: postcardsData, isLoading: isLoadingPostcards } = useGetPostcardsQuery(
    { page: 1, limit: 40 },
    { skip: activeView !== "postcards" }
  );

  // Response shape: { success, data: { data: PostcardItem[], meta: { total, page, limit, hasNext } } }
  const postcards = postcardsData?.data?.data ?? [];

  // Navigate to the event's postcards page when a card is clicked
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
      {/* View Toggle */}
      <div className="mb-6 flex justify-center">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {activeView === "events" ? (
        <>
          {events?.data?.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              Nothing to see here yet, check back later!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events?.data?.map((event: any, index: number) => (
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
                    image={event?.flierUrl || event?.image || event?.data?.flierUrl}
                    promoVideoUrl={event?.promoVideoUrl || event?.promotionalVideoUrl || event?.data?.promotionalVideoUrl}
                    attendees={event?.attendees}
                    hasGames={event?.hasGames}
                    hasVibeTag={event?.hasVibeTag}
                    rsvpStartDateTime={event?.rsvpStartDateTime ?? null}
                    colorAccent={event?.colorAccent}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <PostcardGrid
          postcards={postcards}
          isLoading={isLoadingPostcards}
          onCardClick={handlePostcardClick}
        />
      )}
    </main>
  );
};

export default Discover;
