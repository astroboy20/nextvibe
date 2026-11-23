"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, Shield, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetMyPendingInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} from "@/features/events/api/co-organizers-api";
import { toast } from "sonner";

const roleConfig = {
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Shield,
    color: "text-purple-600",
  },
  CO_ORGANIZER: {
    label: "Co-Organizer",
    icon: User,
    color: "text-blue-600",
  },
};

export function PendingInvitesBanner() {
  const router = useRouter();
  const { data: invites, isLoading } = useGetMyPendingInvitesQuery();
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation();
  const [declineInvite, { isLoading: isDeclining }] =
    useDeclineInviteMutation();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !invites || invites.length === 0 || dismissed) {
    return null;
  }

  const invite = invites[0]; // Show first invite
  const RoleIcon = roleConfig[invite.role].icon;

  const handleQuickAccept = async () => {
    try {
      const result = await acceptInvite(invite.token).unwrap();
      toast.success(`Welcome to ${result.eventName}!`);
      router.push(`/dashboard/events/${result.eventId}`);
    } catch (error: any) {
      if (error?.status === 403 || error?.status === 400) {
        // Navigate to full invite page for detailed error handling
        router.push(`/invites/co-organizer/${invite.token}`);
      } else {
        toast.error(error?.data?.message || "Failed to accept invite");
      }
    }
  };

  const handleQuickDecline = async () => {
    try {
      await declineInvite(invite.token).unwrap();
      toast.success("Invite declined");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to decline invite");
    }
  };

  return (
    <Alert className="bg-primary/5 border-primary/20 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 p-1 rounded-full hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <UserPlus className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center gap-2">
        Event Team Invitation
        {invites.length > 1 && (
          <Badge variant="secondary" className="text-xs">
            +{invites.length - 1} more
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium text-foreground">{invite.event.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              Invited by @{invite.invitedBy.username}
            </span>
            <Badge
              variant="outline"
              className={`${roleConfig[invite.role].color} text-xs`}
            >
              <RoleIcon className="h-3 w-3 mr-1" />
              {roleConfig[invite.role].label}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickDecline}
            disabled={isAccepting || isDeclining}
          >
            {isDeclining ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Decline"
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleQuickAccept}
            disabled={isAccepting || isDeclining}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept"
            )}
          </Button>
          {invites.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push("/invites")}
            >
              View All ({invites.length})
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
