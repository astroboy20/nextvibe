/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  active?: boolean;

  /**
   * Kept for compatibility with the
   * existing component API.
   */
  onSingleTap?: () => void;

  /**
   * Existing double-tap like behavior.
   */
  onDoubleTap?: () => void;

  /**
   * Intrinsic video dimensions used by
   * MediaSlide to determine whether the
   * video fills viewer height.
   */
  onVideoMetadata?: (width: number, height: number) => void;

  vibeTagOverlayUrl?: string | null;
}

const TAP_WINDOW = 280;
const PLAYBACK_INDICATOR_MS = 650;

export const VideoPlayer = memo(function VideoPlayer({
  src,
  active = true,
  onSingleTap,
  onDoubleTap,
  onVideoMetadata,
  vibeTagOverlayUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [muted, setMuted] = useState(true);

  const [buffering, setBuffering] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);

  const [showPlaybackIndicator, setShowPlaybackIndicator] = useState(false);

  const lastTapRef = useRef(0);

  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playbackIndicatorTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearSingleTapTimer = useCallback(() => {
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);

      singleTapTimerRef.current = null;
    }
  }, []);

  const clearPlaybackIndicatorTimer = useCallback(() => {
    if (playbackIndicatorTimerRef.current) {
      clearTimeout(playbackIndicatorTimerRef.current);

      playbackIndicatorTimerRef.current = null;
    }
  }, []);

  /**
   * Show the centered playback icon
   * briefly after a playback tap.
   */
  const showPlaybackState = useCallback(() => {
    setShowPlaybackIndicator(true);

    clearPlaybackIndicatorTimer();

    playbackIndicatorTimerRef.current = setTimeout(() => {
      playbackIndicatorTimerRef.current = null;

      setShowPlaybackIndicator(false);
    }, PLAYBACK_INDICATOR_MS);
  }, [clearPlaybackIndicatorTimer]);

  /**
   * Reset video state whenever
   * active media source changes.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;

    setMuted(true);
    setBuffering(true);
    setIsPlaying(false);
  }, [src]);

  /**
   * Existing active/inactive video
   * lifecycle is preserved.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();

      video.currentTime = 0;

      setIsPlaying(false);

      setShowPlaybackIndicator(false);
    }
  }, [active]);

  useEffect(() => {
    return () => {
      clearSingleTapTimer();
      clearPlaybackIndicatorTimer();
    };
  }, [clearPlaybackIndicatorTimer, clearSingleTapTimer]);

  /**
   * Single tap = play/pause.
   */
  const togglePlayback = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }

    onSingleTap?.();

    showPlaybackState();
  }, [onSingleTap, showPlaybackState]);

  /**
   * Explicit mute/unmute control.
   *
   * This is intentionally separate
   * from video tapping so users can
   * pause/play without unexpectedly
   * changing audio state.
   */
  const toggleMute = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const video = videoRef.current;

      if (!video) {
        return;
      }

      const nextMuted = !video.muted;

      video.muted = nextMuted;

      setMuted(nextMuted);
    },
    []
  );

  /**
   * Preserve single vs double tap:
   *
   * Single tap -> play/pause
   * Double tap -> like
   */
  const handleTap = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      const now = Date.now();

      const delta = now - lastTapRef.current;

      lastTapRef.current = now;

      if (delta < TAP_WINDOW) {
        clearSingleTapTimer();

        onDoubleTap?.();

        return;
      }

      clearSingleTapTimer();

      singleTapTimerRef.current = setTimeout(() => {
        singleTapTimerRef.current = null;

        togglePlayback();
      }, TAP_WINDOW);
    },
    [clearSingleTapTimer, onDoubleTap, togglePlayback]
  );

  /**
   * Report intrinsic video dimensions.
   */
  const handleMetadata = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      onVideoMetadata?.(video.videoWidth, video.videoHeight);
    }
  }, [onVideoMetadata]);

  return (
    <div
      className="relative flex h-full w-full touch-manipulation items-center justify-center overflow-hidden bg-black"
      onClick={handleTap}
    >
      {buffering && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white/80" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        playsInline
        muted
        preload={active ? "auto" : "metadata"}
        onLoadedMetadata={handleMetadata}
        onCanPlay={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => {
          setBuffering(false);

          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="h-full w-full object-contain"
      />
      {vibeTagOverlayUrl && (
        <div className="pointer-events-none absolute inset-0 z-10">
          <img
            src={vibeTagOverlayUrl}
            alt="VibeTag"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
      )}
      {!buffering && (!isPlaying || showPlaybackIndicator) && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 shadow-lg backdrop-blur-sm">
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-white text-white" />
            ) : (
              <Play className="ml-1 h-8 w-8 fill-white text-white" />
            )}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-transform active:scale-90"
      >
        {muted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
});
