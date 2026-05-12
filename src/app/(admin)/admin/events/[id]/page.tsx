"use client";

import { use, useState } from "react";
import { useGetEventDetailQuery, useCancelEventMutation } from "@/app/provider/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  ArrowLeft,
  XCircle,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Tag,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy h:mm a");
}

function normaliseLocation(loc: any): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.name ?? loc.address ?? "—";
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "active":
    case "published":
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

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: event, isLoading, isError } = useGetEventDetailQuery(id);
  const [cancelEvent, { isLoading: cancelling }] = useCancelEventMutation();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = async () => {
    try {
      await cancelEvent({
        id,
        reason: cancelReason.trim() || undefined,
      }).unwrap();
      toast.success("Event cancelled successfully");
    } catch {
      toast.error("Failed to cancel event");
    } finally {
      setShowCancel(false);
      setCancelReason("");
    }
  };

  const isCancelled =
    event?.status?.toLowerCase() === "cancelled" ||
    event?.status?.toLowerCase() === "canceled";

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load event details.
          </CardContent>
        </Card>
      ) : event ? (
        <>
          {/* Main card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant={statusVariant(event.status)}>
                    {event.status ?? "—"}
                  </Badge>
                  {event.eventType && (
                    <Badge variant="outline" className="capitalize text-xs">
                      {event.eventType}
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
              {!isCancelled && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowCancel(true)}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Cancel Event
                </Button>
              )}
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Organizer
                  </p>
                  <p className="font-medium">
                    {event.organizer?.displayName ??
                      event.organizer?.username ??
                      "—"}
                  </p>
                  {event.organizer?.email && (
                    <p className="text-xs text-muted-foreground">
                      {event.organizer.email}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-medium">
                    {normaliseLocation(event.location)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Start Date
                  </p>
                  <p className="font-medium">{fmtDate(event.startDate)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> End Date
                  </p>
                  <p className="font-medium">{fmtDate(event.endDate)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Ticket Price
                  </p>
                  <p className="font-medium">
                    {event.ticketPrice ? `$${event.ticketPrice}` : "Free"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Capacity
                  </p>
                  <p className="font-medium">
                    {event.capacity?.toLocaleString() ?? "Unlimited"}
                  </p>
                </div>

                {event.category && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Category
                    </p>
                    <p className="font-medium capitalize">{event.category}</p>
                  </div>
                )}

                {event.eventMode && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Mode
                    </p>
                    <Badge variant="outline" className="capitalize text-xs">
                      {event.eventMode}
                    </Badge>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Created
                  </p>
                  <p className="font-medium">
                    {event.createdAt
                      ? format(new Date(event.createdAt), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Cancel dialog */}
      <AlertDialog
        open={showCancel}
        onOpenChange={(open) => {
          if (!open) {
            setShowCancel(false);
            setCancelReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will force-cancel the event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 px-1 py-2">
            <Label htmlFor="detail-cancel-reason">
              Reason{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Textarea
              id="detail-cancel-reason"
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
