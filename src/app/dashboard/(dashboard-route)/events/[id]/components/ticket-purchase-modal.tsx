import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Check, Minus, Plus, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGetTicketsQuery } from "@/app/provider/api/eventApi";
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
  onPurchaseComplete: () => void;
  eventId?: string;
  setTicketTierId?: (id: string) => void; 
}

export function TicketPurchaseModal({
  open,
  onOpenChange,
  eventName,
  onPurchaseComplete,
  eventId,
  setTicketTierId
}: TicketPurchaseModalProps) {
  const { data: ticketsResponse, isLoading } = useGetTicketsQuery(
    eventId || "",
    { skip: !eventId }
  );

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 🔥 Normalize API data → match UI expectations
   */
  const tickets: TicketType[] = useMemo(() => {
    return (
      ticketsResponse?.data?.map((ticket: any) => ({
        id: ticket.id,
        name: ticket.name,
        description: ticket.description,
        price: Number(ticket.price), // convert string → number
        available: ticket.quantity - ticket.quantitySold,
      })) || []
    );
  }, [ticketsResponse]);

  /**
   * ✅ Now selection uses REAL tickets (not mock)
   */
  const selected = tickets.find((t) => t.id === selectedTicket);
  const total = selected ? selected.price * quantity : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePurchase = async () => {
    if (!selected) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);

    toast(
      `You've secured ${quantity}x ${selected.name} ticket${
        quantity > 1 ? "s" : ""
      } for ${eventName}`
    );

    onPurchaseComplete();
    onOpenChange(false);

    setSelectedTicket(null);
    setQuantity(1);
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
          <p className="text-sm text-muted-foreground">
            You&apos;re RSVP&apos;d as <strong>Going</strong>! Now secure your
            spot with a ticket.
          </p>

          {/* Ticket Options */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No tickets available
              </p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={cn(
                    "w-full rounded-xl border-2 p-4 text-left transition-all",
                    selectedTicket === ticket.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => {
                    setSelectedTicket(ticket.id);
                    setTicketTierId?.(ticket.id); 
                    setQuantity(1);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ticket.name}</span>
                        {selectedTicket === ticket.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ticket.available} available
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {formatPrice(ticket.price)}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Quantity Selector */}
          {selectedTicket && selected && (
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={quantity >= Math.min(10, selected.available)}
                  onClick={() =>
                    setQuantity(
                      Math.min(10, selected.available, quantity + 1)
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Total & Purchase */}
          {selectedTicket && (
            <div className="space-y-3 rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handlePurchase}
                disabled={isProcessing || !selected}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay {formatPrice(total)}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Secure payment powered by Paystack
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}