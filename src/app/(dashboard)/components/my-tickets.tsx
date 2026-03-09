import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, QrCode, Download, Calendar, MapPin } from "lucide-react";
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
}

// Mock purchased tickets
const mockPurchasedTickets: PurchasedTicket[] = [
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
  },
  {
    id: "2",
    eventName: "Tech Meetup Lagos",
    ticketType: "Regular",
    quantity: 1,
    totalPaid: 5000,
    purchaseDate: "2025-01-10",
    eventDate: "Feb 5, 2025",
    eventLocation: "Co-Creation Hub, Yaba",
    status: "confirmed",
  },
];

interface MyTicketsProps {
  isOrganizer?: boolean;
}

export function MyTickets({ isOrganizer = false }: MyTicketsProps) {
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

  if (mockPurchasedTickets.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-4 w-4 text-primary" />
            {isOrganizer ? "Ticket Sales" : "My Tickets"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Ticket className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isOrganizer
                ? "No tickets sold yet"
                : "You haven't purchased any tickets yet"}
            </p>
            {!isOrganizer && (
              <Button variant="outline" size="sm" className="mt-3">
                Browse Events
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Ticket className="h-4 w-4 text-primary" />
          {isOrganizer ? "Recent Purchases" : "My Tickets"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockPurchasedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-border overflow-hidden"
            >
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{ticket.eventName}</h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {ticket.eventDate}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {ticket.eventLocation}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", getStatusColor(ticket.status))}
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-3 border-t border-dashed border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {ticket.ticketType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        × {ticket.quantity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">
                      {formatPrice(ticket.totalPaid)}
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
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
