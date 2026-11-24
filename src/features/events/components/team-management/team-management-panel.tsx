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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";

interface TeamManagementPanelProps {
  eventId: string;
  eventStatus?: string;
  onLeave?: () => void;
}

/**
 * Shape of the API response:
 * { success: true, data: { myRole, max, data: CoOrganizerMember[] } }
 */
interface CoOrganizersPayload {
  myRole: EventRole;
  max: number;
  data: CoOrganizerMember[];
}

interface CoOrganizersResponse {
  success: boolean;
  data: CoOrganizersPayload;
}

const roleConfig = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    color:
      "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Shield,
    color:
      "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-900",
  },
  CO_ORGANIZER: {
    label: "Co-Organizer",
    icon: User,
    color:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-900",
  },
};

const getMemberName = (member?: CoOrganizerMember | null) =>
  member?.user?.displayName || member?.user?.username || member?.email || "";

function RoleBadge({
  role,
  className,
}: {
  role: CoOrganizerMember["role"];
  className?: string;
}) {
  const { icon: Icon, label, color } = roleConfig[role];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 whitespace-nowrap font-medium", color, className)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Users;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed py-8 text-center">
      <Icon className="mb-1 h-6 w-6 text-muted-foreground/60" />
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TeamManagementPanel({
  eventId,
  onLeave,
}: TeamManagementPanelProps) {
  const { data: response, isLoading, refetch } = useGetCoOrganizersQuery(
    eventId
  ) as {
    data?: CoOrganizersResponse;
    isLoading: boolean;
    refetch: () => void;
  };

  const [inviteCoOrganizer] = useInviteCoOrganizerMutation();
  const [updateRole, { isLoading: isUpdatingRole }] =
    useUpdateCoOrganizerRoleMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveCoOrganizerMutation();
  const [leaveEvent, { isLoading: isLeaving }] = useLeaveEventMutation();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [promoteConfirm, setPromoteConfirm] = useState<{
    member: CoOrganizerMember;
    currentSuperAdmin: CoOrganizerMember | null;
  } | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<CoOrganizerMember | null>(
    null
  );
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  // The real payload is nested one level down: response.data
  const payload = response?.data;
  const myRole = payload?.myRole;
  const members = payload?.data ?? [];
  const max = payload?.max ?? 10;

  const acceptedMembers = members?.filter((m) => m.status === "ACCEPTED");
  const pendingInvites = members?.filter((m) => m.status === "PENDING");

  const activeCount =
    acceptedMembers.length +
    pendingInvites.filter((inv) => !inv.expired).length;

  const isManager = myRole === "OWNER" || myRole === "SUPER_ADMIN";
  const shouldShowInvite = isManager;
  const canInvite = isManager && activeCount < max;

  const currentSuperAdmin =
    acceptedMembers.find((m) => m.role === "SUPER_ADMIN") ?? null;

  const handlePromote = async (
    member: CoOrganizerMember,
    toRole: "SUPER_ADMIN" | "CO_ORGANIZER"
  ) => {
    // Promoting someone while a Super Admin already exists needs confirmation,
    // because the existing Super Admin will be demoted.
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
        `${getMemberName(member)} ${
          toRole === "SUPER_ADMIN" ? "promoted to" : "demoted to"
        } ${roleConfig[toRole].label}`
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
        `${getMemberName(promoteConfirm.member)} promoted to Super Admin`
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
          : `${getMemberName(member)} removed from team`
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

      refetch();
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

  if (!payload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load team management. You may not have access to this
              event.
            </AlertDescription>
          </Alert>
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
            {shouldShowInvite && (
              <Button
                onClick={() => setInviteDialogOpen(true)}
                size="sm"
                disabled={!canInvite}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Invite
              </Button>
            )}
          </div>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={activeCount}
            aria-label="Team slots used"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                activeCount >= max ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${Math.min(100, (activeCount / max) * 100)}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isManager ? (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "active" | "pending")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="relative">
                  Active Members
                  {acceptedMembers.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {acceptedMembers.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  Pending Invites
                  {pendingInvites.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {pendingInvites.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4 space-y-2">
                {acceptedMembers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No active team members yet"
                    hint="Invite someone to help run this event."
                  />
                ) : (
                  acceptedMembers.map((member) => {
                    const canModify =
                      myRole === "OWNER" ||
                      (myRole === "SUPER_ADMIN" &&
                        member.role === "CO_ORGANIZER");

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={member.user?.avatarUrl ?? ""} />
                          <AvatarFallback>
                            {member.user?.displayName?.[0] ||
                              member.user?.username?.[0] ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium"
                            title={getMemberName(member)}
                          >
                            {getMemberName(member)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            @{member.user?.username}
                          </p>
                          <RoleBadge role={member.role} className="mt-1.5" />
                        </div>

                        {canModify && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 self-start"
                                aria-label="Member actions"
                              >
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
                                      <Shield className="mr-2 h-4 w-4" />
                                      Promote to Super Admin
                                    </DropdownMenuItem>
                                  )}
                                  {member.role === "SUPER_ADMIN" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handlePromote(member, "CO_ORGANIZER")
                                      }
                                    >
                                      <User className="mr-2 h-4 w-4" />
                                      Demote to Co-Organizer
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setRemoveConfirm(member)}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-4 space-y-2">
                {pendingInvites.length === 0 ? (
                  <EmptyState
                    icon={Mail}
                    title="No pending invites"
                    hint="Invites you send will show up here."
                  />
                ) : (
                  pendingInvites.map((invite) => {
                    const expiresIn = invite.expiresAt
                      ? formatDistanceToNow(new Date(invite.expiresAt), {
                          addSuffix: true,
                        })
                      : null;

                    return (
                      <div
                        key={invite.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50",
                          invite.expired && "border-destructive/30"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium"
                            title={invite.email ?? undefined}
                          >
                            {invite.email}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <RoleBadge role={invite.role} />
                            <span
                              className={cn(
                                "flex items-center gap-1 whitespace-nowrap text-xs",
                                invite.expired
                                  ? "font-medium text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Clock className="h-3 w-3" />
                              {invite.expired
                                ? "Expired"
                                : expiresIn
                                  ? `Expires ${expiresIn}`
                                  : "No expiry"}
                            </span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 self-start"
                              aria-label="Invite actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleResend(invite)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Invite
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setRemoveConfirm(invite)}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Remove Invite
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          ) : (
            /* CO_ORGANIZER view - only shows accepted members */
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Team members ({acceptedMembers.length})
              </h3>
              {acceptedMembers.length === 0 ? (
                <EmptyState icon={Users} title="No team members yet" />
              ) : (
                acceptedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={member.user?.avatarUrl ?? ""} />
                      <AvatarFallback>
                        {member.user?.displayName?.[0] ||
                          member.user?.username?.[0] ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        title={getMemberName(member)}
                      >
                        {getMemberName(member)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{member.user?.username}
                      </p>
                      <RoleBadge role={member.role} className="mt-1.5" />
                    </div>
                  </div>
                ))
              )}
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
        onInviteSuccess={refetch}
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
              Promoting <strong>{getMemberName(promoteConfirm?.member)}</strong>{" "}
              will demote{" "}
              <strong>
                {getMemberName(promoteConfirm?.currentSuperAdmin)}
              </strong>{" "}
              to Co-Organizer. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingRole}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isUpdatingRole}
              onClick={(e) => {
                // Keep the dialog open so the loading state is visible
                e.preventDefault();
                confirmPromote();
              }}
            >
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
                : `Remove ${getMemberName(removeConfirm)} from the team?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemoving}
              onClick={(e) => {
                e.preventDefault();
                if (removeConfirm) handleRemove(removeConfirm);
              }}
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
            <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLeaving}
              onClick={(e) => {
                e.preventDefault();
                handleLeave();
              }}
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