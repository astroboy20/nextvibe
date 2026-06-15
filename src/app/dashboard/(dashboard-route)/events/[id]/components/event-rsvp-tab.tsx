"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, HelpCircle, X, Ticket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketPurchaseModal } from "./ticket-purchase-modal";
import {
  useRsvpMutation,
  useGetEventAttendeesQuery,
} from "@/app/provider/api/eventApi";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface EventRSVPTabProps {
  event: any;
}

type RSVPChoice = "going" | "maybe" | "not-going" | null;

function extractErrorMessage(err: any): string {
  return (
    err?.data?.message ??
    err?.data?.error?.message ??
    err?.data?.error ??
    err?.message ??
    "Failed to RSVP. Please try again."
  );
}

export function EventRSVPTab({ event }: EventRSVPTabProps) {
  const [rsvpMutation] = useRsvpMutation();
  const requireAuth = useRequireAuth();

  const [rsvpStatus, setRsvpStatus] = useState<RSVPChoice>(
    event?.isRsvped ? "going" : null
  );
  const [loadingChoice, setLoadingChoice] = useState<RSVPChoice>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const isAnyLoading = loadingChoice !== null;

  const { data: attendeesData, isLoading: isLoadingAttendees } =
    useGetEventAttendeesQuery({ eventId: event?.id }, { skip: !event?.id });

  const attendees: any[] =
    attendeesData?.data?.data ?? attendeesData?.data ?? [];

  const handleGoing = () => {
    if (rsvpStatus === "going" || isAnyLoading) return;
    if (!requireAuth({ tab: "rsvp" })) return;
    setShowTicketModal(true);
  };

  const handleTicketSelected = async (tierId: string) => {
    setLoadingChoice("going");
    try {
      await rsvpMutation({
        eventId: event.id,
        status: "CONFIRMED",
        ticketTierId: tierId,
      }).unwrap();
      setRsvpStatus("going");
      toast.success("🎉 You're going! See you at the event.");
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingChoice(null);
    }
  };

  const handleSimpleRsvp = async (choice: "maybe" | "not-going") => {
    if (isAnyLoading) return;
    if (!requireAuth({ tab: "rsvp" })) return;
    setLoadingChoice(choice);
    const status = choice === "maybe" ? "WAITLIST" : "CANCELLED";
    try {
      await rsvpMutation({ eventId: event.id, status }).unwrap();
      setRsvpStatus(choice);
      toast.success(
        choice === "maybe" ? "🤔 You're on the waitlist!" : "😢 RSVP cancelled."
      );
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingChoice(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {rsvpStatus === "going" && (
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-600">
              You&apos;re going! 🎉
            </p>
            <p className="text-sm text-muted-foreground">
              Your RSVP is confirmed
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            Confirmed
          </Badge>
        </div>
      )}

      {rsvpStatus === "maybe" && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-600">On the waitlist</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll notify you if a spot opens
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20"
          >
            Waitlist
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Are you going?</h3>

        <div className="grid grid-cols-3 gap-3">
          {/* Going */}
          <Button
            variant={rsvpStatus === "going" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "going" &&
                "bg-green-600 hover:bg-green-700 border-green-600",
              isAnyLoading && loadingChoice !== "going" && "opacity-40"
            )}
            onClick={handleGoing}
            disabled={isAnyLoading || rsvpStatus === "going"}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                rsvpStatus === "going" ? "bg-white/20" : "bg-green-500/10"
              )}
            >
              {loadingChoice === "going" ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Check
                  className={cn(
                    "h-5 w-5",
                    rsvpStatus === "going" ? "text-white" : "text-green-600"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                rsvpStatus === "going" ? "text-white" : "text-foreground"
              )}
            >
              {loadingChoice === "going" ? "Submitting..." : "Going"}
            </span>
          </Button>

          {/* Maybe */}
          <Button
            variant={rsvpStatus === "maybe" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "maybe" &&
                "bg-amber-500 hover:bg-amber-600 border-amber-500",
              isAnyLoading && loadingChoice !== "maybe" && "opacity-40"
            )}
            onClick={() => handleSimpleRsvp("maybe")}
            disabled={isAnyLoading || rsvpStatus === "maybe"}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                rsvpStatus === "maybe" ? "bg-white/20" : "bg-amber-500/10"
              )}
            >
              {loadingChoice === "maybe" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <HelpCircle
                  className={cn(
                    "h-5 w-5",
                    rsvpStatus === "maybe" ? "text-white" : "text-amber-600"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                rsvpStatus === "maybe" ? "text-white" : "text-foreground"
              )}
            >
              {loadingChoice === "maybe" ? "Submitting..." : "Maybe"}
            </span>
          </Button>

          {/* Can't Go */}
          <Button
            variant={rsvpStatus === "not-going" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "not-going" &&
                "bg-muted-foreground hover:bg-muted-foreground/90",
              isAnyLoading && loadingChoice !== "not-going" && "opacity-40"
            )}
            onClick={() => handleSimpleRsvp("not-going")}
            disabled={isAnyLoading || rsvpStatus === "not-going"}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                rsvpStatus === "not-going" ? "bg-white/20" : "bg-muted"
              )}
            >
              {loadingChoice === "not-going" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </div>
            <span className="text-sm font-medium">
              {loadingChoice === "not-going" ? "Submitting..." : "Can't Go"}
            </span>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Who&apos;s Going</h3>
          <span className="text-sm text-muted-foreground">
            {attendeesData?.data?.meta?.total ?? event?.attendingCount ?? 0}{" "}
            attending
          </span>
        </div>

        {isLoadingAttendees && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoadingAttendees && attendees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-border">
            <Ticket className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              No attendees yet. Be the first!
            </p>
          </div>
        )}

        {!isLoadingAttendees && attendees.length > 0 && (
          <div className="space-y-2">
            {attendees.map((attendee: any, i: number) => {
              const user = attendee.user ?? attendee;
              const name = user?.displayName ?? user?.username ?? "Attendee";
              const status =
                attendee.status ?? attendee.rsvpStatus ?? "CONFIRMED";

              return (
                <div
                  key={attendee.id ?? i}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user?.avatarUrl ?? user?.avatar} />
                    <AvatarFallback>
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{name}</p>
                    {user?.username && (
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      status === "CONFIRMED" &&
                        "border-green-500/50 text-green-600 bg-green-500/5",
                      status === "WAITLIST" &&
                        "border-amber-500/50 text-amber-600 bg-amber-500/5",
                      status === "CANCELLED" && "border-gray-400 text-gray-500"
                    )}
                  >
                    {status === "CONFIRMED"
                      ? "Going"
                      : status === "WAITLIST"
                      ? "Waitlist"
                      : "Cancelled"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TicketPurchaseModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        eventName={event?.name}
        eventId={event?.id}
        onPurchaseComplete={handleTicketSelected}
        setTicketTierId={() => {}}
      />
    </div>
  );
}
