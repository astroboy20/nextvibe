"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetEventPostcardsQuery,
  useGetEventDetailsQuery,
} from "@/app/provider/api/eventApi";
import BottomNav from "@/components/navbar/bottom-navbar";
import {
  PostcardViewer,
  ProgressiveImage,
  type PostcardData,
} from "@/components/postcard-viewer";

type Phase = "all" | "pre-event" | "main-event" | "post-event";
const VALID_PHASES: Phase[] = ["all", "pre-event", "main-event", "post-event"];

// ─── Grid tile ────────────────────────────────────────────────────────────────

function GridTile({
  postcard,
  onClick,
}: {
  postcard: PostcardData;
  onClick: () => void;
}) {
  const primaryMedia = (postcard.media ?? []).find((m) => !!m.mediaUrl);

  if (!primaryMedia?.mediaUrl) return null;

  const src = primaryMedia.mediaUrl;
  const isVideo = primaryMedia.mediaType === "VIDEO";
  const hasMultiple =
    (postcard.media ?? []).filter((m) => !!m.mediaUrl).length > 1;
  return (
    <div
      onClick={onClick}
      className="relative mb-1 break-inside-avoid overflow-hidden rounded-lg cursor-pointer bg-muted"
    >
      {isVideo ? (
        <div className="relative">
          <video
            src={src}
            muted
            playsInline
            preload="auto"
            className="w-full object-cover rounded-lg min-h-30"
          />
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/40 rounded-full px-1.5 py-0.5 backdrop-blur-sm">
            <svg className="h-3 w-3 text-white fill-white" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        </div>
      ) : (
        <ProgressiveImage
          src={src}
          alt={postcard.caption ?? "Postcard"}
          className="rounded-lg"
        />
      )}
      {hasMultiple && (
        <div className="absolute top-1.5 right-1.5">
          <svg
            className="h-4 w-4 text-white drop-shadow"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3H7a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2zM5 7H3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2H5V7z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventPostcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPhase = (): Phase => {
    const p = searchParams.get("phase") as Phase;
    return VALID_PHASES.includes(p) ? p : "all";
  };

  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(
    null
  );
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

  const gridItems: PostcardData[] = (
    postcardsData?.data?.data ??
    postcardsData?.data ??
    []
  ).filter((p: PostcardData) => (p.media ?? []).some((m) => !!m.mediaUrl));
  const meta = postcardsData?.data?.meta ?? postcardsData?.meta;
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
        <div className="px-4 pb-3">
          <Tabs value={phase} onValueChange={handlePhaseChange}>
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="pre-event" className="text-xs">
                Pre
              </TabsTrigger>
              <TabsTrigger value="main-event" className="text-xs">
                Main
              </TabsTrigger>
              <TabsTrigger value="post-event" className="text-xs">
                Post
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-1 pt-1">
        {isLoading ? (
          <div className="columns-2 gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-1 break-inside-avoid">
                <Skeleton
                  className="w-full rounded-lg"
                  style={{ height: `${160 + (i % 3) * 60}px` }}
                />
              </div>
            ))}
          </div>
        ) : gridItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No postcards{phase !== "all" ? ` for ${phase}` : ""} yet.
            </p>
          </div>
        ) : (
          <>
            <div className="columns-2 gap-1">
              {gridItems.map((postcard, index) => (
                <GridTile
                  key={postcard.id ?? index}
                  postcard={postcard}
                  onClick={() => setSelectedPostcard(postcard)}
                />
              ))}
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
        <PostcardViewer
          postcard={selectedPostcard}
          eventId={id}
          eventName={eventName}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
