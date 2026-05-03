"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, X, Ticket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TicketPurchaseModal } from "./ticket-purchase-modal";
import { useRsvpMutation } from "@/app/provider/api/eventApi";
import { toast } from "sonner";

interface EventRSVPTabProps {
  event: any;
}

type RSVPChoice = "going" | "maybe" | "not-going" | null;

export function EventRSVPTab({ event }: EventRSVPTabProps) {
  const [rsvpMutation, { isLoading: isRsvping }] = useRsvpMutation();

  const [rsvpStatus, setRsvpStatus] = useState<RSVPChoice>(
    event?.isRsvped ? "going" : null
  );
  const [showTicketModal, setShowTicketModal] = useState(false);

  // ── Going: open ticket modal first, RSVP after tier selected ──────────────
  const handleGoing = () => {
    if (rsvpStatus === "going") return; // already going
    setShowTicketModal(true);
  };

  const handleTicketSelected = async (tierId: string) => {
    try {
      await rsvpMutation({
        eventId: event.id,
        status: "CONFIRMED",
        ticketTierId: tierId,
      }).unwrap();
      setRsvpStatus("going");
      toast.success("🎉 You're going! See you at the event.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to RSVP. Please try again.");
    }
  };

  // ── Maybe / Can't Go: no ticket needed ────────────────────────────────────
  const handleSimpleRsvp = async (choice: "maybe" | "not-going") => {
    if (isRsvping) return;
    const status = choice === "maybe" ? "WAITLIST" : "CANCELLED";
    try {
      await rsvpMutation({ eventId: event.id, status }).unwrap();
      setRsvpStatus(choice);
      toast.success(choice === "maybe" ? "🤔 You're on the waitlist!" : "😢 RSVP cancelled.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to RSVP. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Status banner */}
      {rsvpStatus === "going" && (
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-600">You&apos;re going! 🎉</p>
            <p className="text-sm text-muted-foreground">Your RSVP is confirmed</p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
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
            <p className="text-sm text-muted-foreground">We&apos;ll notify you if a spot opens</p>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            Waitlist
          </Badge>
        </div>
      )}

      {/* RSVP Buttons */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Are you going?</h3>

        <div className="grid grid-cols-3 gap-3">
          {/* Going — opens ticket modal */}
          <Button
            variant={rsvpStatus === "going" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "going" && "bg-green-600 hover:bg-green-700 border-green-600"
            )}
            onClick={handleGoing}
            disabled={isRsvping || rsvpStatus === "going"}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              rsvpStatus === "going" ? "bg-white/20" : "bg-green-500/10"
            )}>
              <Check className={cn("h-5 w-5", rsvpStatus === "going" ? "text-white" : "text-green-600")} />
            </div>
            <span className={cn("text-sm font-medium", rsvpStatus === "going" ? "text-white" : "text-foreground")}>
              Going
            </span>
          </Button>

          {/* Maybe — direct RSVP */}
          <Button
            variant={rsvpStatus === "maybe" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "maybe" && "bg-amber-500 hover:bg-amber-600 border-amber-500"
            )}
            onClick={() => handleSimpleRsvp("maybe")}
            disabled={isRsvping}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              rsvpStatus === "maybe" ? "bg-white/20" : "bg-amber-500/10"
            )}>
              {isRsvping && rsvpStatus === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <HelpCircle className={cn("h-5 w-5", rsvpStatus === "maybe" ? "text-white" : "text-amber-600")} />
              )}
            </div>
            <span className={cn("text-sm font-medium", rsvpStatus === "maybe" ? "text-white" : "text-foreground")}>
              Maybe
            </span>
          </Button>

          {/* Can't Go — direct RSVP */}
          <Button
            variant={rsvpStatus === "not-going" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "not-going" && "bg-muted-foreground hover:bg-muted-foreground/90"
            )}
            onClick={() => handleSimpleRsvp("not-going")}
            disabled={isRsvping}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              rsvpStatus === "not-going" ? "bg-white/20" : "bg-muted"
            )}>
              <X className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Can&apos;t Go</span>
          </Button>
        </div>

        {isRsvping && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </div>
        )}
      </div>

      {/* Attendees count */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Attendees</h3>
        <span className="text-sm text-muted-foreground">
          {event?.attendingCount ?? 0} going
        </span>
      </div>

      {/* Ticket modal — only for Going */}
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
