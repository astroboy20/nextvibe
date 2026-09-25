"use client";

import { memo } from "react";

interface PostcardCaptionProps {
  displayName?: string;
  avatarUrl?: string | null;
  caption: string;
  timeAgo: string;
  expanded: boolean;
  isLongCaption: boolean;
  onToggleExpanded: () => void;
}

export const PostcardCaption = memo(function PostcardCaption({
  displayName,
  avatarUrl,
  caption,
  timeAgo,
  expanded,
  isLongCaption,
  onToggleExpanded,
}: PostcardCaptionProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/75 to-transparent px-4 pb-5 pt-20 pr-24 text-white">
      <div className="flex max-w-[calc(100%-12px)] items-end gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-10 w-10 shrink-0 rounded-full border border-white/60 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
            {displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {displayName ?? "User"}
          </p>

        <p className="text-sm leading-5 text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {expanded || !isLongCaption
            ? caption
            : `${caption.slice(0, 120)}...`}

          {isLongCaption && (
            <button
              type="button"
              onClick={onToggleExpanded}
              className="ml-1 font-semibold text-white/80 hover:text-white"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </p>

          {timeAgo && (
            <p className="mt-2 text-xs text-white/65">{timeAgo}</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default PostcardCaption;
