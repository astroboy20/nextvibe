/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Image as ImageIcon,
  RotateCcw,
  Download,
  Share2,
  Loader2,
  SwitchCamera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreatePostcardMutation } from "@/app/provider/api/eventApi";

// ── Types ──────────────────────────────────────────────────────────────────────

// imageUrl matches eventDetails.data.vibeTag.imageUrl from the API
export interface VibeTagOverlay {
  imageUrl: string;
  name: string;
}

interface PostcardCreatorProps {
  vibeTagName?: string;
  vibeTagOverlay?: VibeTagOverlay | null;
  eventName?: string;
  eventId?: string;
  onClose?: () => void;
  onSubmit?: (data: { image: string; caption: string }) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Composites the VibeTag overlay on top of the captured photo using an
 * offscreen canvas. The overlay is drawn at full size over the photo.
 */
async function bakeOverlayOntoImage(
  baseDataUrl: string,
  overlayUrl: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(baseDataUrl); return; }

    const base = new Image();
    // crossOrigin needed for canvas taint rules
    base.crossOrigin = "anonymous";
    base.onload = () => {
      canvas.width = base.naturalWidth;
      canvas.height = base.naturalHeight;
      ctx.drawImage(base, 0, 0);

      const overlay = new Image();
      overlay.crossOrigin = "anonymous";
      overlay.onload = () => {
        ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png", 0.92));
      };
      // If overlay fails (CORS, network) just return the base photo
      overlay.onerror = () => resolve(baseDataUrl);
      overlay.src = overlayUrl;
    };
    base.onerror = () => resolve(baseDataUrl);
    base.src = baseDataUrl;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Detect whether the device has more than one camera (front + back). */
async function detectMultipleCameras(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return false;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoCams = devices.filter((d) => d.kind === "videoinput");
    return videoCams.length > 1;
  } catch {
    return false;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function PostcardCreator({
  vibeTagName = "Event VibeTag",
  vibeTagOverlay,
  eventName = "Event",
  eventId,
  onClose,
  onSubmit,
}: PostcardCreatorProps) {
  const [mode, setMode] = useState<"choose" | "camera" | "preview">("choose");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [bakedImage, setBakedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  // Camera state
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [canFlip, setCanFlip] = useState(false);

  // Processing state
  const [isBaking, setIsBaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [createPostcard] = useCreatePostcardMutation();

  const hasOverlay = !!vibeTagOverlay?.imageUrl;

  // ── Bake overlay after capture ─────────────────────────────────────────────
  useEffect(() => {
    if (!capturedImage) { setBakedImage(null); return; }
    if (!hasOverlay) { setBakedImage(capturedImage); return; }
    setIsBaking(true);
    bakeOverlayOntoImage(capturedImage, vibeTagOverlay!.imageUrl)
      .then(setBakedImage)
      .finally(() => setIsBaking(false));
  }, [capturedImage, hasOverlay, vibeTagOverlay]);

  // ── Camera helpers ─────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  /**
   * Attach a MediaStream to the video element and wait for it to be playable.
   * Works across iOS Safari, Android Chrome, Firefox, and desktop browsers.
   */
  const attachStream = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    video.srcObject = stream;

    const markReady = () => {
      setIsCameraReady(true);
    };

    // loadedmetadata fires when dimensions are known — reliable on most browsers
    video.addEventListener("loadedmetadata", markReady, { once: true });
    // canplay is a fallback for browsers that skip loadedmetadata
    video.addEventListener("canplay", markReady, { once: true });

    // iOS Safari requires an explicit .play() call after setting srcObject
    video.play().catch(() => {
      // Autoplay blocked — still mark ready so the shutter isn't permanently disabled
      markReady();
    });
  }, []);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    stopCamera();
    setIsCameraReady(false);
    setCameraError(null);

    // Build constraints — try exact facingMode first, fall back to ideal
    // iOS Safari is strict about facingMode; Android is more lenient
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if device has multiple cameras (enables flip button)
      detectMultipleCameras().then(setCanFlip);

      // Switch to camera mode — video element mounts after this setState
      setMode("camera");

      // Wait one tick for React to mount the <video> element, then attach
      // Using setTimeout(0) is more reliable than a useEffect dependency
      // because React batches state updates and the DOM may not be ready yet
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          attachStream(videoRef.current, streamRef.current);
        }
      }, 0);
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access in your browser settings."
        : err?.name === "NotFoundError"
        ? "No camera found on this device."
        : err?.name === "NotReadableError"
        ? "Camera is in use by another app."
        : "Could not access camera.";
      setCameraError(msg);
      // Fall back to file picker
      fileInputRef.current?.click();
    }
  }, [stopCamera, attachStream]);

  const handleOpenCamera = () => startCamera(facingMode);

  const handleFlipCamera = () => {
    const next: "environment" | "user" =
      facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  // ── Capture ────────────────────────────────────────────────────────────────

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Use actual video dimensions; fall back to element size if stream not ready
    const w = video.videoWidth || video.clientWidth;
    const h = video.videoHeight || video.clientHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the front camera so the captured image isn't flipped
    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);

    setCapturedImage(canvas.toDataURL("image/jpeg", 0.92));
    setMode("preview");
    stopCamera();
  };

  // ── File upload fallback ───────────────────────────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
      setMode("preview");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const retakePhoto = () => {
    setCapturedImage(null);
    setBakedImage(null);
    setMode("choose");
  };

  const handleDownload = () => {
    const src = bakedImage ?? capturedImage;
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `${eventName.replace(/\s+/g, "-")}-postcard.png`;
    a.click();
    toast.success("Postcard downloaded!");
  };

  const handleShare = async () => {
    const src = bakedImage ?? capturedImage;
    if (!src) return;
    try {
      const blob = dataUrlToBlob(src);
      const file = new File([blob], "postcard.png", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${eventName} Postcard`,
          text: caption || `Check out my postcard from ${eventName}!`,
        });
      } else {
        await navigator.clipboard.writeText(
          caption || `Check out my postcard from ${eventName}!`
        );
        toast.success("Caption copied — share the downloaded image!");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Could not share. Try downloading instead.");
      }
    }
  };

  const handleSubmit = async () => {
    const src = bakedImage ?? capturedImage;
    if (!src) return;
    setIsSubmitting(true);
    try {
      if (eventId) await createPostcard({ eventId, image: src, caption }).unwrap();
      onSubmit?.({ image: src, caption });
    } catch {
      toast.error("Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stop stream on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    // z-[100] sits above page header (z-20), sticky tabs (z-20), bottom nav (z-50)
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >
      {/* ── Header ── */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 shrink-0 border-b",
          mode === "camera"
            ? "absolute top-0 left-0 right-0 z-20 bg-black/70 border-white/10 backdrop-blur-sm"
            : "bg-background border-border"
        )}
      >
        <button
          onClick={() => { stopCamera(); onClose?.(); }}
          className={cn(
            "p-2 rounded-full transition-colors",
            mode === "camera" ? "text-white hover:bg-white/10" : "hover:bg-muted"
          )}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          className={cn(
            "font-semibold text-sm",
            mode === "camera" ? "text-white" : "text-foreground"
          )}
        >
          {mode === "camera" ? "Take Photo" : "Create Postcard"}
        </h2>

        {/* Flip button — only in camera mode and only when device has 2+ cameras */}
        {mode === "camera" && canFlip ? (
          <button
            onClick={handleFlipCamera}
            className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Flip camera"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* VibeTag indicator — choose / preview only */}
      {hasOverlay && mode !== "camera" && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 shrink-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary gap-1 text-xs"
            >
              <Sparkles className="h-3 w-3" />
              {vibeTagOverlay!.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              VibeTag will be stamped on your photo
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CAMERA MODE
          Full-screen viewfinder — NO overlay on the live feed so the user
          can frame their shot clearly. The VibeTag is only applied AFTER
          capture during the baking step.
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "camera" && (
        <div className="relative flex-1 bg-black overflow-hidden">
          {/* Live viewfinder — clean, no overlay */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              // CSS-mirror the preview for front camera (selfie feel)
              // The actual canvas capture corrects this mirror
              facingMode === "user" && "[transform:scaleX(-1)]"
            )}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Spinner while stream initialises */}
          {!isCameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
              <Loader2 className="h-9 w-9 animate-spin text-white" />
              <p className="text-white/70 text-sm">Starting camera…</p>
            </div>
          )}

          {/* Shutter bar — pinned to bottom, clears iOS home indicator */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center pb-10 pt-6 bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={capturePhoto}
              disabled={!isCameraReady}
              className={cn(
                "relative flex h-[76px] w-[76px] items-center justify-center rounded-full transition-transform active:scale-90",
                !isCameraReady && "opacity-30 pointer-events-none"
              )}
              aria-label="Capture photo"
            >
              <span className="absolute inset-0 rounded-full border-[3px] border-white" />
              <span className="h-[60px] w-[60px] rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CHOOSE MODE
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "choose" && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Preview card — shows what the final postcard will look like */}
            <div className="relative aspect-[4/5] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-[3px]">
              <div className="relative h-full w-full rounded-[14px] bg-muted flex items-center justify-center overflow-hidden">
                {hasOverlay ? (
                  /* Show the vibeTag image as a preview of what will be stamped */
                  <img
                    src={vibeTagOverlay!.imageUrl}
                    alt={vibeTagOverlay!.name}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                  />
                ) : (
                  <>
                    <div className="text-center p-6">
                      <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Your photo will appear here
                      </p>
                    </div>
                    {/* Text watermark fallback */}
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
              <p className="text-center text-xs text-destructive">{cameraError}</p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              The VibeTag will be stamped on your photo after capture
            </p>

            <div className="grid gap-3">
              <Button
                onClick={handleOpenCamera}
                className="h-14 rounded-2xl gap-3"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-14 rounded-2xl gap-3"
                size="lg"
              >
                <Upload className="h-5 w-5" />
                Upload from Gallery
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PREVIEW MODE — shows the baked result (photo + vibeTag composited)
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "preview" && capturedImage && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Baked image */}
            <div className="relative aspect-[4/5] w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden bg-muted shadow-md">
              {isBaking ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Applying VibeTag…
                  </p>
                </div>
              ) : (
                <img
                  src={bakedImage ?? capturedImage}
                  alt="Postcard preview"
                  className="h-full w-full object-cover"
                />
              )}
              {/* Text watermark when no image overlay */}
              {!hasOverlay && !isBaking && (
                <div className="absolute left-3 right-3 bottom-3 rounded-xl bg-black/60 backdrop-blur-sm p-2.5 pointer-events-none">
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
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Add a caption
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something about this moment..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            {/* Secondary actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="h-11 rounded-xl gap-2 flex-1"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isBaking}
                className="h-11 rounded-xl gap-2 flex-1"
              >
                <Download className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={isBaking}
                className="h-11 rounded-xl gap-2 flex-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={handleSubmit}
              disabled={isBaking || isSubmitting}
              className="w-full h-12 rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                "Post to Event Feed"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
