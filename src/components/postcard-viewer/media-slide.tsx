"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { ProgressiveImage } from "./progressive-image";

import type { PostcardData, PostcardMediaItem } from "./types";

const VideoPlayer = dynamic(
  () => import("./video-player").then((mod) => mod.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    ),
  }
);

interface MediaSlideProps {
  media: PostcardMediaItem;
  index: number;
  activeIndex: number;
  postcard: PostcardData;
  onImageTap: () => void;
  onDoubleTap: () => void;

  /**
   * Tells the parent whether the actual
   * media fills the available viewer height.
   */
  onFillHeightChange?: (fillsHeight: boolean) => void;
}

export const MediaSlide = memo(function MediaSlide({
  media,
  index,
  activeIndex,
  postcard,
  onImageTap,
  onDoubleTap,
  onFillHeightChange,
}: MediaSlideProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  /**
   * Store intrinsic media dimensions
   * without forcing renders.
   */
  const mediaSizeRef = useRef<{
    width: number;
    height: number;
  } | null>(null);

  /**
   * Current available media stage size.
   */
  const [stageSize, setStageSize] = useState({
    width: 0,
    height: 0,
  });

  const isActive = index === activeIndex;

  const isAdjacent = Math.abs(index - activeIndex) === 1;

  /**
   * Performance optimization:
   *
   * only mount the active media and
   * its immediate neighbors.
   */
  const shouldMountMedia = isActive || isAdjacent;

  const isVideo = media.mediaType === "VIDEO";

  /**
   * Compare intrinsic media aspect
   * ratio to the viewer aspect ratio.
   *
   * Example:
   *
   * Tall portrait image
   * -> fills viewer height
   *
   * Landscape/smaller image
   * -> letterboxed and centered
   */
  const updateFillHeight = useCallback(() => {
    if (!stageSize.width || !stageSize.height) {
      return;
    }

    const mediaSize = mediaSizeRef.current;

    if (!mediaSize?.width || !mediaSize.height) {
      return;
    }

    const mediaAspectRatio = mediaSize.width / mediaSize.height;

    const stageAspectRatio = stageSize.width / stageSize.height;

    const fillsHeight = mediaAspectRatio <= stageAspectRatio + 0.01;

    if (isActive) {
      onFillHeightChange?.(fillsHeight);
    }
  }, [isActive, onFillHeightChange, stageSize.height, stageSize.width]);

  /**
   * Watch the viewer dimensions.
   *
   * This is important because responsive
   * mobile browser viewport sizes can
   * change dynamically.
   */
  useEffect(() => {
    const element = stageRef.current;

    if (!element) {
      return;
    }

    const update = () => {
      setStageSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    update();

    const observer = new ResizeObserver(update);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    updateFillHeight();
  }, [updateFillHeight]);

  /**
   * When another slide becomes active,
   * immediately re-evaluate its dimensions.
   */
  useEffect(() => {
    if (isActive) {
      updateFillHeight();
    }
  }, [isActive, updateFillHeight]);

  if (!shouldMountMedia) {
    return <div className="h-full w-full bg-black" aria-hidden="true" />;
  }

  /**
   * Receives dimensions from either
   * ProgressiveImage or VideoPlayer.
   */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleIntrinsicSize = useCallback(
    (width: number, height: number) => {
      mediaSizeRef.current = {
        width,
        height,
      };

      updateFillHeight();
    },
    [updateFillHeight]
  );

  return (
    <div
      ref={stageRef}
      className="flex h-full w-full items-center justify-center overflow-hidden bg-black"
    >
      {isVideo ? (
        <VideoPlayer
          src={media.mediaUrl!}
          active={isActive}
          onDoubleTap={onDoubleTap}
          onVideoMetadata={handleIntrinsicSize}
          vibeTagOverlayUrl={media.vibeTagOverlayUrl}
        />
      ) : (
        <div className="h-full w-full" onClick={onImageTap}>
          <ProgressiveImage
            src={media.mediaUrl!}
            alt={postcard.caption ?? "Postcard"}
            eager={index === 0 || isActive}
            fullscreen
            onIntrinsicSize={handleIntrinsicSize}
          />
        </div>
      )}
    </div>
  );
});

export default MediaSlide;
