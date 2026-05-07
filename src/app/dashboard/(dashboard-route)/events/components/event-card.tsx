"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Gamepad2, MapPin, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDate } from "@/hooks/format-date";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGetEventAttendeesQuery } from "@/app/provider/api/eventApi";

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  location?: string;
  image?: string;
  promoVideoUrl?: string;
  attendees?: number;
  hasGames?: boolean;
  hasVibeTag?: boolean;
  rsvpStartDateTime?: string | null;
  colorAccent?: "pink" | "purple" | "cyan" | "plum";
  className?: string;
}

const FLIER_MS = 5000;
const FADE_MS = 700;

export function EventCard({
  id = "1",
  title,
  date,
  location,
  image,
  promoVideoUrl,
  attendees = 0,
  hasGames,
  hasVibeTag,
  rsvpStartDateTime,
  colorAccent = "plum",
  className,
}: EventCardProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: attendeesData } = useGetEventAttendeesQuery(
    { eventId: id },
    { skip: !id || id === "1" }
  );

  const liveAttendees: number = attendeesData?.data?.meta?.total ?? attendees;
  const attendeeList: {
    id: string;
    avatarUrl?: string;
    displayName?: string;
  }[] = attendeesData?.data?.data?.map((a: any) => a.user) ?? [];
  const totalMemories = 0;

  const [flierOpacity, setFlierOpacity] = useState(1);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const videoRefCallback = useCallback(
    (vid: HTMLVideoElement | null) => {
      if (!vid) {
        cleanupRef.current?.();
        cleanupRef.current = null;
        return;
      }

      if (!promoVideoUrl || !isVisible) return;

      let destroyed = false;
      const timers: ReturnType<typeof setTimeout>[] = [];

      const after = (ms: number, fn: () => void) => {
        const t = setTimeout(fn, ms);
        timers.push(t);
      };

      const playVideo = () => {
        if (destroyed) return;
        vid.currentTime = 0;
        vid.play().catch(() => {});
        setVideoOpacity(1);
        after(FADE_MS, () => {
          if (!destroyed) setFlierOpacity(0);
        });
      };

      const backToFlier = () => {
        if (destroyed) return;
        setFlierOpacity(1);
        after(FADE_MS, () => {
          if (!destroyed) setVideoOpacity(0);
          after(FLIER_MS, () => {
            if (!destroyed) playVideo();
          });
        });
      };

      vid.onended = backToFlier;

      const begin = () => {
        if (destroyed) return;
        after(FLIER_MS, playVideo);
      };

      vid.load();

      const onReady = () => {
        if (destroyed) return;
        begin();
      };

      if (vid.readyState >= 3) {
        begin();
      } else {
        vid.addEventListener("loadeddata", onReady, { once: true });
      }

      cleanupRef.current = () => {
        destroyed = true;
        timers.forEach(clearTimeout);
        vid.onended = null;
        vid.removeEventListener("loadeddata", onReady);
      };
    },
    [promoVideoUrl, isVisible]
  );

  const accentBorder = {
    pink: "border-vibe-pink/30",
    purple: "border-vibe-purple/30",
    cyan: "border-vibe-cyan/30",
    plum: "border-primary/30",
  }[colorAccent ?? "plum"];

  return (
    <div
      ref={containerRef}
      onClick={() => router.replace(`/dashboard/events/${id}`)}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "relative h-64 overflow-hidden rounded-t-2xl border-2",
          accentBorder
        )}
      >
        {!image && (
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/10" />
        )}
        {promoVideoUrl && (
          <video
            ref={videoRefCallback}
            src={promoVideoUrl}
            muted
            playsInline
            preload="none"
            style={{
              opacity: videoOpacity,
              transition: `opacity ${FADE_MS}ms ease`,
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {image && (
          <Image
            src={image}
            alt={title}
            width={100}
            height={100}
            style={{
              opacity: flierOpacity,
              transition: `opacity ${FADE_MS}ms ease`,
            }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {(hasGames || hasVibeTag) && (
          <div className="absolute top-2 right-2 flex gap-1.5 z-10">
            {hasGames && (
              <span className="inline-flex items-center gap-1 rounded-full bg-vibe-cyan/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
                <Gamepad2 className="h-3 w-3" />
                Games
              </span>
            )}
            {hasVibeTag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
                <Tag className="h-3 w-3" />
                VibeTag
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold line-clamp-1">
          {title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(date)}</span>
          <span className="text-border">•</span>
          <span>{totalMemories} Memories</span>
        </div>

        {location && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        {rsvpStartDateTime && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>RSVP opens {formatDate(rsvpStartDateTime)}</span>
          </div>
        )}

        <div className="mt-3 flex items-center">
          {attendeeList.length > 0 ? (
            <>
              <div className="flex -space-x-2">
                {attendeeList.slice(0, 3).map((item, i) => (
                  <Avatar
                    key={item.id ?? i}
                    className="h-7 w-7 border-2 border-card"
                  >
                    {item.avatarUrl ? (
                      <AvatarImage
                        src={item.avatarUrl}
                        alt={item.displayName ?? "Attendee"}
                      />
                    ) : null}
                    <AvatarFallback>
                      {item.displayName?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {liveAttendees > 3 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  +{liveAttendees - 3}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No attendees yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
