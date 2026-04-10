"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, HelpCircle, X, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TicketPurchaseModal } from "./ticket-purchase-modal";

interface EventRSVPTabProps {
  event: {
    attendees: number;
  };
}

const attendeesList = [
  { id: "1", name: "Ade Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", status: "going" },
  { id: "2", name: "Chioma Obi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", status: "going" },
  { id: "3", name: "Tunde Bello", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", status: "maybe" },
  { id: "4", name: "Ngozi Eze", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", status: "going" },
  { id: "5", name: "Kola Adeyemi", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", status: "going" },
  { id: "6", name: "Funke Lagos", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a8bb?w=100&h=100&fit=crop&crop=face", status: "maybe" },
];

export function EventRSVPTab({ event }: EventRSVPTabProps) {
  const [rsvpStatus, setRsvpStatus] = useState<"going" | "maybe" | "not-going" | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);

  const handleRsvpGoing = () => {
    setRsvpStatus("going");
    // Show ticket purchase modal after selecting "Going"
    if (!hasTicket) {
      setTimeout(() => setShowTicketModal(true), 500);
    }
  };

  const handleTicketPurchased = () => {
    setHasTicket(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ticket Status Banner */}
      {hasTicket && (
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-600">Ticket Secured! 🎉</p>
            <p className="text-sm text-muted-foreground">Your ticket is confirmed for this event</p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Confirmed
          </Badge>
        </div>
      )}

      {/* RSVP Buttons */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Are you going?</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={rsvpStatus === "going" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "going" && "bg-green-600 hover:bg-green-700 border-green-600"
            )}
            onClick={handleRsvpGoing}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              rsvpStatus === "going" ? "bg-white/20" : "bg-green-500/10"
            )}>
              <Check className={cn(
                "h-5 w-5",
                rsvpStatus === "going" ? "text-white" : "text-green-600"
              )} />
            </div>
            <span className={cn(
              "text-sm font-medium",
              rsvpStatus === "going" ? "text-white" : "text-foreground"
            )}>Going</span>
          </Button>

          <Button
            variant={rsvpStatus === "maybe" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "maybe" && "bg-amber-500 hover:bg-amber-600 border-amber-500"
            )}
            onClick={() => setRsvpStatus("maybe")}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              rsvpStatus === "maybe" ? "bg-white/20" : "bg-amber-500/10"
            )}>
              <HelpCircle className={cn(
                "h-5 w-5",
                rsvpStatus === "maybe" ? "text-white" : "text-amber-600"
              )} />
            </div>
            <span className={cn(
              "text-sm font-medium",
              rsvpStatus === "maybe" ? "text-white" : "text-foreground"
            )}>Maybe</span>
          </Button>

          <Button
            variant={rsvpStatus === "not-going" ? "default" : "outline"}
            className={cn(
              "h-auto flex-col gap-2 py-4 rounded-2xl transition-all",
              rsvpStatus === "not-going" && "bg-muted-foreground hover:bg-muted-foreground/90 border-muted-foreground"
            )}
            onClick={() => setRsvpStatus("not-going")}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              rsvpStatus === "not-going" ? "bg-white/20" : "bg-muted"
            )}>
              <X className={cn(
                "h-5 w-5",
                rsvpStatus === "not-going" ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <span className={cn(
              "text-sm font-medium",
              rsvpStatus === "not-going" ? "text-white" : "text-foreground"
            )}>Can&apos;t Go</span>
          </Button>
        </div>

        {rsvpStatus && (
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">
              {rsvpStatus === "going" && !hasTicket && "🎉 Awesome! You're on the guest list. Get your ticket now!"}
              {rsvpStatus === "going" && hasTicket && "🎉 You're all set! See you at the event."}
              {rsvpStatus === "maybe" && "🤔 No worries! We hope to see you there."}
              {rsvpStatus === "not-going" && "😢 Maybe next time!"}
            </p>
            {rsvpStatus === "going" && !hasTicket && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => setShowTicketModal(true)}
              >
                <Ticket className="h-4 w-4" />
                Get Ticket
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Attendees List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Who&apos;s Going</h3>
          <span className="text-sm text-muted-foreground">{event.attendees} attending</span>
        </div>

        <div className="space-y-2">
          {attendeesList.map((attendee) => (
            <div 
              key={attendee.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={attendee.avatar} />
                <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{attendee.name}</p>
              </div>
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                attendee.status === "going" ? "bg-green-500" : "bg-amber-500"
              )}>
                {attendee.status === "going" ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : (
                  <HelpCircle className="h-3.5 w-3.5 text-white" />
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="mt-3 w-full text-center text-sm font-medium text-primary hover:underline">
          View all {event.attendees} attendees
        </button>
      </div>

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        eventName="Detty December 2025"
        onPurchaseComplete={handleTicketPurchased}
      />
    </div>
  );
}
