"use client";
import { use, useCallback, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  QrCode,
  Gamepad2,
  Tag,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft,
  Table,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { EventAboutTab } from "./components/event-about-tab";
import { EventRSVPTab } from "./components/event-rsvp-tab";
import { EventQRTab } from "./components/event-qr-tab";
import BottomNav from "@/components/navbar/bottom-navbar";
import { EventChatTab } from "./components/event-chat-tab";
import { EventGamesTab } from "./components/event-game-tab";
import { EventVibeTagsTab } from "./components/event-vibetags-tab";
import { useGetEventDetailsQuery } from "@/app/provider/api/eventApi";
import { toast } from "sonner";
import Image from "next/image";

const FLIER_MS = 5000;
const FADE_MS = 700;

const tabsConfig = [
  { value: "about",    label: "About",       icon: <Info className="mr-1.5 h-4 w-4" />,       always: true  },
  { value: "rsvp",     label: "RSVP",        icon: <Table className="mr-1.5 h-4 w-4" />,      always: true  },
  { value: "qr",       label: "QR",          icon: <QrCode className="mr-1.5 h-4 w-4" />,     always: true  },
  { value: "games",    label: "Games",       icon: <Gamepad2 className="mr-1.5 h-4 w-4" />,   always: false, flag: "hasGame"    as const },
  { value: "postcard", label: "Post Cards",  icon: <Tag className="mr-1.5 h-4 w-4" />,        always: false, flag: "hasVibeTag" as const },
  { value: "chat",     label: "Chat",        icon: <MessageCircle className="mr-1.5 h-4 w-4" />, always: true },
];

function EventPageSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-72 w-full bg-muted">
        <Skeleton className="h-full w-full rounded-none" />

        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute right-4 top-4 flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4 rounded-lg" />
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-background border-b border-border mt-5">
        <div className="flex gap-1 px-2 py-2 overflow-x-auto no-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-md" />
          ))}
        </div>

        <div className="container px-4 py-6 space-y-4">
          {/* Info rows */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>

          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>

          <Skeleton className="h-12 w-full rounded-xl mt-2" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: eventDetails, isLoading } = useGetEventDetailsQuery(id);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [isLiked, setIsLiked] = useState(false);

  const event = eventDetails?.data;
  const hasGame = event?.hasGame ?? false;
  const hasVibeTag = event?.hasVibeTag ?? (Array.isArray(event?.vibeTag) && event.vibeTag.length > 0);

  const visibleTabs = tabsConfig.filter(
    (t) => t.always || (t.flag === "hasGame" ? hasGame : hasVibeTag)
  );

  const eventUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/events/${id}`
      : "";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: eventDetails?.data?.name ?? "Event",
          text: "Check out this event",
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
        toast.success("Link copied to clipboard");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        await navigator.clipboard.writeText(eventUrl).catch(() => {});
        toast.success("Link copied to clipboard");
      }
    }
  };

  const [flierOpacity, setFlierOpacity] = useState(1);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const promoVideoUrl =
    eventDetails?.data?.promoVideoUrl ||
    eventDetails?.data?.promotionalVideoUrl ||
    eventDetails?.data?.data?.promotionalVideoUrl;

  const videoRefCallback = useCallback(
    (vid: HTMLVideoElement | null) => {
      if (!vid) {
        cleanupRef.current?.();
        cleanupRef.current = null;
        return;
      }

      if (!promoVideoUrl) return;

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
    [promoVideoUrl]
  );

  if (isLoading) {
    return (
      <EventPageSkeleton onBack={() => router.push("/dashboard/events")} />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 ">
      <div className="relative h-72 w-full overflow-hidden">
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
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        <Image
          src={
            eventDetails?.data?.flierUrl ||
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop"
          }
          alt={eventDetails?.data?.name}
          style={{
            opacity: flierOpacity,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
          height={100}
          width={100}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <button
          onClick={() => router.push("/dashboard/events")}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
          >
            <Heart
              className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}
            />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            {hasGame && (
              <Badge className="bg-accent/90 text-accent-foreground">
                <Gamepad2 className="mr-1 h-3 w-3" />
                Games
              </Badge>
            )}
            {hasVibeTag && (
              <Badge className="bg-primary/90 text-primary-foreground">
                <Tag className="mr-1 h-3 w-3" />
                VibeTag
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            {eventDetails?.data?.name}
          </h1>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-background border-b border-border mt-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-fit! justify-start gap-1 bg-transparent p-0 border-b rounded-none overflow-x-auto overflow-y-hidden no-scrollbar">
            {visibleTabs.map(({ value, label, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 shadow-none! px-3 pb-3 data-[state=active]:border-b-[#531342] data-[state=active]:bg-transparent"
              >
                {icon}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="container px-4 py-6">
            <TabsContent value="about" className="mt-0">
              <EventAboutTab event={eventDetails?.data} />
            </TabsContent>

            <TabsContent value="rsvp" className="mt-0">
              <EventRSVPTab event={eventDetails?.data} />
            </TabsContent>

            <TabsContent value="qr" className="mt-0">
              <EventQRTab event={eventDetails?.data} />
            </TabsContent>

            <TabsContent value="games" className="mt-0">
              <EventGamesTab event={eventDetails?.data} />
            </TabsContent>

            <TabsContent value="postcard" className="mt-0">
              <EventVibeTagsTab
                eventId={id}
                vibeTag={eventDetails?.data?.vibeTag ?? null}
                eventName={eventDetails?.data?.name ?? "Event"}
                eventStartsAt={eventDetails?.data?.startsAt ?? null}
              />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <EventChatTab eventId={id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
