"use client";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ViewToggle from "../../components/view-toggle";
import FilterChips from "../../components/filter-chips";
import { EventCard } from "../../components/event-card";
import PostcardGrid from "../../components/postcard-grid";
import { useEventDiscovery } from "@/hooks/use-event-dicovery";
import { useGetEventsQuery } from "@/app/provider/api/eventApi";

const Discover = () => {
  const { data: events, isLoading } = useGetEventsQuery();

  const [activeView, setActiveView] = useState<"events" | "postcards">(
    "events"
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="container px-4 py-6 mx-auto">
      {/* View Toggle */}
      <div className="mb-6 flex justify-center">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {activeView === "events" ? (
        <>
          {/* Events Grid */}
          {events?.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              Nothing to see here yet, check back later!
            </div>
          ) : (
            // <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            //   {filteredEvents.map((event, index) => (
            //     <div
            //       key={event.id}
            //       className="animate-fade-in"
            //       style={{ animationDelay: `${index * 100}ms` }}
            //     >
            //       <div className="relative">
            //         <EventCard
            //           id={event.id}
            //           title={event.title}
            //           date={event.date}
            //           location={event.location}
            //           image={event.image}
            //           attendees={event.attendees}
            //           hasGames={event.hasGames}
            //           hasVibeTag={event.hasVibeTag}
            //           colorAccent={event.colorAccent}
            //         />
            //         {/* Match reasons badges */}
            //         {activeTab === "foryou" &&
            //           event.matchReasons.length > 0 && (
            //             <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            //               {event.matchReasons.slice(0, 2).map((reason, i) => (
            //                 <Badge
            //                   key={i}
            //                   variant="secondary"
            //                   className="bg-background/90 backdrop-blur text-xs"
            //                 >
            //                   {reason}
            //                 </Badge>
            //               ))}
            //             </div>
            //           )}
            //       </div>
            //     </div>
            //   ))}
            // </div>
            "messing with event card design, will add back soon :)"
          )}
        </>
      ) : (
        <>
          {/* Postcard Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <select className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">All Events</option>
              <option value="pre">Pre-event</option>
              <option value="main">Main event</option>
            </select>
            <select className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Any Vibe</option>
              <option value="tech">Tech</option>
              <option value="music">Music</option>
              <option value="party">Party</option>
            </select>
          </div>

          {/* Postcards Grid */}
          <PostcardGrid />
        </>
      )}
    </main>
  );
};

export default Discover;
