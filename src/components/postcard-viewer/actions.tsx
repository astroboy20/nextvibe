"use client";

import { memo } from "react";
import {
  Download,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  count?: number;
  ariaLabel: string;
}

function formatCount(value?: number) {
  if (value === undefined) {
    return undefined;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".0", "")}K`;
  }

  return `${value}`;
}

const ActionButton = memo(function ActionButton({
  icon,
  onClick,
  disabled,
  active,
  count,
  ariaLabel,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="group flex w-11 flex-col items-center gap-0.5 text-white disabled:opacity-60"
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-transform duration-150 group-active:scale-90 sm:h-10 sm:w-10",
          active && "bg-black/50"
        )}
      >
        {icon}
      </span>

      {count !== undefined && (
        <span className="min-h-3 text-[10px] font-semibold leading-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-[11px]">
          {formatCount(count)}
        </span>
      )}
    </button>
  );
});

interface PostcardActionsProps {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  sharing: boolean;
  downloading: boolean;

  /**
   * False means the current media
   * is letterboxed/shorter than the
   * available viewer height.
   */
  mediaFillsHeight: boolean;

  onLike: () => void;
  onComments: () => void;
  onShare: () => void;
  onDownload: () => void;
  onRepost?: () => void;
}

export const PostcardActions = memo(function PostcardActions({
  liked,
  likeCount,
  commentCount,
  viewCount,
  sharing,
  downloading,
  mediaFillsHeight,
  onLike,
  onComments,
  onShare,
  onDownload,
}: PostcardActionsProps) {
  return (
    <aside
      className={cn(
        "absolute right-2 z-30 flex flex-col items-center gap-1.5 transition-[bottom] duration-200 sm:right-3 sm:gap-2",

        /**
         * Full-height media:
         * keep rail slightly higher.
         *
         * Short media:
         * bring the entire action rail down.
         */
        mediaFillsHeight ? "bottom-14" : "bottom-3"
      )}
    >
      <ActionButton
        ariaLabel={liked ? "Unlike postcard" : "Like postcard"}
        onClick={onLike}
        active={liked}
        count={likeCount}
        icon={
          <Heart
            className={cn(
              "h-5 w-5 transition-all sm:h-6 sm:w-6",
              liked ? "fill-[#5B1A57] text-[#5B1A57]" : "text-white"
            )}
          />
        }
      />

      <ActionButton
        ariaLabel="View comments"
        onClick={onComments}
        count={commentCount}
        icon={<MessageCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />}
      />

      <ActionButton
        ariaLabel="Share postcard"
        onClick={onShare}
        disabled={sharing}
        icon={
          sharing ? (
            <Loader2 className="h-5 w-5 animate-spin text-white sm:h-6 sm:w-6" />
          ) : (
            <Send className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          )
        }
      />

      <ActionButton
        ariaLabel="Download postcard"
        onClick={onDownload}
        disabled={downloading}
        icon={
          downloading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white sm:h-6 sm:w-6" />
          ) : (
            <Download className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          )
        }
      />

      <div className="mt-0.5 flex flex-col items-center gap-0.5 text-white">
        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />

        <span className="text-[10px] font-semibold sm:text-[11px]">
          {formatCount(viewCount) ?? 0}
        </span>
      </div>
    </aside>
  );
});

export default PostcardActions;
