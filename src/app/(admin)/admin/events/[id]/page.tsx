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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, XCircle, MapPin, Calendar, Users, DollarSign,
  Tag, Clock, Image as ImageIcon, Video, QrCode, Globe, Lock,
  Gamepad2, FileImage, Ticket,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "MMM d, yyyy h:mm a"); } catch { return "—"; }
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "PUBLISHED": return "default";
    case "DRAFT": return "secondary";
    case "CANCELLED": case "CANCELED": return "destructive";
    default: return "outline";
  }
}

function StatPill({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: event, isLoading, isError } = useGetEventDetailQuery(id);
  const [cancelEvent, { isLoading: cancelling }] = useCancelEventMutation();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = async () => {
    try {
      await cancelEvent({ id, reason: cancelReason.trim() || undefined }).unwrap();
      toast.success("Event cancelled successfully");
    } catch {
      toast.error("Failed to cancel event");
    } finally {
      setShowCancel(false);
      setCancelReason("");
    }
  };

  const isCancelled = event?.status?.toUpperCase() === "CANCELLED";

  return (
    <div className="space-y-6">
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
          {/* Hero flier */}
          {event.flierUrl && (
            <div className="w-full max-h-64 rounded-2xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.flierUrl} alt={event.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Main card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <Badge variant={statusVariant(event.status)}>{event.status ?? "—"}</Badge>
                  {/* {event.mode && (
                    <Badge variant="outline" className="capitalize text-xs">{event.mode.toLowerCase()}</Badge>
                  )}
                  {event.category && (
                    <Badge variant="outline" className="capitalize text-xs">{event.category.toLowerCase()}</Badge>
                  )}
                  {event.isPublic === false && (
                    <Badge variant="secondary" className="text-xs gap-1"><Lock className="w-3 h-3" />Private</Badge>
                  )} */}
                </div>
                {event.description && (
                  <div className="mt-2">
                    <h2>
                      Description
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                )}
              </div>
              {!isCancelled && (
                <Button variant="destructive" size="sm" onClick={() => setShowCancel(true)}>
                  <XCircle className="w-4 h-4 mr-1" /> Cancel Event
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Core details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Organizer</p>
                  <p className="font-medium">{event.organizer?.displayName ?? event.organizer?.username ?? "—"}</p>
                  {event.organizer?.email && (
                    <p className="text-xs text-muted-foreground">{event.organizer.email}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-medium">{event.locationName ?? "—"}</p>
                  {event.virtualLink && (
                    <a href={event.virtualLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3" /> Virtual link
                    </a>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Starts
                  </p>
                  <p className="font-medium">{fmtDate(event.startsAt)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Ends
                  </p>
                  <p className="font-medium">{fmtDate(event.endsAt)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Capacity
                  </p>
                  <p className="font-medium">
                    {event.capacity && event.capacity > 0 ? event.capacity.toLocaleString() : "Unlimited"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </p>
                  <p className="font-medium">₦{Number(event.totalRevenue ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Category
                  </p>
                  <p className="font-medium capitalize">{event.category?.toLowerCase() ?? "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                  <p className="font-medium">{fmtDate(event.createdAt)}</p>
                </div>

                {event.qrCode && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> QR / Link
                    </p>
                    <a href={event.qrCode} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all">
                      {event.qrCode}
                    </a>
                  </div>
                )}
              </div>

              {/* Engagement stats */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Engagement</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <StatPill label="RSVPs" value={event._count?.rsvps ?? 0} icon={Users} />
                  <StatPill label="Check-ins" value={event._count?.checkIns ?? 0} icon={Users} />
                  <StatPill label="Postcards" value={event._count?.postcards ?? 0} icon={FileImage} />
                  <StatPill label="Game Sessions" value={event._count?.gameSessions ?? 0} icon={Gamepad2} />
                  <StatPill label="Tickets Sold" value={event._count?.ticketPurchases ?? 0} icon={Ticket} />
                </div>
              </div>

              {/* Ticket tiers */}
              {event.ticketTiers && event.ticketTiers.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Ticket Tiers</p>
                  <div className="space-y-2">
                    {event.ticketTiers.map((tier: any, i: number) => (
                      <div key={tier.id ?? i} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{tier.name ?? `Tier ${i + 1}`}</p>
                          {tier.description && <p className="text-xs text-muted-foreground">{tier.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {tier.price === 0 ? "Free" : `₦${Number(tier.price ?? 0).toLocaleString()}`}
                          </p>
                          {tier.capacity && (
                            <p className="text-xs text-muted-foreground">{tier.capacity} slots</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media links */}
              {(event.flierUrl || event.promoVideoUrl) && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Media</p>
                  <div className="flex flex-wrap gap-3">

                    {event.promoVideoUrl && (
                      <a href={event.promoVideoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline border border-border rounded-lg px-3 py-2">
                        <Video className="w-4 h-4" /> View Promo Video
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Cancel dialog */}
      <AlertDialog open={showCancel} onOpenChange={(open) => { if (!open) { setShowCancel(false); setCancelReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel &ldquo;{event?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will force-cancel the event. Attendees will be notified. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 px-1 py-2">
            <Label htmlFor="detail-cancel-reason">
              Reason <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Textarea id="detail-cancel-reason" placeholder="e.g. Violates platform terms of service"
              rows={2} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Yes, cancel event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
