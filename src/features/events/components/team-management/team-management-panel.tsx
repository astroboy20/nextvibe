"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  MoreVertical,
  Crown,
  Shield,
  User,
  Mail,
  Clock,
  Loader2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetCoOrganizersQuery,
  useInviteCoOrganizerMutation,
  useUpdateCoOrganizerRoleMutation,
  useRemoveCoOrganizerMutation,
  useLeaveEventMutation,
} from "@/features/events/api/co-organizers-api";
import { InviteCoOrganizerDialog } from "./invite-dialog";
import { CoOrganizerMember, EventRole } from "@/features/events/types";
import { formatDistanceToNow } from "date-fns";

interface TeamManagementPanelProps {
  eventId: string;
  eventStatus?: string;
  onLeave?: () => void;
}

const roleConfig = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Shield,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  CO_ORGANIZER: {
    label: "Co-Organizer",
    icon: User,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
};

export function TeamManagementPanel({
  eventId,
  eventStatus,
  onLeave,
}: TeamManagementPanelProps) {
  const { data, isLoading } = useGetCoOrganizersQuery(eventId);
  const [inviteCoOrganizer, { isLoading: isInviting }] =
    useInviteCoOrganizerMutation();
  const [updateRole, { isLoading: isUpdatingRole }] =
    useUpdateCoOrganizerRoleMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveCoOrganizerMutation();
  const [leaveEvent, { isLoading: isLeaving }] = useLeaveEventMutation();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [promoteConfirm, setPromoteConfirm] = useState<{
    member: CoOrganizerMember;
    currentSuperAdmin: CoOrganizerMember | null;
  } | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<CoOrganizerMember | null>(
    null
  );
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const myRole = data?.myRole;
  const members = data?.data ?? [];
  const max = data?.max ?? 10;

  const acceptedMembers = members.filter((m) => m.status === "ACCEPTED");
  const pendingInvites = members.filter((m) => m.status === "PENDING");

  const activeCount =
    acceptedMembers.length +
    pendingInvites.filter((inv) => !inv.expired).length;
  const canInvite =
    (myRole === "OWNER" || myRole === "SUPER_ADMIN") &&
    eventStatus !== "ENDED" &&
    eventStatus !== "CANCELLED" &&
    activeCount < max;

  const currentSuperAdmin = acceptedMembers.find(
    (m) => m.role === "SUPER_ADMIN"
  );

  const handlePromote = async (member: CoOrganizerMember, toRole: "SUPER_ADMIN" | "CO_ORGANIZER") => {
    if (toRole === "SUPER_ADMIN" && currentSuperAdmin) {
      setPromoteConfirm({ member, currentSuperAdmin });
      return;
    }

    try {
      await updateRole({
        eventId,
        coOrganizerId: member.id,
        role: toRole,
      }).unwrap();
      toast.success(
        `${member.user?.displayName || member.user?.username} ${toRole === "SUPER_ADMIN" ? "promoted to" : "demoted to"} ${roleConfig[toRole].label}`
      );
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update role");
    }
  };

  const confirmPromote = async () => {
    if (!promoteConfirm) return;

    try {
      await updateRole({
        eventId,
        coOrganizerId: promoteConfirm.member.id,
        role: "SUPER_ADMIN",
      }).unwrap();
      toast.success(
        `${promoteConfirm.member.user?.displayName || promoteConfirm.member.user?.username} promoted to Super Admin`
      );
      setPromoteConfirm(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to promote member");
    }
  };

  const handleRemove = async (member: CoOrganizerMember) => {
    try {
      await removeMember({ eventId, coOrganizerId: member.id }).unwrap();
      toast.success(
        member.status === "PENDING"
          ? "Invite removed"
          : `${member.user?.displayName || member.user?.username} removed from team`
      );
      setRemoveConfirm(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove member");
    }
  };

  const handleResend = async (member: CoOrganizerMember) => {
    if (!member.email) return;

    try {
      const result = await inviteCoOrganizer({
        eventId,
        email: member.email,
        role: member.role,
      }).unwrap();

      if (result.emailSent === false) {
        toast.warning(
          "Invite created, but the email failed to deliver. Share the invite link or re-invite to resend."
        );
      } else {
        toast.success("Invite resent successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend invite");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveEvent(eventId).unwrap();
      toast.success("You have left this event");
      setLeaveConfirm(false);
      onLeave?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to leave event");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription className="mt-1">
                Slots used: {activeCount} / {max}
              </CardDescription>
            </div>
            {canInvite && (
              <Button
                onClick={() => setInviteDialogOpen(true)}
                size="sm"
                disabled={activeCount >= max}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Invite
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Accepted Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Team Members ({acceptedMembers.length})
            </h3>
            {acceptedMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No team members yet
              </p>
            ) : (
              <div className="space-y-2">
                {acceptedMembers.map((member) => {
                  const RoleIcon = roleConfig[member.role].icon;
                  const canModify =
                    myRole === "OWNER" ||
                    (myRole === "SUPER_ADMIN" &&
                      member.role === "CO_ORGANIZER");

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={member.user?.avatarUrl ?? ""} />
                          <AvatarFallback>
                            {member.user?.displayName?.[0] ||
                              member.user?.username?.[0] ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {member.user?.displayName || member.user?.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{member.user?.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={roleConfig[member.role].color}
                        >
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleConfig[member.role].label}
                        </Badge>

                        {canModify && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {myRole === "OWNER" && (
                                <>
                                  {member.role === "CO_ORGANIZER" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handlePromote(member, "SUPER_ADMIN")
                                      }
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Promote to Super Admin
                                    </DropdownMenuItem>
                                  )}
                                  {member.role === "SUPER_ADMIN" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handlePromote(member, "CO_ORGANIZER")
                                      }
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Demote to Co-Organizer
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setRemoveConfirm(member)}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Invites (Only visible to OWNER and SUPER_ADMIN) */}
          {(myRole === "OWNER" || myRole === "SUPER_ADMIN") &&
            pendingInvites.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Pending Invites ({pendingInvites.length})
                </h3>
                <div className="space-y-2">
                  {pendingInvites.map((invite) => {
                    const RoleIcon = roleConfig[invite.role].icon;
                    const expiresIn = invite.expiresAt
                      ? formatDistanceToNow(new Date(invite.expiresAt), {
                          addSuffix: true,
                        })
                      : null;

                    return (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {invite.email}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {invite.expired ? (
                                <span className="text-destructive font-medium">
                                  Expired
                                </span>
                              ) : (
                                <span>Expires {expiresIn}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={roleConfig[invite.role].color}
                          >
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleConfig[invite.role].label}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleResend(invite)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setRemoveConfirm(invite)}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Remove Invite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Leave Event Button */}
          {(myRole === "SUPER_ADMIN" || myRole === "CO_ORGANIZER") && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setLeaveConfirm(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteCoOrganizerDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        eventId={eventId}
        canInviteSuperAdmin={myRole === "OWNER"}
      />

      {/* Promote Confirmation */}
      <AlertDialog
        open={!!promoteConfirm}
        onOpenChange={(open) => !open && setPromoteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Super Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              Promoting{" "}
              <strong>
                {promoteConfirm?.member.user?.displayName ||
                  promoteConfirm?.member.user?.username}
              </strong>{" "}
              will demote{" "}
              <strong>
                {promoteConfirm?.currentSuperAdmin?.user?.displayName ||
                  promoteConfirm?.currentSuperAdmin?.user?.username}
              </strong>{" "}
              to Co-Organizer. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPromote}>
              {isUpdatingRole ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Promoting...
                </>
              ) : (
                "Promote"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Confirmation */}
      <AlertDialog
        open={!!removeConfirm}
        onOpenChange={(open) => !open && setRemoveConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removeConfirm?.status === "PENDING"
                ? "Remove Invite?"
                : "Remove Team Member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeConfirm?.status === "PENDING"
                ? `Remove the invite sent to ${removeConfirm.email}?`
                : `Remove ${removeConfirm?.user?.displayName || removeConfirm?.user?.username} from the team?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeConfirm && handleRemove(removeConfirm)}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Confirmation */}
      <AlertDialog open={leaveConfirm} onOpenChange={setLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Event?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer have access to manage this event. You can be
              re-invited by the event owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLeave}
            >
              {isLeaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                "Leave Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
