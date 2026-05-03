"use client";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTicketsQuery } from "@/app/provider/api/eventApi";

interface TicketPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventId?: string;
  /** Called with the selected ticketTierId */
  onPurchaseComplete: (ticketTierId: string) => void;
  setTicketTierId?: (id: string) => void;
}

const formatPrice = (price: number) =>
  price === 0
    ? "Free"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(price);

export function TicketPurchaseModal({
  open,
  onOpenChange,
  eventName,
  eventId,
  onPurchaseComplete,
  setTicketTierId,
}: TicketPurchaseModalProps) {
  const { data: ticketsResponse, isLoading } = useGetTicketsQuery(
    eventId ?? "",
    { skip: !eventId }
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const tickets = useMemo(
    () =>
      (ticketsResponse?.data ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        price: Number(t.price),
        available: t.quantity - (t.quantitySold ?? 0),
      })),
    [ticketsResponse]
  );

  const selected = tickets.find((t) => t.id === selectedId);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsConfirming(true);
    setTicketTierId?.(selected.id);
    // Small delay so the UI feels responsive
    await new Promise((r) => setTimeout(r, 300));
    onPurchaseComplete(selected.id);
    onOpenChange(false);
    setSelectedId(null);
    setIsConfirming(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Select Your Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Choose a ticket for <strong>{eventName}</strong> to confirm your RSVP.
          </p>

          {/* Ticket list */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              /* No tiers — confirm without one */
              <div className="rounded-xl border border-border p-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  No ticket tiers set for this event.
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    onPurchaseComplete("");
                    onOpenChange(false);
                  }}
                >
                  <Check className="h-4 w-4" />
                  Confirm RSVP
                </Button>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  disabled={ticket.available <= 0}
                  className={cn(
                    "w-full rounded-xl border-2 p-4 text-left transition-all",
                    selectedId === ticket.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    ticket.available <= 0 && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => setSelectedId(ticket.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ticket.name}</span>
                        {selectedId === ticket.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      {ticket.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {ticket.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ticket.available > 0
                          ? `${ticket.available} available`
                          : "Sold out"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm font-semibold shrink-0 ml-2">
                      {formatPrice(ticket.price)}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Confirm button */}
          {tickets.length > 0 && (
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!selected || isConfirming}
              onClick={handleConfirm}
            >
              {isConfirming ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Confirming...</>
              ) : (
                <><Check className="h-4 w-4" />Confirm RSVP</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
