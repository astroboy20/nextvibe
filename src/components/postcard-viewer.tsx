"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { setHideHeader } from "@/store/slices/ui-slice";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  useGetPostcardCommentsQuery,
  useGetPostcardQuery,
  useToggleLikePostcardMutation,
} from "@/store/api/endpoints/postcards";
import { usePostcardViewTracker } from "@/hooks/use-views";
import { useGetUserQuery } from "@/store/api/authApi";
import { getGuestSessionId } from "@/lib/get-guest-session-id";

import { PostcardHeader } from "./postcard-viewer/header";
import { PostcardActions } from "./postcard-viewer/actions";
import { PostcardCaption } from "./postcard-viewer/caption";
import { DotIndicator } from "./postcard-viewer/dot-indicator";
import { MediaSlide } from "./postcard-viewer/media-slide";
import { useMediaPrepCache } from "./postcard-viewer/hooks/use-media-prep-cache";
import { usePostcardSwipe } from "./postcard-viewer/hooks/use-postcard-swipe";
import type {
  CommentData,
  PostcardMediaItem,
  PostcardViewerProps,
} from "./postcard-viewer/types";

const CommentSheet = dynamic(
  () =>
    import("./postcard-viewer/comment-sheet").then((mod) => mod.CommentSheet),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-80 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

const CAPTION_LIMIT = 120;

export const PostcardViewer = memo(function PostcardViewer({
  postcard,
  eventId,
  eventName,
  onClose,
  zIndex = 50,
  postcardList,
  initialPostcardIndex,
  onNavigatePostcard,
  onAddPostcard,
  onFilter,
  onRepost,
}: PostcardViewerProps) {
  const dispatch = useDispatch();

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postcard.likeCount ?? 0);

  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [expandedCaption, setExpandedCaption] = useState(false);

  /**
   * True until the active media reports its real dimensions.
   *
   * If the media is portrait enough to occupy the full available height,
   * the action rail is positioned slightly higher.
   *
   * If it is letterboxed/shorter than the viewport, the rail moves down.
   */
  const [activeMediaFillsHeight, setActiveMediaFillsHeight] = useState(true);

  const [toggleLikeMutation] = useToggleLikePostcardMutation();

  const { preparedMediaRef, prepareMedia, getOrFetchFile } =
    useMediaPrepCache();

  const currentPostcardIndex = initialPostcardIndex ?? 0;

  const swipeContainerRef = useRef<HTMLDivElement>(null);

  const { swipeOffset, swipeTransitioning } = usePostcardSwipe({
    containerRef: swipeContainerRef,
    currentIndex: currentPostcardIndex,
    total: postcardList?.length ?? 0,
    onNavigate: onNavigatePostcard,
    enabled: !!postcardList && postcardList.length > 1,
  });

  /**
   * Existing fresh postcard polling logic is preserved.
   */
  const { data: freshPostcard, isLoading } = useGetPostcardQuery(postcard.id!, {
    skip: !postcard.id,
    pollingInterval: 5_000,
    refetchOnMountOrArgChange: true,
  });

  const { data: userData } = useGetUserQuery();

  /**
   * Existing view tracking is preserved.
   */
  const cardRef = usePostcardViewTracker({
    postId: postcard?.id ?? "",
    sessionId: userData?.data?.id || getGuestSessionId(),
  });

  /**
   * Existing live comments query is preserved.
   */
  const { data: commentsData } = useGetPostcardCommentsQuery(postcard.id!, {
    skip: !postcard.id,
  });

  const freshData = freshPostcard?.data ?? freshPostcard;

  const liveComments: CommentData[] = commentsData?.data ?? commentsData ?? [];

  const commentCount =
    liveComments.length > 0 ? liveComments.length : postcard.commentCount ?? 0;

  const resolvedAuthor = freshData?.author ?? postcard.author;

  const displayName = resolvedAuthor?.displayName ?? resolvedAuthor?.username;

  const userId = resolvedAuthor?.id ;
  const resolvedEventName = postcard.event?.name ?? eventName;

  const media = useMemo(
    () => (postcard.media ?? []).filter((item) => !!item.mediaUrl),
    [postcard.media]
  );

  const caption = postcard.caption ?? "";

  const isLongCaption = caption.length > CAPTION_LIMIT;

  const timeAgo = useMemo(
    () =>
      postcard.createdAt
        ? formatDistanceToNow(new Date(postcard.createdAt), {
            addSuffix: true,
          })
        : "",
    [postcard.createdAt]
  );

  /**
   * Keep fresh like state synchronized
   * with the server.
   */
  useEffect(() => {
    if (!freshData) return;

    if (freshData.likeCount !== undefined) {
      setLikeCount(freshData.likeCount);
    }

    if (freshData.isLiked !== undefined) {
      setLiked(freshData.isLiked);
    }
  }, [freshData]);

  /**
   * Whenever the media index changes,
   * temporarily assume full-height until
   * the newly active media reports its
   * intrinsic dimensions.
   */
  useEffect(() => {
    setActiveMediaFillsHeight(true);
  }, [activeIndex]);

  /**
   * Lock body scroll while viewer is open.
   */
  useEffect(() => {
    dispatch(setHideHeader(true));

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      dispatch(setHideHeader(false));

      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, onClose]);

  /**
   * Track current carousel slide.
   */
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    onSelect();

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  /**
   * Preload adjacent images.
   */
  useEffect(() => {
    [activeIndex - 1, activeIndex, activeIndex + 1].forEach((index) => {
      const item = media[index];

      if (!item?.mediaUrl || item.mediaType === "VIDEO") {
        return;
      }

      const image = new window.Image();

      image.decoding = "async";
      image.src = item.mediaUrl;
    });
  }, [activeIndex, media]);

  /**
   * Existing share/download preparation.
   *
   * Current media is prepared immediately.
   * The next item is delayed slightly so
   * it does not compete with active playback.
   */
  useEffect(() => {
    const current = media[activeIndex];

    if (current) {
      prepareMedia(current);
    }

    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
        };
      }
    ).connection;

    if (connection?.saveData) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const next = media[activeIndex + 1];

      if (next) {
        prepareMedia(next);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, media, prepareMedia]);

  /**
   * Existing optimistic like logic.
   */
  const handleLike = useCallback(async () => {
    if (!postcard.id) return;

    const wasLiked = liked;

    setLiked(!wasLiked);

    setLikeCount((count) => Math.max(0, wasLiked ? count - 1 : count + 1));

    try {
      const result = await toggleLikeMutation({
        eventId,
        postcardId: postcard.id,
      }).unwrap();

      if (result?.currentLikes !== undefined) {
        setLikeCount(result.currentLikes);
      }

      if (result?.liked !== undefined) {
        setLiked(result.liked);
      }
    } catch {
      setLiked(wasLiked);

      setLikeCount((count) => Math.max(0, wasLiked ? count + 1 : count - 1));

      toast.error("Could not update like.");
    }
  }, [eventId, liked, postcard.id, toggleLikeMutation]);

  const triggerLikeAnimation = useCallback(() => {
    if (!liked) {
      handleLike();
    }

    setShowHeart(true);

    window.setTimeout(() => setShowHeart(false), 900);
  }, [handleLike, liked]);

  /**
   * Double-tap handling for photos.
   */
  const lastImageTapRef = useRef(0);

  const handleImageTap = useCallback(() => {
    const now = Date.now();

    if (now - lastImageTapRef.current < 300) {
      triggerLikeAnimation();
    }

    lastImageTapRef.current = now;
  }, [triggerLikeAnimation]);

  /**
   * Build deterministic download names.
   */
  const buildFilename = useCallback(
    (extension: string) => {
      const sanitise = (value: string) =>
        value
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "_")
          .slice(0, 40);

      const authorPart = sanitise(
        resolvedAuthor?.displayName ?? resolvedAuthor?.username ?? "user"
      );

      const eventPart = sanitise(resolvedEventName ?? "event");

      return `${authorPart}_${eventPart}_${activeIndex + 1}.${extension}`;
    },
    [activeIndex, resolvedAuthor, resolvedEventName]
  );

  /**
   * Existing download flow.
   */
  const handleDownload = useCallback(async () => {
    const currentMedia = media[activeIndex];

    if (!currentMedia?.mediaUrl) {
      return;
    }

    setDownloading(true);

    try {
      const isVideo = currentMedia.mediaType === "VIDEO";

      const file = await getOrFetchFile(currentMedia);

      if (!file) {
        throw new Error("Failed to fetch media");
      }

      const filename = buildFilename(isVideo ? "mp4" : "png");

      const url = URL.createObjectURL(file);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = filename;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);

      toast.success("Downloaded!");
    } catch {
      toast.error("Could not download. Try again.");
    } finally {
      setDownloading(false);
    }
  }, [activeIndex, buildFilename, getOrFetchFile, media]);

  /**
   * Existing share flow.
   */
  const handleShare = useCallback(async () => {
    const currentMedia: PostcardMediaItem | undefined = media[activeIndex];

    const authorLabel = resolvedAuthor?.displayName;

    const text = postcard.caption
      ? `${postcard.caption}\n\n— ${authorLabel} at ${resolvedEventName} via NextVibe`
      : `Check out this memory from ${resolvedEventName} by ${authorLabel} — NextVibe`;

    const shareUrl = postcard.id
      ? `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/postcard/${postcard.id}`
      : typeof window !== "undefined"
      ? window.location.href
      : "";

    if (!navigator.share) {
      await navigator.clipboard
        .writeText(`${text}\n\n${shareUrl}`)
        .catch(() => {});

      toast.success("Link copied to clipboard");

      return;
    }

    if (currentMedia?.mediaUrl) {
      const cached = preparedMediaRef.current.get(currentMedia.mediaUrl);

      /**
       * Fast path:
       * prepared File is already in memory.
       */
      if (cached?.status === "ready" && cached.file) {
        if (
          navigator.canShare?.({
            files: [cached.file],
          })
        ) {
          try {
            await navigator.share({
              files: [cached.file],
              title: `${resolvedEventName} — NextVibe`,
              text,
              url: shareUrl,
            });

            return;
          } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
          }
        }
      } else {
        /**
         * Slow path:
         * prepare the file on demand.
         */
        setSharing(true);

        try {
          const file = await getOrFetchFile(currentMedia);

          if (
            file &&
            navigator.canShare?.({
              files: [file],
            })
          ) {
            try {
              await navigator.share({
                files: [file],
                title: `${resolvedEventName} — NextVibe`,
                text,
                url: shareUrl,
              });

              return;
            } catch (error: unknown) {
              if (error instanceof Error && error.name === "AbortError") {
                return;
              }
            }
          }
        } catch {
          // Fall through to text-only share.
        } finally {
          setSharing(false);
        }
      }
    }

    try {
      await navigator.share({
        title: `${resolvedEventName} — NextVibe`,
        text,
        url: shareUrl,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      await navigator.clipboard
        .writeText(`${text}\n\n${shareUrl}`)
        .catch(() => {});

      toast.success("Link copied to clipboard");
    }
  }, [
    activeIndex,
    getOrFetchFile,
    media,
    postcard.caption,
    postcard.id,
    preparedMediaRef,
    resolvedAuthor?.displayName,
    resolvedEventName,
  ]);

  if (media.length === 0) {
    onClose();
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 flex flex-col overflow-hidden bg-[#090D0F]"
        style={{
          zIndex,
        }}
        ref={swipeContainerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${resolvedEventName} postcard viewer`}
      >
        <PostcardHeader
          title={resolvedEventName}
          onClose={onClose}
          onAdd={onAddPostcard}
          onFilter={onFilter}
        />

        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          ref={cardRef}
          style={{
            transform: `translate3d(0, ${swipeOffset}px, 0)`,
            transition: swipeTransitioning
              ? "transform 0.3s cubic-bezier(0.32,0.72,0,1)"
              : "none",
            willChange: swipeTransitioning ? "transform" : "auto",
          }}
        >
          <Carousel
            setApi={setCarouselApi}
            opts={{
              loop: false,
              dragFree: false,
            }}
            className="h-full w-full"
          >
            <CarouselContent className="ml-0 h-full">
              {media.map((item, index) => (
                <CarouselItem
                  key={item.id ?? `${item.mediaUrl}-${index}`}
                  className="h-full basis-full pl-0"
                >
                  <div className="relative h-full w-full bg-black">
                    <MediaSlide
                      media={item}
                      index={index}
                      activeIndex={activeIndex}
                      postcard={postcard}
                      onImageTap={handleImageTap}
                      onDoubleTap={triggerLikeAnimation}
                      onFillHeightChange={
                        index === activeIndex
                          ? setActiveMediaFillsHeight
                          : undefined
                      }
                    />

                    {/* Media counter */}
                    <div className="pointer-events-none absolute right-3 top-4 z-30 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      {index + 1}/{media.length}
                    </div>

                    {/* Double-tap heart */}
                    {showHeart && index === activeIndex && (
                      <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                        <Heart className="h-24 w-24 animate-ping fill-[#5B1A57] text-[#5B1A57] opacity-90" />
                      </div>
                    )}

                    {index === activeIndex && (
                      <>
                        <PostcardActions
                          liked={liked}
                          likeCount={likeCount}
                          commentCount={commentCount}
                          viewCount={freshData?.viewCount ?? 0}
                          sharing={sharing}
                          downloading={downloading}
                          mediaFillsHeight={activeMediaFillsHeight}
                          onLike={handleLike}
                          onComments={() => setShowComments(true)}
                          onShare={handleShare}
                          onDownload={handleDownload}
                          onRepost={onRepost}
                        />
                      </>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <PostcardCaption
            displayName={displayName}
            userId={userId}
            avatarUrl={resolvedAuthor?.avatarUrl}
            caption={caption}
            timeAgo={timeAgo}
            expanded={expandedCaption}
            isLongCaption={isLongCaption}
            onToggleExpanded={() => setExpandedCaption((expanded) => !expanded)}
          />
          {/* Dot indicator */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center">
            <div className="pointer-events-auto rounded-full bg-black/45 px-3 py-2 backdrop-blur-md">
              <DotIndicator
                total={media.length}
                active={activeIndex}
                onSelect={(index) => carouselApi?.scrollTo(index)}
              />
            </div>
          </div>
        </div>

        {isLoading && !resolvedAuthor && (
          <span className="sr-only" aria-live="polite">
            Loading postcard details
          </span>
        )}
      </div>

      {showComments && postcard.id && (
        <CommentSheet
          postcardId={postcard.id}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
});

export default PostcardViewer;

// Re-export the same public pieces the original file exposed so existing imports
// remain easy to migrate without changing application logic.
export { ProgressiveImage } from "./postcard-viewer/progressive-image";

export { DotIndicator } from "./postcard-viewer/dot-indicator";

export type {
  PostcardMediaItem,
  PostcardData,
  CommentData,
  PostcardViewerProps,
  PostcardViewerActionHandlers,
} from "./postcard-viewer/types";
