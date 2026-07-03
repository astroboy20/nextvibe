/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  AlertTriangle,
  Loader2,
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
import {
  useCreateTicketMutation,
  useDeleteTicketMutation,
  useUpdateTicketMutation,
} from "@/app/provider/api/eventApi";
import { toast } from "sonner";

interface TicketCreatorEnhancedProps {
  eventId: string;
  eventDetails?: any;
}

export function TicketCreatorEnhanced({
  eventId,
  eventDetails,
}: TicketCreatorEnhancedProps) {
  const [tickets, setTickets] = useState(eventDetails);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    currency: "NGN",
    perks: "",
    ticketEndDate: "",
    ticketLink: "",
  });

  const [createTicketMutation, { isLoading: isCreatingLoading }] =
    useCreateTicketMutation();
  const [updateTicketMutation, { isLoading: isUpdatingLoading }] =
    useUpdateTicketMutation();
  const [deleteTicketMutation, { isLoading: isDeletingLoading }] =
    useDeleteTicketMutation();

  const totalRevenue = eventDetails?.reduce(
    (sum: number, t: any) => sum + t.price * t.quantitySold,
    0
  );
  const totalSold = eventDetails?.reduce(
    (sum: number, t: any) => sum + t.quantitySold,
    0
  );

  const handleCreateTicket = async () => {
    if (!newTicket.name || !newTicket.price) return;

    try {
      const ticketPayload = {
        name: newTicket.name,
        price: Number(newTicket.price),
        ...(newTicket.description && { description: newTicket.description }),
        ...(newTicket.quantity && { quantity: Number(newTicket.quantity) }),
        ...(newTicket.currency && { currency: newTicket.currency }),
        ...(newTicket.perks && { perks: newTicket.perks }),
        ...(newTicket.ticketEndDate && { ticketEndDate: newTicket.ticketEndDate }),
        ...(newTicket.ticketLink && { ticketLink: newTicket.ticketLink }),
      };

      const request = await createTicketMutation({
        ticketData: ticketPayload,
        eventId: eventId,
      }).unwrap();

      if (request?.success) {
        setTickets((prev) => [...(prev || []), request.data]);
        toast.success("Ticket created successfully");
        setIsCreating(false);
        setNewTicket({
          name: "",
          description: "",
          price: "",
          quantity: "",
          currency: "NGN",
          perks: "",
          ticketEndDate: "",
          ticketLink: "",
        });
      }
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.");
    }
  };

  const handleEditTicket = async () => {
    if (!editingTicket) return;

    try {
      const {
        id,
        eventId: _eid,
        createdAt,
        saleEndsAt,
        quantitySold,
        ...ticketData
      } = editingTicket;

      const request = await updateTicketMutation({
        ticketData,
        eventId: eventId,
        ticketId: id,
      }).unwrap();

      if (request?.success) {
        setTickets(
          tickets.map((t) => (t.id === editingTicket.id ? editingTicket : t))
        );
        toast.success("Ticket updated successfully");
        setEditingTicket(null);
      }
    } catch (error) {
      toast.error("Failed to update ticket. Please try again.");
    }
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicketId) return;

    try {
      const request = await deleteTicketMutation({
        eventId: eventId,
        ticketId: deletingTicketId,
      }).unwrap();

      if (request.success) {
        toast.success("Ticket deleted successfully");
        setTickets(tickets.filter((t) => t.id !== deletingTicketId));
        setDeletingTicketId(null);
      }
    } catch (error) {
      toast.error("Failed to delete ticket. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isSoldOut = (ticket: any) => {
    return ticket.quantity > 0 && ticket.quantitySold >= ticket.quantity;
  };

  const ticketToDelete = tickets?.find((t) => t.id === deletingTicketId);

  return (
    <div>
      {/* Revenue Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-green-500/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-green-600">
            {formatPrice(totalRevenue || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="rounded-xl bg-[#531342]/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">
            {totalSold || 0}
          </p>
          <p className="text-xs text-muted-foreground">Tickets Sold</p>
        </div>
      </div>

      {/* Add Ticket Button */}
      <div className="mb-4">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="w-full gap-1 rounded-xl bg-[#531342] text-white hover:bg-[#531342]/80 font-semibold"
            >
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
                  placeholder="Enter a description for the ticket?"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-perks">Perks</Label>
                <Input
                  id="ticket-perks"
                  placeholder="What's included?"
                  value={newTicket.perks}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, perks: e.target.value })
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
              {/* <div className="space-y-2">
                <Label htmlFor="ticket-payment-link">Payment Link</Label>
                <Input
                  id="ticket-payment-link"
                  placeholder="https://payment-link.com"
                  value={newTicket.ticketLink}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, ticketLink: e.target.value })
                  }
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="ticket-end-date">Ticket End Date</Label>
                <Input
                  id="ticket-end-date"
                  type="datetime-local"
                  value={newTicket.ticketEndDate}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      ticketEndDate: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={handleCreateTicket}
                disabled={isCreatingLoading}
                className="w-full bg-[#531342] text-white hover:bg-[#531342]/80 font-semibold"
              >
                {isCreatingLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Ticket Type"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ticket Types */}
      <div className="space-y-2">
        {tickets?.map((ticket: any) => {
          return (
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
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {ticket.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ticket?.quantitySold}/{ticket?.quantity || "∞"} sold
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
                      onClick={() =>
                        setEditingTicket({
                          ...ticket,
                          ticketEndDate: ticket.saleEndsAt
                            ? new Date(ticket.saleEndsAt)
                                .toISOString()
                                .slice(0, 16)
                            : "",
                        })
                      }
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
                            placeholder="e.g., Regular, VIP, Early Bird"
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
                            placeholder="Enter a description for the ticket?"
                            value={editingTicket.description}
                            onChange={(e) =>
                              setEditingTicket({
                                ...editingTicket,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Perks</Label>
                          <Input
                            placeholder="What's included?"
                            value={editingTicket.perks || ""}
                            onChange={(e) =>
                              setEditingTicket({
                                ...editingTicket,
                                perks: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price (₦)</Label>
                            <Input
                              type="number"
                              placeholder="0"
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
                              placeholder="Unlimited"
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
                        {/* <div className="space-y-2">
                          <Label>Payment Link</Label>
                          <Input
                            placeholder="https://payment-link.com"
                            value={editingTicket.ticketLink || ""}
                            onChange={(e) =>
                              setEditingTicket({
                                ...editingTicket,
                                ticketLink: e.target.value,
                              })
                            }
                          />
                        </div> */}
                        <div className="space-y-2">
                          <Label>Ticket End Date</Label>
                          <Input
                            type="datetime-local"
                            value={editingTicket.ticketEndDate || ""}
                            onChange={(e) =>
                              setEditingTicket({
                                ...editingTicket,
                                ticketEndDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-xs text-muted-foreground">
                            <strong>{editingTicket.quantitySold}</strong>{" "}
                            tickets already sold
                          </p>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingTicket(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleEditTicket}
                            disabled={isUpdatingLoading}
                            className="bg-[#531342] text-white hover:bg-[#531342]/80 font-semibold"
                          >
                            {isUpdatingLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
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
          );
        })}

        {tickets?.length === 0 && (
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
              {ticketToDelete && ticketToDelete.quantitySold > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: {ticketToDelete.quantitySold} tickets have already
                  been sold!
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTicket}
              disabled={isDeletingLoading}
              className="bg-red-500 text-destructive-foreground hover:bg-red-500/90"
            >
              {isDeletingLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Delete Ticket"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}