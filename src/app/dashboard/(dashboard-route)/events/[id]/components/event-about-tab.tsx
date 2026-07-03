"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime } from "@/hooks/format-date";
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Check,
  Loader2,
  Video,
} from "lucide-react";
import { DisplayMap } from "./display-map";
import { useGetUserQuery } from "@/app/provider/api/userApi";
import { useToggleFollowMutation } from "@/app/provider/api/socialApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface EventAboutTabProps {
  event: any;
}

export function EventAboutTab({ event }: EventAboutTabProps) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const { data: me, isLoading: isLoadingUser } = useGetUserQuery(undefined, {
    // Only fetch the current user when they're logged in — avoids a noisy 401
    // on public event pages viewed by unauthenticated users.
    skip: typeof window !== "undefined" && !document.cookie.includes("accessToken"),
  });
  const isOrganizer =
    me?.data?.id && event?.organizer?.id
      ? me.data.id === event.organizer.id
      : false;

  const [toggleFollow, { isLoading: isFollowing }] = useToggleFollowMutation();
  const [followed, setFollowed] = useState(
    event?.organizer?.isFollowing ?? false
  );

  const handleFollow = async () => {
    if (!event?.organizer?.id) return;
    if (!requireAuth({ tab: "about" })) return;
    const prev = followed;
    setFollowed(!prev);
    try {
      await toggleFollow({ userId: event.organizer.id, isFollowing: prev }).unwrap();
      toast.success(prev ? "Unfollowed" : "Following!");
    } catch (err: any) {
      setFollowed(prev);
      toast.error(err?.data?.message ?? "Could not update follow status.");
    }
  };

  const openMap = () => {
    const query = encodeURIComponent(event?.locationName);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {formatDate(event?.startsAt)}
            </p>
            <p className="text-muted-foreground">
              {formatTime(event?.startsAt)}
            </p>
          </div>
        </div>

        {/* Location — shown for ONSITE and HYBRID */}
        {(event?.mode === "ONSITE" || event?.mode === "HYBRID" ||
          // fallback for older data that may not have a mode field
          (!event?.mode && event?.locationName)) && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{event?.locationName}</p>
              <button
                onClick={openMap}
                className="text-primary text-xs hover:underline flex items-center gap-1"
              >
                View on map <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Virtual link — shown for VIRTUAL and HYBRID */}
        {(event?.mode === "VIRTUAL" || event?.mode === "HYBRID") &&
          event?.virtualLink && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Online Event</p>
              <a
                href={event.virtualLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline flex items-center gap-1"
              >
                Join Online <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {event?.attendingCount} attending
            </p>
            <p className="text-muted-foreground">Be part of the vibe</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed capitalize">
          {event?.description}
        </p>
      </div>

      <Card className="py-0!">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Organized by</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-12 w-12 cursor-pointer"
                onClick={() => event?.organizer?.id && router.push(`/users/${event.organizer.id}`)}
              >
                <AvatarImage src={event?.organizer?.avatarUrl} />
                <AvatarFallback>
                  {event?.organizer?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div
                className="cursor-pointer"
                onClick={() => event?.organizer?.id && router.push(`/users/${event.organizer.id}`)}
              >
                <p className="font-semibold text-foreground hover:underline">
                  {event?.organizer?.displayName}
                </p>
                <p className="text-xs text-muted-foreground">Event Organizer</p>
              </div>
            </div>
            {!isLoadingUser && !isOrganizer && (
              <Button
                variant={followed ? "outline" : "outline"}
                size="sm"
                className={`rounded-full font-bold border-2 ${
                  followed
                    ? "border-green-500 text-green-600 hover:bg-green-500/10"
                    : "border-primary text-primary hover:bg-primary/10"
                }`}
                onClick={handleFollow}
                disabled={isFollowing}
              >
                {isFollowing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : followed ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Following
                  </>
                ) : (
                  "Follow"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Map — only for ONSITE and HYBRID events */}
      {event?.mode !== "VIRTUAL" && event?.locationName && (
        <div className="relative h-50 w-full overflow-hidden rounded-2xl bg-muted">
          <DisplayMap address={event?.locationName} />
        </div>
      )}
    </div>
  );
}
