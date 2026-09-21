/* eslint-disable @next/next/no-img-element */
"use client";
import { Camera, Upload, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VibeTagOverlay } from "./types";

interface PostcardChooseViewProps {
  vibeTagName: string;
  vibeTagOverlay?: VibeTagOverlay | null;
  eventName: string;
  cameraError: string | null;
  isProcessingUpload: boolean;
  localUploadProgress: number;
  maxItems: number;
  maxVideoUploadSizeMb: number;
  maxVideoDurationSecs: number;
  facingMode: "environment" | "user";
  onStartCamera: (facing: "environment" | "user") => void;
  onUploadClick: () => void;
}

export function PostcardChooseView({
  vibeTagName,
  vibeTagOverlay,
  eventName,
  cameraError,
  isProcessingUpload,
  localUploadProgress,
  maxItems,
  maxVideoUploadSizeMb,
  maxVideoDurationSecs,
  facingMode,
  onStartCamera,
  onUploadClick,
}: PostcardChooseViewProps) {
  const hasOverlay = !!vibeTagOverlay?.imageUrl;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6">
        <div className="relative w-full overflow-hidden bg-linear-to-br from-primary via-accent to-primary p-0.75">
          <div
            className="relative w-full bg-muted flex items-center justify-center overflow-hidden"
            style={{ aspectRatio: "9/16" }}
          >
            {hasOverlay ? (
              <img
                src={vibeTagOverlay!.imageUrl}
                alt={vibeTagOverlay!.name}
                className="absolute inset-0 w-full h-full object-cover z-10"
              />
            ) : (
              <>
                <div className="text-center p-6">
                  <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Your photo will appear here
                  </p>
                </div>
                <div className="absolute left-3 right-3 bottom-3 rounded-xl bg-black/60 backdrop-blur-sm p-2.5 pointer-events-none z-10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-white font-semibold text-xs truncate">
                      {vibeTagName}
                    </span>
                  </div>
                  <p className="text-white/60 text-[10px] mt-0.5 truncate">
                    {eventName}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {cameraError && (
          <p className="text-center text-xs text-destructive px-6">
            {cameraError}
          </p>
        )}

        <div className="grid gap-3 px-6 pb-6">
          <Button
            onClick={() => onStartCamera(facingMode)}
            className="h-14 rounded-2xl gap-3"
            size="lg"
          >
            <Camera className="h-5 w-5" />
            Take Photo / Record Video
            <span className="ml-auto text-xs opacity-60">max {maxItems}</span>
          </Button>

          {isProcessingUpload ? (
            <div className="h-14 rounded-2xl border border-border flex flex-col justify-center gap-2 px-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing…
                </span>
                <span>{localUploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${localUploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={onUploadClick}
              className="h-14 rounded-2xl gap-3"
              size="lg"
            >
              <Upload className="h-5 w-5" />
              Upload Photo or Video
              <span className="ml-auto text-xs opacity-60">
                max {maxItems} · videos ≤{maxVideoUploadSizeMb}MB /{" "}
                {maxVideoDurationSecs}s
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
