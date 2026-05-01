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
  CheckCircle2,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUploadMultipleFilesMutation, useCreatePostcardsMutation } from "@/app/provider/api/eventApi";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import { useDispatch } from "react-redux";

const MAX_IMAGES = 20;

export interface VibeTagOverlay {
  imageUrl: string;
  name: string;
}

interface PostcardCreatorProps {
  vibeTagName?: string;
  vibeTagOverlay?: VibeTagOverlay | null;
  vibeTagId?: string;
  eventName?: string;
  eventId?: string;
  onClose?: () => void;
  onSubmit?: (data: { image: string; caption: string }) => void;
}

interface QueuedImage {
  id: string;
  raw: string;
  baked: string | null;
  caption: string;
  baking: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function bakeOverlay(
  baseDataUrl: string,
  overlayUrl: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(baseDataUrl);
      return;
    }
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

async function hasMultipleCameras(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput").length > 1;
  } catch {
    return false;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function PostcardCreator({
  vibeTagName = "Event VibeTag",
  vibeTagOverlay,
  vibeTagId,
  eventName = "Event",
  eventId,
  onClose,
  onSubmit,
}: PostcardCreatorProps) {
  // Modes:
  //  "choose"        → landing — pick camera or upload
  //  "camera"        → live viewfinder
  //  "camera-review" → review photos taken with camera  (own 20-cap)
  //  "upload-review" → review uploaded photos           (own 20-cap)
  const dispatch = useDispatch();
  const [mode, setMode] = useState<
    "choose" | "camera" | "camera-review" | "upload-review"
  >("choose");

  // Two completely independent queues — camera shots and uploads never mix
  const [cameraQueue, setCameraQueue] = useState<QueuedImage[]>([]);
  const [uploadQueue, setUploadQueue] = useState<QueuedImage[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  // Camera state
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [canFlip, setCanFlip] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // <video> is ALWAYS in the DOM so videoRef.current is never null when we attach the stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === "camera") {
      dispatch(setHideHeader(true));
    } else {
      dispatch(setHideHeader(false));
    }

    return () => {
      dispatch(setHideHeader(false)); // cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dispatch]);

  const [uploadMultipleFiles] = useUploadMultipleFilesMutation();
  const [createPostcards] = useCreatePostcardsMutation();
  const hasOverlay = !!vibeTagOverlay?.imageUrl;

  // ── Bake helper ────────────────────────────────────────────────────────────

  const bakeImage = useCallback(
    async (raw: string): Promise<string> => {
      if (!hasOverlay) return raw;
      return bakeOverlay(raw, vibeTagOverlay!.imageUrl);
    },
    [hasOverlay, vibeTagOverlay]
  );

  const addToQueue = useCallback(
    async (
      raw: string,
      setter: React.Dispatch<React.SetStateAction<QueuedImage[]>>,
      currentLength: number
    ) => {
      if (currentLength >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
        return;
      }
      const id = `${Date.now()}-${Math.random()}`;
      setter((q) => [
        ...q,
        { id, raw, baked: null, caption: "", baking: true },
      ]);
      const baked = await bakeImage(raw);
      setter((q) =>
        q.map((item) =>
          item.id === id ? { ...item, baked, baking: false } : item
        )
      );
    },
    [bakeImage]
  );

  // ── Camera ─────────────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not supported in this browser.");
        return;
      }
      stopCamera();
      setIsCameraReady(false);
      setCameraError(null);
      setMode("camera");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        streamRef.current = stream;

        // videoRef.current is guaranteed non-null — <video> is always in the DOM
        const video = videoRef.current!;
        video.srcObject = stream;

        const markReady = () => setIsCameraReady(true);
        video.addEventListener("loadedmetadata", markReady, { once: true });
        video.addEventListener("canplay", markReady, { once: true });
        // Fallback: if neither event fires within 3s, mark ready anyway
        const fallback = setTimeout(markReady, 3000);
        video.addEventListener("loadedmetadata", () => clearTimeout(fallback), {
          once: true,
        });
        video.addEventListener("canplay", () => clearTimeout(fallback), {
          once: true,
        });
        // iOS Safari requires explicit .play()
        video.play().catch(() => markReady());

        // Detect multiple cameras AFTER permission is granted (labels are only
        // available post-permission on Android Chrome / iOS Safari)
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoCams = devices.filter((d) => d.kind === "videoinput");
          setCanFlip(videoCams.length > 1);
        } catch {
          // If enumeration fails, show flip button anyway on mobile
          setCanFlip(/android|iphone|ipad|ipod/i.test(navigator.userAgent));
        }
      } catch (err: any) {
        const msg =
          err?.name === "NotAllowedError"
            ? "Camera permission denied. Allow access in browser settings."
            : err?.name === "NotFoundError"
            ? "No camera found on this device."
            : err?.name === "NotReadableError"
            ? "Camera is in use by another app."
            : "Could not start camera.";
        setCameraError(msg);
        toast.error(msg);
        setMode("choose");
      }
    },
    [stopCamera]
  );

  const handleFlipCamera = () => {
    const next: "environment" | "user" =
      facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    setIsFlipping(true);
    startCamera(next).finally(() => setIsFlipping(false));
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || video.clientWidth;
    const h = video.videoHeight || video.clientHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    const raw = canvas.toDataURL("image/jpeg", 0.92);

    // Goes into camera queue only
    addToQueue(raw, setCameraQueue, cameraQueue.length);

    if (cameraQueue.length + 1 >= MAX_IMAGES) {
      stopCamera();
      setMode("camera-review");
      setActiveIdx(cameraQueue.length);
    } else {
      toast.success(`Photo ${cameraQueue.length + 1}/${MAX_IMAGES} captured`);
    }
  };

  // ── File upload — upload queue only ───────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - uploadQueue.length;
    const toProcess = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.warning(
        `Only ${remaining} more image(s) can be added (max ${MAX_IMAGES}).`
      );
    }

    for (const file of toProcess) {
      const raw = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      await addToQueue(raw, setUploadQueue, uploadQueue.length);
    }

    setMode("upload-review");
    setActiveIdx(0);
    e.target.value = "";
  };

  // ── Queue helpers ──────────────────────────────────────────────────────────

  const isCamera = mode === "camera" || mode === "camera-review";
  const activeQueue = mode === "upload-review" ? uploadQueue : cameraQueue;
  const activeSetQueue =
    mode === "upload-review" ? setUploadQueue : setCameraQueue;

  const removeFromQueue = (id: string) => {
    activeSetQueue((q) => {
      const next = q.filter((item) => item.id !== id);
      if (next.length === 0) setMode("choose");
      else setActiveIdx((i) => Math.min(i, next.length - 1));
      return next;
    });
  };

  const updateCaption = (id: string, caption: string) => {
    activeSetQueue((q) =>
      q.map((item) => (item.id === id ? { ...item, caption } : item))
    );
  };

  // ── Submit — two-step upload ───────────────────────────────────────────────
  // Step 1: POST all baked images to /v1/storage/upload-multiple → get fileKeys[]
  // Step 2: POST { eventId, vibeTagId, media: [{ fileKey }] } to /v1/postcards

  const handleSubmitAll = async (queue: QueuedImage[]) => {
    const ready = queue.filter((item) => !item.baking);
    if (!ready.length) return;
    if (!eventId) { toast.error("Event ID missing."); return; }

    setIsSubmitting(true);
    try {
      // ── Step 1: upload files ──────────────────────────────────────────────
      const formData = new FormData();
      for (const item of ready) {
        const src = item.baked ?? item.raw;
        const blob = dataUrlToBlob(src);
        // Use a consistent filename; server doesn't care about the name
        formData.append("files", blob, `postcard-${item.id}.png`);
      }

      const uploadResult = await uploadMultipleFiles(formData).unwrap();
      // Each item in data has { url, fileKey, mediaType }
      // We only need fileKey and mediaType for the postcards endpoint
      const uploadedItems: { fileKey: string; mediaType: string }[] =
        (uploadResult?.data ?? []).map(
          (item: { fileKey: string; mediaType: string }) => ({
            fileKey: item.fileKey,
            mediaType: item.mediaType,
          })
        );

      if (!uploadedItems.length) {
        toast.error("Upload failed — no file keys returned.");
        return;
      }

      // ── Step 2: create postcards ──────────────────────────────────────────
      await createPostcards({
        eventId,
        vibeTagId,
        media: uploadedItems,
      }).unwrap();

      toast.success(`${ready.length} postcard${ready.length > 1 ? "s" : ""} posted!`);
      // Notify parent (vibetags tab) so it can refresh the grid
      ready.forEach((item) => onSubmit?.({ image: item.baked ?? item.raw, caption: item.caption }));
      onClose?.();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (item: QueuedImage) => {
    const src = item.baked ?? item.raw;
    const a = document.createElement("a");
    a.href = src;
    a.download = `${eventName.replace(/\s+/g, "-")}-postcard.png`;
    a.click();
    toast.success("Downloaded!");
  };

  const handleShare = async (item: QueuedImage) => {
    const src = item.baked ?? item.raw;
    try {
      const blob = dataUrlToBlob(src);
      const file = new File([blob], "postcard.png", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${eventName} Postcard`,
          text: item.caption,
        });
      } else {
        await navigator.clipboard.writeText(
          item.caption || `Check out my postcard from ${eventName}!`
        );
        toast.success("Caption copied!");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("Could not share.");
    }
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  const activeItem = activeQueue[activeIdx] ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-10000000!  flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >
      {/* canvas always in DOM for capture */}
      <canvas ref={canvasRef} className="hidden" />

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
          onClick={() => {
            stopCamera();
            onClose?.();
          }}
          className={cn(
            "p-2 rounded-full transition-colors",
            mode === "camera"
              ? "text-white hover:bg-white/10"
              : "hover:bg-muted"
          )}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center">
          <h2
            className={cn(
              "font-semibold text-sm",
              mode === "camera" ? "text-white" : "text-foreground"
            )}
          >
            {mode === "camera"
              ? "Take Photo"
              : mode === "camera-review"
              ? "Camera Photos"
              : mode === "upload-review"
              ? "Uploaded Photos"
              : "Create Postcard"}
          </h2>
          {mode === "camera" && (
            <span className="text-white/60 text-[10px]">
              {cameraQueue.length}/{MAX_IMAGES} captured
            </span>
          )}
          {(mode === "camera-review" || mode === "upload-review") &&
            activeQueue.length > 0 && (
              <span className="text-muted-foreground text-[10px]">
                {activeQueue.length}/{MAX_IMAGES} photo
                {activeQueue.length > 1 ? "s" : ""}
              </span>
            )}
        </div>

        {/* Right action per mode — flip is now in the shutter bar */}
        {mode === "camera-review" && cameraQueue.length < MAX_IMAGES ? (
          <button
            onClick={() => startCamera(facingMode)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Take more photos"
          >
            <Camera className="h-5 w-5" />
          </button>
        ) : mode === "upload-review" && uploadQueue.length < MAX_IMAGES ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Upload more photos"
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* VibeTag indicator */}
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
              VibeTag will be stamped on your photos
            </span>
          </div>
        </div>
      )}

      {/* ══ CAMERA MODE ══════════════════════════════════════════════════════ */}
      {mode === "camera" && (
        <div className="absolute inset-0 bg-black">
          {/* Live viewfinder — inside camera div so z-order is correct */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 w-full h-full object-cover ",
              facingMode === "user" && "[transform:scaleX(-1)]"
            )}
          />

          {/* Spinner — only on first open, not when flipping */}
          {!isCameraReady && !isFlipping && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black">
              <Loader2 className="h-9 w-9 animate-spin text-white" />
              <p className="text-white/70 text-sm">Starting camera…</p>
            </div>
          )}

          {/* VibeTag overlay on the live viewfinder so the user can frame their shot */}
          {hasOverlay && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <img
                src={vibeTagOverlay!.imageUrl}
                alt={vibeTagOverlay!.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-8 pb-10 pt-6 bg-gradient-to-t from-black/70 to-transparent">
            {/* Review thumbnail */}
            <button
              onClick={() => {
                stopCamera();
                setMode("camera-review");
                setActiveIdx(0);
              }}
              disabled={cameraQueue.length === 0}
              className={cn(
                "flex flex-col items-center gap-1 text-white",
                cameraQueue.length === 0 && "opacity-30 pointer-events-none"
              )}
            >
              <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-white/60 bg-black/40">
                {cameraQueue[cameraQueue.length - 1] && (
                  <img
                    src={
                      cameraQueue[cameraQueue.length - 1].baked ??
                      cameraQueue[cameraQueue.length - 1].raw
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                {cameraQueue.length > 0 && (
                  <span className="absolute bottom-0 right-0 bg-primary text-white text-[9px] font-bold px-1 rounded-tl">
                    {cameraQueue.length}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Review</span>
            </button>

            {/* Shutter */}
            <button
              onClick={capturePhoto}
              disabled={!isCameraReady || cameraQueue.length >= MAX_IMAGES}
              className={cn(
                "relative flex h-[76px] w-[76px] items-center justify-center rounded-full transition-transform active:scale-90",
                (!isCameraReady || cameraQueue.length >= MAX_IMAGES) &&
                  "opacity-30 pointer-events-none"
              )}
              aria-label="Capture photo"
            >
              <span className="absolute inset-0 rounded-full border-[3px] border-white" />
              <span className="h-[60px] w-[60px] rounded-full bg-white" />
            </button>

            {/* Flip camera — always shown in shutter bar on mobile, hidden on desktop if only 1 cam */}
            <button
              onClick={handleFlipCamera}
              className="flex flex-col items-center gap-1 text-white"
              aria-label="Flip camera"
            >
              <div className="h-12 w-12 rounded-xl border-2 border-white/60 bg-black/40 flex items-center justify-center">
                <SwitchCamera className="h-5 w-5" />
              </div>
              <span className="text-[10px]">Flip</span>
            </button>
          </div>
        </div>
      )}

      {/* ══ CHOOSE MODE ══════════════════════════════════════════════════════ */}
      {mode === "choose" && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* VibeTag preview card */}
            <div className="relative aspect-[4/5] w-full max-w-[220px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-[3px]">
              <div className="relative h-full w-full rounded-[14px] bg-muted flex items-center justify-center overflow-hidden">
                {hasOverlay ? (
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
              <p className="text-center text-xs text-destructive">
                {cameraError}
              </p>
            )}

            <div className="space-y-1 text-center">
              <p className="text-sm text-muted-foreground">
                Each route is independent — up to {MAX_IMAGES} photos each
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                onClick={() => startCamera(facingMode)}
                className="h-14 rounded-2xl gap-3"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                Take Photo
                <span className="ml-auto text-xs opacity-60">
                  max {MAX_IMAGES}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-14 rounded-2xl gap-3"
                size="lg"
              >
                <Upload className="h-5 w-5" />
                Upload from Gallery
                <span className="ml-auto text-xs opacity-60">
                  max {MAX_IMAGES}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REVIEW MODE (camera-review + upload-review share this UI) ════════ */}
      {(mode === "camera-review" || mode === "upload-review") &&
        activeQueue.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Source label */}
            <div className="px-4 pt-3 pb-1 shrink-0">
              <Badge variant="secondary" className="gap-1.5 text-xs">
                {isCamera ? (
                  <Camera className="h-3 w-3" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {isCamera ? "Camera photos" : "Uploaded photos"}
              </Badge>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar shrink-0 border-b border-border">
              {activeQueue.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    "relative h-14 w-11 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                    idx === activeIdx
                      ? "border-primary"
                      : "border-transparent opacity-60"
                  )}
                >
                  {item.baking ? (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
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
                </button>
              ))}
              {/* Add more — same source only */}
              {activeQueue.length < MAX_IMAGES && (
                <button
                  onClick={() =>
                    isCamera
                      ? startCamera(facingMode)
                      : fileInputRef.current?.click()
                  }
                  className="h-14 w-11 shrink-0 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  aria-label={
                    isCamera ? "Take more photos" : "Upload more photos"
                  }
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Active image detail */}
            {activeItem && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div className="relative aspect-[4/5] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-muted shadow-md">
                    {activeItem.baking ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">
                          Applying VibeTag…
                        </p>
                      </div>
                    ) : (
                      <img
                        src={activeItem.baked ?? activeItem.raw}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    {!hasOverlay && !activeItem.baking && (
                      <div className="absolute left-3 right-3 bottom-3 rounded-xl bg-black/60 backdrop-blur-sm p-2.5 pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-white font-semibold text-xs truncate">
                            {vibeTagName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Caption{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </label>
                    <Textarea
                      value={activeItem.caption}
                      onChange={(e) =>
                        updateCaption(activeItem.id, e.target.value)
                      }
                      placeholder="Write something about this moment..."
                      className="rounded-xl resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => removeFromQueue(activeItem.id)}
                      className="h-10 rounded-xl gap-1.5 text-destructive hover:text-destructive flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(activeItem)}
                      disabled={activeItem.baking}
                      className="h-10 rounded-xl gap-1.5 flex-1"
                    >
                      <Download className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShare(activeItem)}
                      disabled={activeItem.baking}
                      className="h-10 rounded-xl gap-1.5 flex-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleSubmitAll(activeQueue)}
                    disabled={isSubmitting || activeQueue.some((i) => i.baking)}
                    className="w-full h-12 rounded-xl gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Post {activeQueue.length} Photo
                        {activeQueue.length > 1 ? "s" : ""} to Event Feed
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => setMode("choose")}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start over
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Hidden file input — upload route only, multiple enabled */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
