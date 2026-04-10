/* eslint-disable @next/next/no-img-element */
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin,  Users, ExternalLink } from "lucide-react";

interface EventAboutTabProps {
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    attendees: number;
    organizer: {
      name: string;
      avatar: string;
    };
  };
}

export function EventAboutTab({ event }: EventAboutTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{event.date}</p>
            <p className="text-muted-foreground">{event.time}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{event.location}</p>
            <button className="text-primary text-xs hover:underline flex items-center gap-1">
              View on map <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{event.attendees} attending</p>
            <p className="text-muted-foreground">Be part of the vibe</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-foreground mb-2">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Organizer Card */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Organized by</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={event.organizer.avatar} />
                <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{event.organizer.name}</p>
                <p className="text-xs text-muted-foreground">Event Organizer</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              Follow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Preview Placeholder */}
      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-muted">
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=300&fit=crop"
          alt="Map"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button variant="secondary" className="rounded-full shadow-lg">
            <MapPin className="mr-2 h-4 w-4" />
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  );
}
