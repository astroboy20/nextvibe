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
  Video,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreatePostcardMutation } from "@/app/provider/api/eventApi";

interface VibeTagOverlay {
  designUrl: string;
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

/**
 * Bakes a VibeTag overlay onto a base64 image using an offscreen canvas.
 * Returns a new base64 PNG string with the overlay composited on top.
 */
async function bakeVibeTagOntoImage(
  baseImageDataUrl: string,
  overlayUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas context unavailable"));

    const base = new Image();
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
      overlay.onerror = () => {
        // If overlay fails to load, return the base image unchanged
        resolve(baseImageDataUrl);
      };
      overlay.src = overlayUrl;
    };
    base.onerror = reject;
    base.src = baseImageDataUrl;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [createPostcard] = useCreatePostcardMutation();

  const hasImageOverlay =
    !!vibeTagOverlay?.designUrl &&
    vibeTagOverlay.designUrl.startsWith("http");

  // Bake overlay onto captured image whenever it changes
  useEffect(() => {
    if (!capturedImage) {
      setBakedImage(null);
      return;
    }
    if (!hasImageOverlay) {
      setBakedImage(capturedImage);
      return;
    }
    setIsBaking(true);
    bakeVibeTagOntoImage(capturedImage, vibeTagOverlay!.designUrl)
      .then((result) => setBakedImage(result))
      .catch(() => setBakedImage(capturedImage))
      .finally(() => setIsBaking(false));
  }, [capturedImage, hasImageOverlay, vibeTagOverlay]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
      setMode("camera");
    } catch {
      // Camera not available — fall back to file picker
      fileInputRef.current?.click();
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
      setMode("preview");
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
      setMode("preview");
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          caption || `Check out my postcard from ${eventName}!`
        );
        toast.success("Caption copied to clipboard — share the downloaded image!");
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
      if (eventId) {
        await createPostcard({ eventId, image: src, caption }).unwrap();
      }
      onSubmit?.({ image: src, caption });
    } catch {
      toast.error("Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const renderVibeTagOverlay = (position: "bottom" | "full") => {
    if (hasImageOverlay) {
      // When baking is done the overlay is already composited — show nothing on top
      return null;
    }
    return (
      <div
        className={cn(
          "absolute left-4 right-4 rounded-xl bg-black/60 backdrop-blur-sm p-3 pointer-events-none z-10",
          position === "bottom" ? "bottom-4" : "bottom-24"
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-white font-semibold text-sm">{vibeTagName}</span>
        </div>
        <p className="text-white/70 text-xs mt-1">{eventName}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-semibold text-foreground">Create Postcard</h2>
        <div className="w-9" />
      </div>

      {/* VibeTag active indicator */}
      {hasImageOverlay && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary gap-1 text-xs"
            >
              <Sparkles className="h-3 w-3" />
              {vibeTagOverlay!.name}
            </Badge>
            <span className="text-xs text-muted-foreground">VibeTag active</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* ── Choose mode ── */}
        {mode === "choose" && (
          <div className="p-6 space-y-6 animate-fade-in">
            <div className="relative aspect-[4/5] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-1">
              <div className="relative h-full w-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                <div className="text-center p-6">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Your photo will appear here with the VibeTag overlay
                  </p>
                </div>
                {renderVibeTagOverlay("bottom")}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Capture a memory with the event&apos;s VibeTag watermark
            </p>

            <div className="grid gap-3">
              <Button
                onClick={startCamera}
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
                Upload Photo
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
        )}

        {/* ── Camera mode ── */}
        {mode === "camera" && (
          <div className="relative h-full animate-fade-in">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {renderVibeTagOverlay("full")}

            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className={cn(
                  "h-20 w-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-all",
                  isCameraReady ? "active:scale-90" : "opacity-50"
                )}
                aria-label="Capture photo"
              >
                <div className="h-full w-full rounded-full border-2 border-white/50" />
              </button>
            </div>

            <button
              onClick={() => {
                stopCamera();
                setMode("choose");
              }}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white z-20"
              aria-label="Close camera"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Preview mode ── */}
        {mode === "preview" && capturedImage && (
          <div className="p-6 space-y-6 animate-fade-in">
            {/* Baked image preview */}
            <div className="relative aspect-[4/5] w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-muted">
              {isBaking ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <img
                  src={bakedImage ?? capturedImage}
                  alt="Postcard preview"
                  className="h-full w-full object-cover"
                />
              )}
              {/* Text-only overlay when no image overlay */}
              {!hasImageOverlay && renderVibeTagOverlay("bottom")}
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

            {/* Action row */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="h-12 rounded-xl gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isBaking}
                className="h-12 rounded-xl gap-2 flex-1"
              >
                <Download className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={isBaking}
                className="h-12 rounded-xl gap-2 flex-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isBaking || isSubmitting}
              className="w-full h-12 rounded-xl gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Post to Event Feed
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
