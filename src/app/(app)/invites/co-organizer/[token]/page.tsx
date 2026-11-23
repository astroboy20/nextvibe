"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Shield,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useGetMyPendingInvitesQuery,
} from "@/features/events/api/co-organizers-api";
import { useAppSelector } from "@/store/hooks";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const roleConfig = {
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Shield,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    description:
      "Full administrative privileges including billing, team management, and revenue analytics",
  },
  CO_ORGANIZER: {
    label: "Co-Organizer",
    icon: User,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Day-to-day operations and non-revenue analytics access",
  },
};

export default function CoOrganizerInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = !!user;

  const { data: invites, isLoading } = useGetMyPendingInvitesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation();
  const [declineInvite, { isLoading: isDeclining }] =
    useDeclineInviteMutation();

  const [status, setStatus] = useState<
    "loading" | "ready" | "accepted" | "declined" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const invite = invites?.find((inv) => inv.token === token);

  useEffect(() => {
    if (!isAuthenticated) {
      // Preserve the invite URL for after login
      const redirectUrl = `/invites/co-organizer/${token}`;
      router.push(`/auth/login?from=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    if (!isLoading) {
      if (!invite) {
        setStatus("error");
        setErrorMessage(
          "This invite is no longer valid or has already been used"
        );
      } else {
        setStatus("ready");
      }
    }
  }, [isAuthenticated, isLoading, invite, token, router]);

  const handleAccept = async () => {
    try {
      const result = await acceptInvite(token).unwrap();
      setStatus("accepted");
      toast.success(`Welcome to ${result.eventName}!`);
      
      // Redirect to event dashboard after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/events/${result.eventId}`);
      }, 1500);
    } catch (error: any) {
      const message = error?.data?.message;
      
      if (error?.status === 403) {
        // Email mismatch
        setStatus("error");
        setErrorMessage(
          `This invite was sent to a different email address. You're logged in as ${user?.email}. Please switch accounts or sign in with the correct email.`
        );
      } else if (error?.status === 400) {
        // Expired or event ended
        setStatus("error");
        setErrorMessage(
          message ||
            "This invite has expired. Please contact the event owner for a new invitation."
        );
      } else {
        toast.error(message || "Failed to accept invite");
      }
    }
  };

  const handleDecline = async () => {
    try {
      await declineInvite(token).unwrap();
      setStatus("declined");
      toast.success("Invite declined");
      
      setTimeout(() => {
        router.push("/events");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to decline invite");
    }
  };

  if (!isAuthenticated || isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Invite Not Available</CardTitle>
                <CardDescription>Unable to process this invitation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/events")}
            >
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Welcome Aboard!</CardTitle>
                <CardDescription>
                  You're now part of the team
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirecting to event dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Invite Declined</CardTitle>
                <CardDescription>
                  You've declined this invitation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirecting to events...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) return null;

  const RoleIcon = roleConfig[invite.role].icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Event Team Invitation</CardTitle>
              <CardDescription>
                You've been invited to join as a team member
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
            {invite.event.flierUrl ? (
              <Image
                src={invite.event.flierUrl}
                alt={invite.event.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">{invite.event.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(invite.event.startsAt), "PPP")}
              </p>
            </div>

            <Badge
              variant="outline"
              className={`${roleConfig[invite.role].color} w-fit`}
            >
              <RoleIcon className="h-3 w-3 mr-1.5" />
              {roleConfig[invite.role].label}
            </Badge>

            <p className="text-sm text-muted-foreground">
              {roleConfig[invite.role].description}
            </p>
          </div>

          {/* Invited By */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Invited by</p>
              <p className="text-sm font-medium">
                {invite.invitedBy.displayName || `@${invite.invitedBy.username}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                "Decline"
              )}
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This invitation expires{" "}
            {format(new Date(invite.expiresAt), "PPP 'at' p")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
