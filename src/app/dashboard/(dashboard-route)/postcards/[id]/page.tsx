"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ImageOff, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetEventPostcardsQuery,
  useGetEventDetailsQuery,
} from "@/app/provider/api/eventApi";
import { PostcardItem } from "../../events/components/postcard-grid";
import BottomNav from "@/components/navbar/bottom-navbar";
import { cn } from "@/lib/utils";
import Image from "next/image";

const STORAGE_BASE =
  process.env.NEXT_PUBLIC_STORAGE_BASE_URL ??
  "http://minio-production-5cff.up.railway.app:443/nextvibe";

function resolveMediaUrl(media?: {
  mediaUrl?: string | null;
  storageKey?: string | null;
}): string {
  if (media?.mediaUrl) return media.mediaUrl;
  if (media?.storageKey) return `${STORAGE_BASE}/${media.storageKey}`;
  return "";
}

interface LightboxProps {
  postcard: PostcardItem;
  onClose: () => void;
}

function Lightbox({ postcard, onClose }: LightboxProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const media = postcard.media ?? [];
  const current = media[activeIndex];
  const src = resolveMediaUrl(current);
  const isVideo = current?.mediaType === "VIDEO";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {postcard.author?.displayName || postcard.author?.username ? (
            <p className="text-sm font-semibold">
              @{postcard.author?.displayName ?? postcard.author?.username}
            </p>
          ) : null}
          {postcard.caption && (
            <p className="text-xs text-white/60 line-clamp-1 max-w-xs">
              {postcard.caption}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={src}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        ) : (
          <Image
            src={src}
            height={100}
            width={100}
            alt={postcard.caption ?? "Postcard"}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        )}
      </div>

      {media.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {media.map((m, i) => {
            const thumbSrc = resolveMediaUrl(m);
            return (
              <button
                key={m.id ?? i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === activeIndex
                    ? "border-white scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={thumbSrc}
                  alt="thumbnail"
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Phase = "all" | "pre-event" | "main-event" | "post-event";

const VALID_PHASES: Phase[] = ["all", "pre-event", "main-event", "post-event"];

export default function EventPostcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-select phase from query param (set by the event postcard tab)
  const initialPhase = (): Phase => {
    const p = searchParams.get("phase") as Phase;
    return VALID_PHASES.includes(p) ? p : "all";
  };

  const [selectedPostcard, setSelectedPostcard] = useState<PostcardItem | null>(null);
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const LIMIT = 40;

  const { data: eventDetails } = useGetEventDetailsQuery(id);
  const { data: postcardsData, isLoading } = useGetEventPostcardsQuery({
    eventId: id,
    page,
    limit: LIMIT,
    ...(phase !== "all" ? { phase } : {}),
  });

  const postcards: PostcardItem[] = postcardsData?.data?.data ?? [];
  const meta = postcardsData?.data?.meta;
  const eventName = eventDetails?.data?.name ?? "Event";

  const handlePhaseChange = (value: string) => {
    setPhase(value as Phase);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold text-base leading-tight truncate">
              Postcards
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {eventName}
            </p>
          </div>
        </div>

        {/* Phase filter tabs */}
        <div className="px-4 pb-3">
          <Tabs value={phase} onValueChange={handlePhaseChange}>
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="pre-event" className="text-xs">
                Pre-Event
              </TabsTrigger>
              <TabsTrigger value="main-event" className="text-xs">
                Main Event
              </TabsTrigger>
              <TabsTrigger value="post-event" className="text-xs">
                Post-Event
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container px-4 pt-4">
        {isLoading ? (
          <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="mb-3 break-inside-avoid">
                <Skeleton
                  className="w-full rounded-2xl"
                  style={{ height: `${180 + (i % 3) * 60}px` }}
                />
              </div>
            ))}
          </div>
        ) : postcards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No postcards for this{" "}
              {phase !== "all" ? `${phase} ` : ""}event yet.
            </p>
          </div>
        ) : (
          <>
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
              {postcards.map((postcard, index) => {
                const primaryMedia = postcard?.media?.[0];
                const src = resolveMediaUrl(primaryMedia);
                if (!src) return null;

                const mediaCount = postcard.media?.length ?? 0;

                return (
                  <div
                    key={postcard?.id ?? index}
                    onClick={() => setSelectedPostcard(postcard)}
                    className={cn(
                      "group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="relative aspect-auto">
                      <Image
                        src={src}
                        alt={postcard?.caption ?? eventName}
                        height={100}
                        width={100}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {mediaCount > 1 && (
                        <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                          +{mediaCount - 1}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {(postcard.author?.displayName ||
                        postcard.author?.username) && (
                        <p className="text-[10px] text-white/80 line-clamp-1">
                          @
                          {postcard.author?.displayName ??
                            postcard.author?.username}
                        </p>
                      )}
                      {postcard.caption && (
                        <p className="text-xs text-white/70 line-clamp-2 mt-0.5">
                          {postcard.caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {meta?.hasNext && (
              <div className="flex justify-center pt-6 pb-2">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPostcard && (
        <Lightbox
          postcard={selectedPostcard}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
