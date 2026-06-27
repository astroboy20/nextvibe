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
import { Ticket, Check, Loader2, Plus, Minus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGetTicketsQuery } from "@/app/provider/api/eventApi";
import { useInitiatePurchaseMutation } from "@/app/provider/api/paymentApi";

interface TicketPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventId?: string;
  /** Called with the selected ticketTierId — only used for free RSVP path */
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
  const [initiatePurchase, { isLoading: isPurchasing }] = useInitiatePurchaseMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

  const getQty = (id: string) => quantities[id] ?? 1;

  const selected = tickets.find((t) => t.id === selectedId);
  const selectedQty = selected ? getQty(selected.id) : 1;
  const total = selected ? selected.price * selectedQty : 0;

  const handleConfirm = async () => {
    if (!selected || !eventId) return;

    // Free ticket — just call RSVP directly (no payment needed)
    if (selected.price === 0) {
      setTicketTierId?.(selected.id);
      onPurchaseComplete(selected.id);
      onOpenChange(false);
      setSelectedId(null);
      return;
    }

    // Paid ticket — initiate purchase and redirect to Ercaspay checkout
    try {
      const res = await initiatePurchase({
        eventId,
        ticketTiers: [{ tierId: selected.id, quantity: selectedQty }],
      }).unwrap();

      const { checkoutUrl } = res.data;

      // Redirect to Ercaspay — purchaseId is embedded in the callbackUrl by the backend
      window.location.href = checkoutUrl;
    } catch (err: any) {
      const msg =
        err?.data?.message ?? err?.message ?? "Failed to initiate purchase.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Get Tickets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Choose your tickets for <strong>{eventName}</strong>
          </p>

          {/* Ticket list */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
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
              tickets.map((ticket) => {
                const qty = getQty(ticket.id);
                const isSelected = selectedId === ticket.id;
                const soldOut = ticket.available <= 0;
                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      "rounded-xl border-2 p-4 transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border",
                      soldOut && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <button
                      disabled={soldOut}
                      className="w-full text-left"
                      onClick={() => setSelectedId(ticket.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{ticket.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {ticket.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {soldOut
                              ? "Sold out"
                              : `${ticket.available} left`}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-sm font-semibold shrink-0"
                        >
                          {formatPrice(ticket.price)}
                        </Badge>
                      </div>
                    </button>

                    {/* Quantity stepper — only shown when selected and paid */}
                    {isSelected && ticket.price > 0 && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">Quantity</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setQuantities((q) => ({
                                ...q,
                                [ticket.id]: Math.max(1, qty - 1),
                              }))
                            }
                            disabled={qty <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center font-semibold tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              setQuantities((q) => ({
                                ...q,
                                [ticket.id]: Math.min(
                                  ticket.available,
                                  qty + 1
                                ),
                              }))
                            }
                            disabled={qty >= ticket.available}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Order summary + CTA */}
          {selected && tickets.length > 0 && (
            <div className="space-y-3 pt-1">
              {selected.price > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {selectedQty} × {selected.name}
                  </span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
              )}

              {selected.price > 0 && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    You&apos;ll be redirected to Ercaspay to complete payment securely.
                  </p>
                </div>
              )}

              <Button
                className="w-full gap-2"
                size="lg"
                disabled={isPurchasing}
                onClick={handleConfirm}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : selected.price === 0 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm RSVP (Free)
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" />
                    Pay {formatPrice(total)}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
