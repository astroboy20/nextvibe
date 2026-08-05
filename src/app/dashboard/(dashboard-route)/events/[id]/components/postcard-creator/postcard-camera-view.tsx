/* eslint-disable @next/next/no-img-element */
"use client";
import { RefObject } from "react";
import { Loader2, SwitchCamera, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { QueuedItem, VibeTagOverlay } from "./types";
import { formatTime, MAX_RECORDING_SECS } from "./utils";

interface PostcardCameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  vibeTagOverlay?: VibeTagOverlay | null;
  facingMode: "environment" | "user";
  cameraMode: "photo" | "video";
  isCameraReady: boolean;
  isFlipping: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  cameraQueue: QueuedItem[];
  maxItems: number;
  onSetCameraMode: (mode: "photo" | "video") => void;
  onCapturePhoto: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFlipCamera: () => void;
  onGoToReview: () => void;
}

export function PostcardCameraView({
  videoRef,
  vibeTagOverlay,
  facingMode,
  cameraMode,
  isCameraReady,
  isFlipping,
  isRecording,
  recordingSeconds,
  cameraQueue,
  maxItems,
  onSetCameraMode,
  onCapturePhoto,
  onStartRecording,
  onStopRecording,
  onFlipCamera,
  onGoToReview,
}: PostcardCameraViewProps) {
  const hasOverlay = !!vibeTagOverlay?.imageUrl;
  const lastItem = cameraQueue[cameraQueue.length - 1];

  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover bg-black",
          facingMode === "user" && "transform-[scaleX(-1)]"
        )}
      />

      {!isCameraReady && !isFlipping && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black">
          <Loader2 className="h-9 w-9 animate-spin text-white" />
          <p className="text-white/70 text-sm">Starting camera...</p>
        </div>
      )}

      {hasOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <img src={vibeTagOverlay!.imageUrl} alt={vibeTagOverlay!.name} className="w-full h-full object-cover" />
        </div>
      )}

      {isRecording && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/80 border border-red-500/60 rounded-2xl px-5 py-2.5 shadow-lg shadow-red-500/20">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-md shadow-red-500" />
          <span className="text-white text-xl font-mono font-bold tracking-widest">{formatTime(recordingSeconds)}</span>
          <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">REC</span>
          <span className="text-white/50 text-xs">/ {formatTime(MAX_RECORDING_SECS)}</span>
        </div>
      )}

      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/50 rounded-full p-1">
        <button
          onClick={() => { if (isRecording) onStopRecording(); onSetCameraMode("photo"); }}
          className={cn("px-4 py-1.5 rounded-full text-xs font-semibold transition-colors", cameraMode === "photo" ? "bg-white text-black" : "text-white/70")}
        >Photo</button>
        <button
          onClick={() => onSetCameraMode("video")}
          className={cn("px-4 py-1.5 rounded-full text-xs font-semibold transition-colors", cameraMode === "video" ? "bg-white text-black" : "text-white/70")}
        >Video</button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-8 pb-10 pt-6">
        <button
          onClick={onGoToReview}
          disabled={cameraQueue.length === 0}
          className={cn("flex flex-col items-center gap-1 text-white", cameraQueue.length === 0 && "opacity-30 pointer-events-none")}
        >
          <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-white/60 bg-black/40">
            {lastItem && (lastItem.kind === "video" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Play className="h-4 w-4 text-white" />
              </div>
            ) : (
              <img src={lastItem.baked ?? lastItem.raw} alt="" className="h-full w-full object-cover" />
            ))}
            {cameraQueue.length > 0 && (
              <span className="absolute bottom-0 right-0 bg-primary text-white text-[9px] font-bold px-1 rounded-tl">{cameraQueue.length}</span>
            )}
          </div>
          <span className="text-[10px]">Review</span>
        </button>

        {cameraMode === "photo" ? (
          <button
            onClick={onCapturePhoto}
            disabled={!isCameraReady || cameraQueue.length >= maxItems}
            className={cn("relative flex h-19 w-19 items-center justify-center rounded-full transition-transform active:scale-90", (!isCameraReady || cameraQueue.length >= maxItems) && "opacity-30 pointer-events-none")}
            aria-label="Capture photo"
          >
            <span className="absolute inset-0 rounded-full border-[3px] border-white" />
            <span className="h-15 w-15 rounded-full bg-white" />
          </button>
        ) : (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={!isCameraReady}
            className={cn("relative flex h-19 w-19 items-center justify-center rounded-full transition-transform active:scale-90", !isCameraReady && "opacity-30 pointer-events-none")}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <span className="absolute inset-0 rounded-full border-[3px] border-white" />
            {isRecording ? <span className="h-7 w-7 rounded-md bg-red-500" /> : <span className="h-15 w-15 rounded-full bg-red-500" />}
          </button>
        )}

        <button onClick={onFlipCamera} className="flex flex-col items-center gap-1 text-white" aria-label="Flip camera">
          <div className="h-12 w-12 rounded-xl border-2 border-white/60 bg-black/40 flex items-center justify-center">
            <SwitchCamera className="h-5 w-5" />
          </div>
          <span className="text-[10px]">Flip</span>
        </button>
      </div>
    </div>
  );
}
