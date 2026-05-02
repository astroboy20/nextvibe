"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Gamepad2, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDate } from "@/hooks/format-date";

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
const FADE_MS  = 700;

export function EventCard({
  id = "1",
  title,
  date,
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

  const [flierOpacity, setFlierOpacity] = useState(1);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);

  // Intersection Observer — detect when card enters viewport
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

  // Ref callback — fires when <video> enters DOM
  const videoRefCallback = useCallback((vid: HTMLVideoElement | null) => {
    // Cleanup previous cycle
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

    // Force load the video
    vid.load();

    // Wait for it to be ready
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
  }, [promoVideoUrl, isVisible]);

  const accentBorder = {
    pink:   "border-vibe-pink/30",
    purple: "border-vibe-purple/30",
    cyan:   "border-vibe-cyan/30",
    plum:   "border-primary/30",
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
      <div className={cn("relative h-64 overflow-hidden rounded-t-2xl border-2", accentBorder)}>

        {!image && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
        )}

        {/* Video — underneath the flier */}
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

        {/* Flier — on top, fades out to reveal video */}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            style={{ opacity: flierOpacity, transition: `opacity ${FADE_MS}ms ease` }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

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
        <h3 className="font-display text-lg font-semibold line-clamp-1">{title}</h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(date)}</span>
        </div>

        {rsvpStartDateTime && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>RSVP opens {formatDate(rsvpStartDateTime)}</span>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          {attendees} Memories
        </div>
      </div>
    </div>
  );
}
