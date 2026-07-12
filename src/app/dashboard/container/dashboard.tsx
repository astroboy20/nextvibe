"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, Plus, MapPin, Users, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserQuery, useGetOrganizerEventsQuery } from "@/app/provider/api/authApi";
import { formatDate } from "@/hooks/format-date";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetOverviewLocationAnalyticsQuery } from "@/app/provider/api/analyticsApi";

interface DashboardEvent {
  id: string;
  name: string;
  flierUrl?: string;
  startsAt: string;
  status: string;
  locationName?: string;
}

// ─── Audience Location Card ───────────────────────────────────────────────────
// Uses GET /v1/analytics/overview/locations
// Response: { totalAttendees, byCity[{city, count, percentage}], byCountry[...] }
function AudienceLocationCard() {
  const { data, isLoading } = useGetOverviewLocationAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const d = data?.data ?? data ?? {};
  const totalAttendees: number = d.totalAttendees ?? 0;
  const byCity: any[] = d.byCity ?? [];
  const byCountry: any[] = d.byCountry ?? [];

  if (totalAttendees === 0) return null;

  // Top 5 cities, Unknown last
  const topCities = [...byCity]
    .sort((a, b) => {
      if (a.city === "Unknown") return 1;
      if (b.city === "Unknown") return -1;
      return b.count - a.count;
    })
    .slice(0, 5);

  const maxCount = topCities[0]?.count ?? 1;
  const unknownCity = byCity.find((c) => c.city === "Unknown");
  const topCountry = byCountry.find((c) => c.country !== "Unknown");

  return (
    <Card className="border-border/60">
      <CardContent className="px-4 pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#531342]/10">
              <MapPin className="h-3.5 w-3.5 text-[#531342]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Audience Locations</p>
              <p className="text-[10px] text-muted-foreground">
                {totalAttendees.toLocaleString()} attendees across all events
              </p>
            </div>
          </div>
          {topCountry && (
            <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              🌍 {topCountry.country} {topCountry.percentage}%
            </span>
          )}
        </div>

        {/* City bar list */}
        <div className="space-y-2">
          {topCities.map((c) => (
            <div key={c.city} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground flex items-center gap-1">
                  {c.city === "Unknown" && (
                    <span title="Unknown includes attendees who haven't shared their location yet.">
                      <Info className="h-3 w-3 text-amber-500 inline" />
                    </span>
                  )}
                  {c.city}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {c.percentage}% ({c.count.toLocaleString()})
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (c.count / maxCount) * 100)}%`,
                    background: c.city === "Unknown" ? "#d1d5db" : "#531342",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Unknown footnote */}
        {unknownCity && unknownCity.count > 0 && (
          <p className="text-[10px] text-muted-foreground flex items-start gap-1">
            <Info className="h-3 w-3 shrink-0 text-amber-500 mt-0.5" />
            Unknown includes attendees who haven&apos;t shared their location yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
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

      {/* Overview audience location — only renders when data exists */}
      <AudienceLocationCard />

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
