"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Check, Minus, Plus, CreditCard, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGetTicketsQuery } from "@/app/provider/api/eventApi";
import {
  useInitiatePurchaseMutation,
  useLazyVerifyPurchaseQuery,
} from "@/app/provider/api/paymentApi";

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
}

interface TicketPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventId?: string;
  /** Called with the ticketTierId once payment is verified */
  onPurchaseComplete: (ticketTierId: string) => void;
  setTicketTierId?: (id: string) => void;
}

type Step = "select" | "paying" | "verifying" | "done";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
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
  const { data: ticketsResponse, isLoading: isLoadingTickets } =
    useGetTicketsQuery(eventId ?? "", { skip: !eventId });

  const [initiatePurchase, { isLoading: isInitiating }] =
    useInitiatePurchaseMutation();
  const [verifyPurchase] = useLazyVerifyPurchaseQuery();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<Step>("select");
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);

  // Poll interval ref
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tickets: TicketType[] = useMemo(
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

  const selected = tickets.find((t) => t.id === selectedTicketId);
  const total = selected ? selected.price * quantity : 0;

  // ── Reset when modal closes ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setSelectedTicketId(null);
      setQuantity(1);
      setStep("select");
      setPurchaseId(null);
      if (pollRef.current) clearInterval(pollRef.current);
      paymentWindow?.close();
      setPaymentWindow(null);
    }
  }, [open, paymentWindow]);

  // ── Stop polling on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Step 1: Initiate payment ─────────────────────────────────────────────
  const handlePay = async () => {
    if (!selected || !eventId) return;

    try {
      const res = await initiatePurchase({
        eventId,
        ticketTiers: [{ tierId: selected.id, quantity }],
      }).unwrap();

      if (!res.success || !res.data?.paymentUrl) {
        toast.error("Could not initiate payment. Please try again.");
        return;
      }

      setPurchaseId(res.data.purchaseId);
      setStep("paying");

      // Open payment page in new tab
      const win = window.open(res.data.paymentUrl, "_blank");
      setPaymentWindow(win);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Payment initiation failed.");
    }
  };

  // ── Step 2: Poll for payment verification ───────────────────────────────
  const startPolling = () => {
    if (!purchaseId) return;
    setStep("verifying");

    pollRef.current = setInterval(async () => {
      try {
        const res = await verifyPurchase(purchaseId).unwrap();

        if (res?.data?.status === "SUCCESS") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setStep("done");
          // selectedTicketId is the tierId we already have from selection
          setTicketTierId?.(selectedTicketId ?? "");
          onPurchaseComplete(selectedTicketId ?? "");
          toast.success("Payment confirmed! RSVP submitted.");
          onOpenChange(false);
        } else if (res?.data?.status === "FAILED") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.error("Payment failed. Please try again.");
          setStep("select");
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3000);
  };

  // ── Manual verify (user clicks "I've paid") ──────────────────────────────
  const handleManualVerify = async () => {
    if (!purchaseId) return;
    setStep("verifying");

    try {
      const res = await verifyPurchase(purchaseId).unwrap();

      if (res?.data?.status === "SUCCESS") {
        setStep("done");
        setTicketTierId?.(selectedTicketId ?? "");
        onPurchaseComplete(selectedTicketId ?? "");
        toast.success("Payment confirmed! RSVP submitted.");
        onOpenChange(false);
      } else if (res?.data?.status === "FAILED") {
        toast.error("Payment failed. Please try again.");
        setStep("select");
      } else {
        // Still pending — start polling
        startPolling();
      }
    } catch {
      toast.error("Could not verify payment. Retrying...");
      startPolling();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Get Your Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">

          {/* ── SELECT STEP ── */}
          {step === "select" && (
            <>
              <p className="text-sm text-muted-foreground">
                Select a ticket for <strong>{eventName}</strong> to complete your RSVP.
              </p>

              {/* Ticket list */}
              <div className="space-y-2">
                {isLoadingTickets ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : tickets.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No tickets available for this event.
                  </p>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      disabled={ticket.available <= 0}
                      className={cn(
                        "w-full rounded-xl border-2 p-4 text-left transition-all",
                        selectedTicketId === ticket.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        ticket.available <= 0 && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        setQuantity(1);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{ticket.name}</span>
                            {selectedTicketId === ticket.id && (
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
                          {ticket.price === 0 ? "Free" : formatPrice(ticket.price)}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Quantity */}
              {selected && selected.price > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={quantity >= Math.min(10, selected.available)}
                      onClick={() =>
                        setQuantity((q) => Math.min(10, selected.available, q + 1))
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Pay / Free RSVP button */}
              {selected && (
                <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                  {selected.price > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-display text-xl font-bold">
                        {formatPrice(total)}
                      </span>
                    </div>
                  )}
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={selected.price === 0
                      ? () => {
                          setTicketTierId?.(selected.id);
                          onPurchaseComplete(selected.id);
                          onOpenChange(false);
                        }
                      : handlePay
                    }
                    disabled={isInitiating}
                  >
                    {isInitiating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Initiating...
                      </>
                    ) : selected.price === 0 ? (
                      <>
                        <Check className="h-4 w-4" />
                        Confirm RSVP (Free)
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Pay {formatPrice(total)}
                      </>
                    )}
                  </Button>
                  {selected.price > 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                      Secure payment powered by Monnify
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── PAYING STEP ── */}
          {step === "paying" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ExternalLink className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Complete Payment</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A payment page has opened in a new tab. Complete your payment there, then come back and click the button below.
                </p>
              </div>
              <div className="w-full space-y-2">
                <Button className="w-full gap-2" onClick={handleManualVerify}>
                  <Check className="h-4 w-4" />
                  I&apos;ve Completed Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    if (paymentWindow && !paymentWindow.closed) {
                      paymentWindow.focus();
                    } else {
                      setStep("select");
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Reopen Payment Page
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:underline w-full text-center"
                  onClick={() => setStep("select")}
                >
                  Cancel and go back
                </button>
              </div>
            </div>
          )}

          {/* ── VERIFYING STEP ── */}
          {step === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Verifying Payment</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Checking your payment status...
                </p>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
