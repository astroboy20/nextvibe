import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Calendar, MapPin, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface PurchasedTicket {
  id: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  totalPaid: number;
  purchaseDate: string;
  eventDate: string;
  eventLocation: string;
  status: "confirmed" | "pending" | "used";
  buyerName: string;
  buyerEmail: string;
}

// Mock purchased tickets for organizer view
const mockPurchases: PurchasedTicket[] = [
  {
    id: "1",
    eventName: "Detty December 2025",
    ticketType: "VIP",
    quantity: 2,
    totalPaid: 30000,
    purchaseDate: "2025-01-15",
    eventDate: "Dec 20, 2025",
    eventLocation: "Eko Hotel, Lagos",
    status: "confirmed",
    buyerName: "Chioma Obi",
    buyerEmail: "chioma@example.com",
  },
  {
    id: "2",
    eventName: "Detty December 2025",
    ticketType: "Regular",
    quantity: 4,
    totalPaid: 20000,
    purchaseDate: "2025-01-14",
    eventDate: "Dec 20, 2025",
    eventLocation: "Eko Hotel, Lagos",
    status: "confirmed",
    buyerName: "Tunde Bello",
    buyerEmail: "tunde@example.com",
  },
  {
    id: "3",
    eventName: "Detty December 2025",
    ticketType: "Table for 6",
    quantity: 1,
    totalPaid: 75000,
    purchaseDate: "2025-01-12",
    eventDate: "Dec 20, 2025",
    eventLocation: "Eko Hotel, Lagos",
    status: "pending",
    buyerName: "Ade Johnson",
    buyerEmail: "ade@example.com",
  },
];

export function RecentPurchasesContent() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: PurchasedTicket["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "used":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "";
    }
  };

  if (mockPurchases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <Ticket className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No tickets sold yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mockPurchases.map((purchase) => (
        <div
          key={purchase.id}
          className="rounded-xl border border-border overflow-hidden"
        >
          {/* Purchase Header */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{purchase.buyerName}</p>
                <p className="text-xs text-muted-foreground">{purchase.buyerEmail}</p>
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs capitalize", getStatusColor(purchase.status))}
              >
                {purchase.status}
              </Badge>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="p-3 border-t border-dashed border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {purchase.ticketType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    × {purchase.quantity}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold">
                  {formatPrice(purchase.totalPaid)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button className="w-full text-center text-xs font-medium text-primary hover:underline">
        View All Purchases
      </button>
    </div>
  );
}
