"use client";

import { useState } from "react";
import { useGetEventsQuery, useCancelEventMutation } from "@/app/provider/api/admin";
import type { IAdminEvent } from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  XCircle,
  Eye,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

const PAGE_SIZE = 20;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

function normaliseLocation(loc: any): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.name ?? loc.address ?? "—";
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b last:border-0">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "active":
    case "published":
    case "ongoing":
      return "default";
    case "draft":
    case "upcoming":
      return "secondary";
    case "cancelled":
    case "canceled":
      return "destructive";
    default:
      return "outline";
  }
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: result, isLoading, isError } = useGetEventsQuery({ page, limit: PAGE_SIZE });
  const [cancelEvent, { isLoading: cancelling }] = useCancelEventMutation();

  const events = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  const filtered = events.filter((e: IAdminEvent) => {
    const q = search.toLowerCase();
    const organizer =
      e.organizer?.displayName ?? e.organizer?.username ?? "";
    return (
      (e.title ?? "").toLowerCase().includes(q) ||
      organizer.toLowerCase().includes(q) ||
      (e.category ?? "").toLowerCase().includes(q)
    );
  });

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelEvent({
        id: cancelTarget.id,
        reason: cancelReason.trim() || undefined,
      }).unwrap();
      toast.success(`"${cancelTarget.title}" cancelled`);
    } catch {
      toast.error("Failed to cancel event");
    } finally {
      setCancelTarget(null);
      setCancelReason("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All events on the platform.
          </p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>{total.toLocaleString()} total events</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CardTitle>All Events</CardTitle>
            {!isLoading && search && (
              <span className="text-sm text-muted-foreground">
                ({filtered.length} of {events.length})
              </span>
            )}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <p className="text-center text-muted-foreground py-8">
              Failed to load events.
            </p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No matching events" : "No events yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Events will appear here once created."
              }
              icon={<Calendar className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-4 font-medium">Event</th>
                      <th className="text-left py-3 pr-4 font-medium">Organizer</th>
                      <th className="text-left py-3 pr-4 font-medium">Date</th>
                      <th className="text-left py-3 pr-4 font-medium">Type</th>
                      <th className="text-left py-3 pr-4 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((event: IAdminEvent) => (
                      <tr
                        key={event.id}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 pr-4 max-w-[220px]">
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {normaliseLocation(event.location)}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm">
                          {event.organizer?.displayName ??
                            event.organizer?.username ??
                            "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {fmtDate(event.startDate)}
                        </td>
                        <td className="py-3 pr-4">
                          {event.eventType && (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {event.eventType}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusVariant(event.status)}>
                            {event.status ?? "—"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="View details"
                            >
                              <Link href={`/admin/events/${event.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            {event.status?.toLowerCase() !== "cancelled" &&
                              event.status?.toLowerCase() !== "canceled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Cancel event"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setCancelTarget({
                                      id: event.id,
                                      title: event.title,
                                    })
                                  }
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-2">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Cancel confirmation with reason */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel &ldquo;{cancelTarget?.title}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will force-cancel the event. Attendees will be notified.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 px-1 py-2">
            <Label htmlFor="cancel-reason">
              Reason{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Violates platform terms of service"
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Yes, cancel event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
