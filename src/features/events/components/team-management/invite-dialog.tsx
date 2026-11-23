"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useInviteCoOrganizerMutation } from "@/features/events/api/co-organizers-api";
import { CoOrganizerRole } from "@/features/events/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InviteCoOrganizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  canInviteSuperAdmin: boolean;
}

export function InviteCoOrganizerDialog({
  open,
  onOpenChange,
  eventId,
  canInviteSuperAdmin,
}: InviteCoOrganizerDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CoOrganizerRole>("CO_ORGANIZER");
  const [inviteCoOrganizer, { isLoading }] = useInviteCoOrganizerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const result = await inviteCoOrganizer({
        eventId,
        email,
        ...(canInviteSuperAdmin ? { role } : {}),
      }).unwrap();

      if (result.emailSent === false) {
        toast.warning(
          "Invite created, but the email failed to deliver. Share the invite link or re-invite to resend.",
          { duration: 5000 }
        );
      } else {
        toast.success("Invite sent successfully");
      }

      setEmail("");
      setRole("CO_ORGANIZER");
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.data?.message || "Failed to send invite";
      toast.error(message);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("CO_ORGANIZER");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Co-Organizer</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this event. The invite is
              valid for 7 days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {canInviteSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as CoOrganizerRole)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CO_ORGANIZER">Co-Organizer</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === "SUPER_ADMIN"
                    ? "Full admin access including billing and team management. Only 1 Super Admin per event."
                    : "Can manage day-to-day operations and view non-revenue analytics."}
                </p>
              </div>
            )}

            {!canInviteSuperAdmin && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You can only invite regular Co-Organizers. Only the event
                  owner can designate Super Admins.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
