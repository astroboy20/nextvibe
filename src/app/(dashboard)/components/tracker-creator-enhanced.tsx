import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
}

// Mock data for tickets
const mockTickets: TicketType[] = [
  {
    id: "1",
    name: "Regular",
    description: "General admission ticket",
    price: 5000,
    quantity: 200,
    sold: 89,
  },
  {
    id: "2",
    name: "VIP",
    description: "VIP access with exclusive perks",
    price: 15000,
    quantity: 50,
    sold: 50, // Sold out!
  },
  {
    id: "3",
    name: "Table for 6",
    description: "Reserved table with 6 seats",
    price: 75000,
    quantity: 10,
    sold: 4,
  },
];

export function TicketCreatorEnhanced() {
  const [tickets, setTickets] = useState<TicketType[]>(mockTickets);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const totalRevenue = tickets.reduce((sum, t) => sum + t.price * t.sold, 0);
  const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0);

  const handleCreateTicket = () => {
    if (!newTicket.name || !newTicket.price) return;

    const ticket: TicketType = {
      id: Date.now().toString(),
      name: newTicket.name,
      description: newTicket.description,
      price: parseFloat(newTicket.price),
      quantity: parseInt(newTicket.quantity) || 0,
      sold: 0,
    };

    setTickets([...tickets, ticket]);
    setNewTicket({ name: "", description: "", price: "", quantity: "" });
    setIsCreating(false);
  };

  const handleEditTicket = () => {
    if (!editingTicket) return;

    setTickets(
      tickets.map((t) => (t.id === editingTicket.id ? editingTicket : t))
    );
    setEditingTicket(null);
  };

  const handleDeleteTicket = () => {
    if (!deletingTicketId) return;
    setTickets(tickets.filter((t) => t.id !== deletingTicketId));
    setDeletingTicketId(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isSoldOut = (ticket: TicketType) => {
    return ticket.quantity > 0 && ticket.sold >= ticket.quantity;
  };

  const ticketToDelete = tickets.find((t) => t.id === deletingTicketId);

  return (
    <div>
      {/* Revenue Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-green-500/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-green-600">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">
            {totalSold}
          </p>
          <p className="text-xs text-muted-foreground">Tickets Sold</p>
        </div>
      </div>

      {/* Add Ticket Button */}
      <div className="mb-4">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full gap-1 rounded-xl">
              <Plus className="h-3.5 w-3.5" />
              Add Ticket Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Ticket Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-name">Ticket Name</Label>
                <Input
                  id="ticket-name"
                  placeholder="e.g., Regular, VIP, Early Bird"
                  value={newTicket.name}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-desc">Description</Label>
                <Input
                  id="ticket-desc"
                  placeholder="What's included?"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-price">Price (₦)</Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    placeholder="0"
                    value={newTicket.price}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-qty">Quantity</Label>
                  <Input
                    id="ticket-qty"
                    type="number"
                    placeholder="Unlimited"
                    value={newTicket.quantity}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, quantity: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ticket Types */}
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3 transition-all",
              isSoldOut(ticket)
                ? "border-red-500/30 bg-red-500/5"
                : "border-border"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{ticket.name}</span>
                <Badge variant="outline" className="text-xs">
                  {formatPrice(ticket.price)}
                </Badge>
                {isSoldOut(ticket) && (
                  <Badge className="bg-red-500 text-white text-xs">
                    SOLD OUT
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {ticket.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ticket.sold}/{ticket.quantity || "∞"} sold
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* Edit Button */}
              <Dialog
                open={editingTicket?.id === ticket.id}
                onOpenChange={(open) => !open && setEditingTicket(null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingTicket({ ...ticket })}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Ticket Type</DialogTitle>
                    <DialogDescription>
                      Update the details for this ticket type.
                    </DialogDescription>
                  </DialogHeader>
                  {editingTicket && (
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Ticket Name</Label>
                        <Input
                          value={editingTicket.name}
                          onChange={(e) =>
                            setEditingTicket({
                              ...editingTicket,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editingTicket.description}
                          onChange={(e) =>
                            setEditingTicket({
                              ...editingTicket,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (₦)</Label>
                          <Input
                            type="number"
                            value={editingTicket.price}
                            onChange={(e) =>
                              setEditingTicket({
                                ...editingTicket,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={editingTicket.quantity}
                            onChange={(e) =>
                              setEditingTicket({
                                ...editingTicket,
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-xs text-muted-foreground">
                          <strong>{editingTicket.sold}</strong> tickets already
                          sold
                        </p>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setEditingTicket(null)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEditTicket}>Save Changes</Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeletingTicketId(ticket.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No ticket types yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setIsCreating(true)}
            >
              Create First Ticket
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTicketId}
        onOpenChange={(open) => !open && setDeletingTicketId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Ticket Type
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>&quot;{ticketToDelete?.name}&quot;</strong> ticket type?
              {ticketToDelete && ticketToDelete.sold > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: {ticketToDelete.sold} tickets have already been sold!
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTicket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
