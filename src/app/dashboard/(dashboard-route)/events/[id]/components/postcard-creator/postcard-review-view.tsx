/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Camera,
  Upload,
  Loader2,
  Plus,
  Video,
  X,
  Download,
  Share2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QueuedItem, VibeTagOverlay } from "./types";

interface PostcardReviewViewProps {
  isCamera: boolean;
  activeQueue: QueuedItem[];
  activeIdx: number;
  vibeTagName: string;
  vibeTagOverlay?: VibeTagOverlay | null;
  caption: string;
  maxItems: number;
  isSubmitting: boolean;
  submitProgress: number;
  submitStage: "uploading" | "saving";
  facingMode: "environment" | "user";
  onSetActiveIdx: (idx: number) => void;
  onRemoveFromQueue: (id: string) => void;
  onUpdateCaption: (caption: string) => void;
  onDownload: (item: QueuedItem) => void;
  onShare: (item: QueuedItem) => void;
  onSubmitAll: () => void;
  onStartOver: () => void;
  onAddMore: () => void;
}

export function PostcardReviewView({
  isCamera,
  activeQueue,
  activeIdx,
  vibeTagName,
  vibeTagOverlay,
  caption,
  maxItems,
  isSubmitting,
  submitProgress,
  submitStage,
  onSetActiveIdx,
  onRemoveFromQueue,
  onUpdateCaption,
  onDownload,
  onShare,
  onSubmitAll,
  onStartOver,
  onAddMore,
}: PostcardReviewViewProps) {
  const hasOverlay = !!vibeTagOverlay?.imageUrl;
  const activeItem = activeQueue[activeIdx] ?? null;

  if (activeQueue.length === 0) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section badge */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <Badge variant="secondary" className="gap-1.5 text-xs">
          {isCamera ? (
            <Camera className="h-3 w-3" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          {isCamera ? "Camera captures" : "Uploaded media"}
        </Badge>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar shrink-0 border-b border-border">
        {activeQueue.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => onSetActiveIdx(idx)}
            className={cn(
              "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              idx === activeIdx
                ? "border-primary"
                : "border-transparent opacity-60"
            )}
            style={{ width: "45px", height: "80px" }}
          >
            {item.baking && item.kind === "image" ? (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              </div>
            ) : item.kind === "video" ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <Video className="h-4 w-4 text-white" />
                {hasOverlay && (
                  <img
                    src={vibeTagOverlay!.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                  />
                )}
                {item.baking && (
                  <div className="absolute bottom-0.5 right-0.5">
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <img
                src={item.baked ?? item.raw}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            {idx === activeIdx && (
              <span className="absolute inset-0 ring-2 ring-primary ring-inset rounded-lg" />
            )}
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onRemoveFromQueue(item.id);
              }}
              className="absolute top-0.5 right-0.5 z-10 h-4 w-4 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              aria-label="Remove"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </button>
        ))}

        {activeQueue.length < maxItems && (
          <button
            onClick={onAddMore}
            className="shrink-0 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            style={{ width: "45px", height: "80px" }}
            aria-label={isCamera ? "Take more" : "Upload more"}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active item preview + actions */}
      {activeItem && (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Media preview */}
            <div
              className="relative w-full overflow-hidden bg-muted shadow-md"
              style={{ aspectRatio: "9/16" }}
            >
              {activeItem.baking && activeItem.kind === "image" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Applying VibeTag…
                  </p>
                </div>
              ) : activeItem.kind === "video" ? (
                <>
                  <video
                    src={activeItem.baked ?? activeItem.raw}
                    controls
                    className="h-full w-full object-cover"
                    playsInline
                  />
                  {/* CSS overlay while baking */}
                  {hasOverlay && activeItem.baking && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <img
                        src={vibeTagOverlay!.imageUrl}
                        alt={vibeTagOverlay!.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* CSS overlay for large videos that skipped baking */}
                  {activeItem.overlayUrl && !activeItem.baking && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <img
                        src={activeItem.overlayUrl}
                        alt={vibeTagOverlay?.name ?? "VibeTag"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* Baking progress badge */}
                  {activeItem.baking && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                      <span className="text-white text-[10px] font-medium">
                        {activeItem.kind === "video"
                          ? "Stamping VibeTag into video…"
                          : "Stamping VibeTag…"}
                      </span>
                    </div>
                  )}
                  {/* Badge shown if baking skipped — overlay is CSS fallback */}
                  {activeItem.kind === "video" &&
                    !activeItem.baking &&
                    activeItem.overlayUrl && (
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-amber-500/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Sparkles className="h-3 w-3 text-white" />
                        <span className="text-white text-[10px] font-medium">
                          VibeTag stamped
                        </span>
                      </div>
                    )}
                </>
              ) : (
                <img
                  src={activeItem.baked ?? activeItem.raw}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}

              {/* Vibetag label for images without overlay */}
              {activeItem.kind === "image" &&
                !hasOverlay &&
                !activeItem.baking && (
                  <div className="absolute left-3 right-3 bottom-3 rounded-xl bg-black/60 backdrop-blur-sm p-2.5 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-white font-semibold text-xs truncate">
                        {vibeTagName}
                      </span>
                    </div>
                  </div>
                )}

              {/* Remove overlay button */}
              <button
                onClick={() => onRemoveFromQueue(activeItem.id)}
                className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Caption + actions */}
            <div className="px-4 pb-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Caption{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => onUpdateCaption(e.target.value)}
                  placeholder="Write something about this moment..."
                  className="rounded-xl resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onDownload(activeItem)}
                  disabled={activeItem.baking}
                  className="h-10 rounded-xl gap-1.5 flex-1"
                >
                  <Download className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onShare(activeItem)}
                  disabled={activeItem.baking}
                  className="h-10 rounded-xl gap-1.5 flex-1"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              <Button
                onClick={onSubmitAll}
                disabled={isSubmitting || activeQueue.some((i) => i.baking)}
                className="w-full h-12 rounded-xl gap-2"
              >
                {isSubmitting ? (
                  <div className="w-full space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        {submitStage === "uploading" ? "Uploading…" : "Saving…"}
                      </span>
                      <span className="font-semibold">{submitProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-200"
                        style={{ width: `${submitProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Post {activeQueue.length} Item
                    {activeQueue.length > 1 ? "s" : ""} to Event Feed
                  </>
                )}
              </Button>

              <button
                onClick={onStartOver}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
