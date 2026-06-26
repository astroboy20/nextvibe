"use client";

import { useState } from "react";
import {
  Laptop,
  Music,
  PartyPopper,
  Mic2,
  Heart,
  Cake,
  Users,
  Presentation,
  Sparkles,
  Tag,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVibeTagsQuery } from "@/app/provider/api/discoverApi";
import type { VibeTag } from "@/app/provider/api/discoverApi";
import { NewLogo } from "@/components/logo";

// Fallback icon map for known tag names
const ICON_MAP: Record<string, React.ElementType> = {
  tech: Laptop,
  technology: Laptop,
  music: Music,
  rave: Music,
  festival: PartyPopper,
  concert: Mic2,
  wedding: Heart,
  birthday: Cake,
  hangout: Users,
  conference: Presentation,
  social: Users,
  party: PartyPopper,
};

// Colour cycle for tags without a specific mapping
const COLOR_CYCLE = [
  "bg-vibe-cyan/10 text-vibe-cyan border-vibe-cyan/30",
  "bg-vibe-purple/10 text-vibe-purple border-vibe-purple/30",
  "bg-vibe-pink/10 text-vibe-pink border-vibe-pink/30",
  "bg-primary/10 text-primary border-primary/30",
];

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name.toLowerCase()] ?? Tag;
}

function getColor(index: number): string {
  return COLOR_CYCLE[index % COLOR_CYCLE.length];
}

interface InterestSelectorProps {
  /** Called with the selected tag IDs when the user taps Continue */
  onComplete: (selectedIds: string[]) => void;
  /** Show a spinner on the Continue button while the parent is saving */
  isSubmitting?: boolean;
}

export function InterestSelector({ onComplete, isSubmitting = false }: InterestSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const {
    data: tags = [],
    isLoading,
    isError,
    refetch,
  } = useGetVibeTagsQuery();

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 pt-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error / retry ────────────────────────────────────────────────────────
  if (isError || tags.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center gap-4">
        <Sparkles className="h-12 w-12 text-primary/40" />
        <div>
          <p className="font-semibold text-lg">Couldn&apos;t load vibes</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check your connection and try again.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 pt-16">
      <div className="w-full max-w-md animate-fade-up">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className=" flex justify-center items-center mb-8">
            <NewLogo/>
          </div>
          <h1 className="font-display text-3xl font-bold">What&apos;s your vibe?</h1>
          <p className="mt-2 text-muted-foreground">
            Select your interests to personalise your event feed
          </p>
        </div>

        {/* Tag grid — real tags from API */}
        <div className="grid grid-cols-2 gap-3">
          {tags.map((tag: VibeTag, index: number) => {
            const Icon = getIcon(tag.name);
            const colorClass = getColor(index);
            const isSelected = selected.includes(tag.id);
            const [bgColor, textColor] = colorClass.split(" ");

            return (
              <button
                key={tag.id}
                onClick={() => toggleInterest(tag.id)}
                className={cn(
                  "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all duration-200 animate-fade-in",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-card scale-[1.02]"
                    : "border-transparent bg-card shadow-sm hover:shadow-card hover:border-border"
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Icon — use imageUrl if available, otherwise icon */}
                {tag.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tag.imageUrl}
                    alt={tag.name}
                    className={cn(
                      "h-12 w-12 rounded-xl object-cover transition-opacity",
                      isSelected ? "opacity-100" : "opacity-80"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      isSelected ? "bg-primary/10" : bgColor
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-colors",
                        isSelected ? "text-primary" : textColor
                      )}
                    />
                  </div>
                )}

                <span className="font-semibold text-sm leading-tight text-center">
                  {tag.name}
                </span>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <div className="mt-8 space-y-3">
          <Button
            size="lg"
            className="w-full"
            disabled={selected.length === 0 || isSubmitting}
            onClick={() => onComplete(selected)}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <>
                Continue
                {selected.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold">
                    {selected.length} selected
                  </span>
                )}
              </>
            )}
          </Button>

          {selected.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Pick at least one to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
