/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fullscreen?: boolean;
  eager?: boolean;

  /**
   * Sends the image's intrinsic dimensions
   * back to MediaSlide so the viewer can
   * determine whether the image actually
   * fills the viewport height.
   */
  onIntrinsicSize?: (width: number, height: number) => void;
}

export const ProgressiveImage = memo(function ProgressiveImage({
  src,
  alt,
  className,
  fullscreen = false,
  eager = false,
  onIntrinsicSize,
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  const [error, setError] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    const image = imgRef.current;

    if (!image) {
      return;
    }

    if (image.complete && image.naturalWidth > 0) {
      setLoaded(true);

      onIntrinsicSize?.(image.naturalWidth, image.naturalHeight);
    }
  }, [onIntrinsicSize, src]);

  const handleLoad = () => {
    const image = imgRef.current;

    setLoaded(true);

    if (image?.naturalWidth && image?.naturalHeight) {
      onIntrinsicSize?.(image.naturalWidth, image.naturalHeight);
    }
  };

  const image = error ? (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <ImageOff className="h-8 w-8 text-white/40" />
    </div>
  ) : (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={handleLoad}
      onError={() => setError(true)}
      className={cn(
        "transition-opacity duration-200",
        loaded ? "opacity-100" : "opacity-0",

        fullscreen
          ? "h-full max-h-full w-full max-w-full object-contain"
          : "block h-auto w-full",

        className
      )}
    />
  );

  /**
   * Fullscreen mode deliberately
   * keeps the loader full viewport.
   */
  if (fullscreen) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
        {!loaded && !error && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black"
            aria-label="Loading image"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          </div>
        )}

        {image}
      </div>
    );
  }

  return (
    <div className="relative min-h-30 w-full border">
      {!loaded && !error && (
        <div
          className="absolute inset-0 animate-pulse rounded-inherit bg-muted"
          aria-hidden="true"
        />
      )}

      {image}
    </div>
  );
});
