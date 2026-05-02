"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime } from "@/hooks/format-date";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { DisplayMap } from "./display-map";
import { useGetUserQuery } from "@/app/provider/api/userApi";

interface EventAboutTabProps {
  event: any;
}

export function EventAboutTab({ event }: EventAboutTabProps) {
  const { data: me } = useGetUserQuery();
  const isOrganizer = me?.data?.id && event?.organizer?.id
    ? me.data.id === event.organizer.id
    : false;

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

      {/* Description */}
      <div>
        <h3 className="font-semibold text-foreground mb-2">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed capitalize">
          {event?.description}
        </p>
      </div>

      {/* Organizer Card */}
      <Card className="py-0!">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Organized by</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={event?.organizer?.avatarUrl} />
                <AvatarFallback>
                  {event?.organizer?.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {event?.organizer?.displayName}
                </p>
                <p className="text-xs text-muted-foreground">Event Organizer</p>
              </div>
            </div>
            {!isOrganizer && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-primary font-bold border-2 border-primary hover:bg-primary/10"
              >
                Follow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Preview Placeholder */}
      <div className="relative h-50 w-full overflow-hidden rounded-2xl bg-muted">
        <DisplayMap address={event?.locationName} />
      </div>
    </div>
  );
}
