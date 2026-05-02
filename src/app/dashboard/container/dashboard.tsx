"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserQuery, useGetOrganizerEventsQuery } from "@/app/provider/api/authApi";
import { formatDate } from "@/hooks/format-date";
import { Button } from "@/components/ui/button";

interface DashboardEvent {
  id: string;
  name: string;
  flierUrl?: string;
  startsAt: string;
  status: string;
  locationName?: string;
}

const Dashboard = () => {
  const { data: currentUser, isLoading: isLoadingUser } = useGetUserQuery();
  const organizerId = currentUser?.data?.id;

  const { data: eventsData, isLoading: isLoadingEvents } = useGetOrganizerEventsQuery(
    organizerId,
    { skip: !organizerId }
  );

  const events: DashboardEvent[] = Array.isArray(eventsData?.data)
    ? eventsData.data
    : eventsData?.data?.events ?? eventsData?.data?.data ?? [];
  const isLoading = isLoadingUser || isLoadingEvents;

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
    <div className="space-y-5 pb-25">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">
              My Events
            </h1>
            <p className="text-xs text-muted-foreground">
              Organize your events, tickets, and interactions effortlessly
            </p>
          </div>
        </div>
        <Link href="/dashboard/event/create">
          <Button size="sm" className="gap-1.5 rounded-full bg-[#531342]">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">No events yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first event to get started
          </p>
          <Link href="/dashboard/event/create" className="mt-4">
            <Button size="sm" className="rounded-full bg-[#531342]">
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <Link href={`/dashboard/${event?.id}`} key={event?.id}>
              <div
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Image
                  src={
                    event?.flierUrl ||
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop"
                  }
                  alt={event?.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {event?.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(event?.startsAt)}
                  </p>
                  {event?.locationName && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {event?.locationName}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event?.status === "PUBLISHED"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {event?.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
