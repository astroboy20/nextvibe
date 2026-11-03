
"use client";
import { Heart, MessageCircle, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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


interface PostcardMedia {
  id?: string;
  mediaUrl?: string | null;
  storageKey?: string | null;
  mediaType?: string | null;
  orderIndex?: number;
}

interface PostcardAuthor {
  id?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

interface PostcardEvent {
  id?: string;
  name?: string;
}

export interface PostcardItem {
  id?: string;
  caption?: string | null;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  author?: PostcardAuthor;
  event?: PostcardEvent;
  media?: PostcardMedia[];
}

interface PostcardGridProps {
  postcards?: PostcardItem[];
  isLoading?: boolean;
  onCardClick?: (postcard: PostcardItem) => void;
}


const PostcardGrid = ({
  postcards = [],
  isLoading = false,
  onCardClick,
}: PostcardGridProps) => {
  if (isLoading) {
    return (
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-3 break-inside-avoid">
            <Skeleton
              className="w-full rounded-2xl"
              style={{ height: `${180 + (i % 3) * 60}px` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (postcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <ImageOff className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No postcards yet. Be the first to share a memory!
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
      {postcards.map((postcard, index) => {
        const primaryMedia = postcard?.media?.[0];
        const src = resolveMediaUrl(primaryMedia);
        const isVideo = primaryMedia?.mediaType === "VIDEO";
        // Check for explicit mediaCount field or fall back to counting media array
        const mediaCount = postcard?.mediaCount ?? (postcard?.media ?? []).filter((m) => !!m.mediaUrl).length;
        const hasMultiple = mediaCount > 1;
        const eventName = postcard?.event?.name ?? "";
        const authorName =
          postcard?.author?.displayName ?? postcard?.author?.username ?? "";
        const likeCount = postcard?.likeCount ?? 0;
        const commentCount = postcard?.commentCount ?? 0;

        if (!src) return null;

        return (
          <div
            key={postcard?.id ?? index}
            onClick={() => onCardClick?.(postcard)}
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
                width={100}
                height={100}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              {isVideo && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 bg-black/40 rounded-full px-1.5 py-0.5 backdrop-blur-sm">
                  <svg className="h-3 w-3 text-white fill-white" viewBox="0 0 24 24">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
              )}
              
              {hasMultiple && !isVideo && (
                <div className="absolute top-2 right-2 z-10">
                  <svg
                    className="h-4 w-4 text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H7a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2zM5 7H3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2H5V7z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {eventName && (
                <p className="text-xs font-semibold line-clamp-1 mb-0.5">
                  {eventName}
                </p>
              )}
              {authorName && (
                <p className="text-[10px] text-white/70 line-clamp-1 mb-1">
                  @{authorName}
                </p>
              )}
              {postcard?.caption && (
                <p className="text-xs text-white/80 line-clamp-2 mb-1.5">
                  {postcard.caption}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs">
                  <Heart className="h-3.5 w-3.5" />
                  {likeCount}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {commentCount}
                </span>
              </div>
            </div>

            <button
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Like postcard"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PostcardGrid;
