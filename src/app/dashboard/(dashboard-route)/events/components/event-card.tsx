"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Gamepad2, Lock, MapPin, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDate } from "@/hooks/format-date";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGetEventAttendeesQuery } from "@/app/provider/api/eventApi";

export interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  location?: string;
  image?: string;
  promoVideoUrl?: string;
  attendees?: number;
  hasGames?: boolean;
  hasVibeTag?: boolean;
  isPublic?: boolean;
  rsvpStartDateTime?: string | null;
  colorAccent?: "pink" | "purple" | "cyan" | "plum";
  className?: string;
  postcardCount?: number;
  /** "event" navigates to /events/:id, "postcard" to /postcards/:id */
  variant?: "event" | "postcard";
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
  isPublic,
  rsvpStartDateTime,
  colorAccent = "plum",
  className,
  postcardCount = 0,
  variant = "event",
}: EventCardProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: attendeesData } = useGetEventAttendeesQuery(
    { eventId: id },
    { skip: !id || id === "1" }
  );

  const liveAttendees: number = attendeesData?.data?.meta?.total ?? attendees;
  const attendeeList: { id: string; avatarUrl?: string; displayName?: string }[] =
    attendeesData?.data?.data?.map((a: any) => a.user) ?? [];

  const [flierOpacity, setFlierOpacity] = useState(1);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
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
        after(FADE_MS, () => { if (!destroyed) setFlierOpacity(0); });
      };

      const backToFlier = () => {
        if (destroyed) return;
        setFlierOpacity(1);
        after(FADE_MS, () => {
          if (!destroyed) setVideoOpacity(0);
          after(FLIER_MS, () => { if (!destroyed) playVideo(); });
        });
      };

      vid.onended = backToFlier;
      const begin = () => { if (!destroyed) after(FLIER_MS, playVideo); };
      vid.load();

      if (vid.readyState >= 3) {
        begin();
      } else {
        vid.addEventListener("loadeddata", begin, { once: true });
      }

      cleanupRef.current = () => {
        destroyed = true;
        timers.forEach(clearTimeout);
        vid.onended = null;
        vid.removeEventListener("loadeddata", begin);
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

  const href =
    variant === "postcard"
      ? `/events/${id}?tab=postcard`
      : `/events/${id}`;

  return (
    <div
      ref={containerRef}
      onClick={() => router.push(href)}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {/* Thumbnail */}
      <div className={cn("relative h-36 sm:h-48 overflow-hidden rounded-t-2xl border-2", accentBorder)}>
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
            style={{ opacity: videoOpacity, transition: `opacity ${FADE_MS}ms ease` }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {image && (
          <Image
            src={image}
            alt={title}
            width={400}
            height={192}
            style={{ opacity: flierOpacity, transition: `opacity ${FADE_MS}ms ease` }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {(hasGames || hasVibeTag || isPublic === false) && (
          <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
            {isPublic === false && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-semibold text-white">
                <Lock className="h-2.5 w-2.5" />
                Private
              </span>
            )}
            {hasGames && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-vibe-cyan/80 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-semibold text-white">
                <Gamepad2 className="h-2.5 w-2.5" />
                Games
              </span>
            )}
            {hasVibeTag && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/80 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-semibold text-white">
                <Tag className="h-2.5 w-2.5" />
                VibeTag
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5 sm:p-4">
        <h3 className="font-display text-sm sm:text-base font-semibold line-clamp-1">
          {title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{formatDate(date)}</span>
          <span className="text-border">•</span>
          <span className="shrink-0">{postcardCount} {postcardCount === 1 ? "Memory" : "Memories"}</span>
        </div>

        {location && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        {rsvpStartDateTime && variant === "event" && (
          <div className="mt-1 hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-2.5 w-2.5 shrink-0 text-primary" />
            <span>RSVP opens {formatDate(rsvpStartDateTime)}</span>
          </div>
        )}

        <div className="mt-2 flex items-center">
          {attendeeList.length > 0 ? (
            <>
              <div className="flex -space-x-1.5">
                {attendeeList.slice(0, 3).map((item, i) => (
                  <Avatar key={item.id ?? i} className="h-5 w-5 border-2 border-card">
                    {item.avatarUrl ? (
                      <AvatarImage src={item.avatarUrl} alt={item.displayName ?? "Attendee"} />
                    ) : null}
                    <AvatarFallback className="text-[9px]">{item.displayName?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {liveAttendees > 3 && (
                <span className="ml-1.5 text-[11px] text-muted-foreground">
                  +{liveAttendees - 3}
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground">No attendees yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
