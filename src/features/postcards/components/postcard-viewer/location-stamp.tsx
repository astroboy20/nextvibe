"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Clock, EyeOff, Loader2, MapPin } from "lucide-react";

interface LocationStampProps {
  /** ISO timestamp — the server's createdAt, rendered in the viewer's timezone. */
  createdAt?: string;
  locationLabel?: string | null;
  /** Author only: show the hide / show control. */
  canToggle?: boolean;
  /** Author only: a location exists (possibly hidden) that can be restored. */
  hasLocation?: boolean;
  toggling?: boolean;
  onToggleLocation?: (show: boolean) => void;
}

/**
 * Time, date and (opt-in) place stamp, drawn over the media at view time
 * rather than baked into the pixels — so the author can hide the location
 * later, and the time shows in each viewer's own timezone.
 */
export const LocationStamp = memo(function LocationStamp({
  createdAt,
  locationLabel,
  canToggle,
  hasLocation,
  toggling,
  onToggleLocation,
}: LocationStampProps) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  const isShown = !!locationLabel;

  return (
    <div className="pointer-events-none flex max-w-[200px] flex-col items-end gap-1.5 ">
      <div className="rounded-xl bg-black/45 px-3 py-1.5 text-[11px] font-medium leading-tight text-white backdrop-blur-md ">
        <time dateTime={createdAt} className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          {format(date, "d MMM yyyy · h:mm a")}
        </time>
        {isShown && (
          <span className="mt-1 flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{locationLabel}</span>
          </span>
        )}
      </div>

      {canToggle && hasLocation && onToggleLocation && (
        <button
          type="button"
          onClick={() => onToggleLocation(!isShown)}
          disabled={toggling}
          className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md transition-colors hover:bg-black/60 disabled:opacity-60"
        >
          {toggling ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : isShown ? (
            <EyeOff className="h-3 w-3" aria-hidden />
          ) : (
            <MapPin className="h-3 w-3" aria-hidden />
          )}
          {isShown ? "Hide location" : "Show location"}
        </button>
      )}
    </div>
  );
});
