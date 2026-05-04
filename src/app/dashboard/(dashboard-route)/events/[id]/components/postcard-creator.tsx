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
  Video,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useUploadMultipleFilesMutation,
  useCreatePostcardsMutation,
} from "@/app/provider/api/eventApi";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import { useDispatch } from "react-redux";

const MAX_ITEMS = 20;

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

type MediaKind = "image" | "video";

interface QueuedItem {
  id: string;
  kind: MediaKind;
  /** data-url for images; object-url for videos */
  raw: string;
  /** baked image data-url (images only); same as raw for videos */
  baked: string | null;
  caption: string;
  baking: boolean;
  /** original Blob kept for video upload */
  blob?: Blob;
}

const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1080;

/** Resize a source image to 1920×1080 (cover-fit) and optionally stamp the overlay. */
async function bakeOverlay(
  baseDataUrl: string,
  overlayUrl: string | null
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(baseDataUrl);
      return;
    }

    const base = new Image();
    base.crossOrigin = "anonymous";
    base.onload = () => {
      // Cover-fit: scale so the image fills 1920×1080, centred
      const scale = Math.max(
        OUTPUT_WIDTH / base.naturalWidth,
        OUTPUT_HEIGHT / base.naturalHeight
      );
      const sw = base.naturalWidth * scale;
      const sh = base.naturalHeight * scale;
      const sx = (OUTPUT_WIDTH - sw) / 2;
      const sy = (OUTPUT_HEIGHT - sh) / 2;
      ctx.drawImage(base, sx, sy, sw, sh);

      if (!overlayUrl) {
        resolve(canvas.toDataURL("image/jpeg", 1.0));
        return;
      }

      const overlay = new Image();
      overlay.crossOrigin = "anonymous";
      overlay.onload = () => {
        ctx.drawImage(overlay, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      };
      overlay.onerror = () => resolve(canvas.toDataURL("image/jpeg", 1.0));
      overlay.src = overlayUrl;
    };
    base.onerror = () => resolve(baseDataUrl);
    base.src = baseDataUrl;
  });
}

/** Resize an image data-url to 1920×1080 without any overlay. */
async function resizeTo1080p(dataUrl: string): Promise<string> {
  return bakeOverlay(dataUrl, null);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export function PostcardCreator({
  vibeTagName = "Event VibeTag",
  vibeTagOverlay,
  vibeTagId,
  eventName = "Event",
  eventId,
  onClose,
  onSubmit,
}: PostcardCreatorProps) {
  const dispatch = useDispatch();

  const [mode, setMode] = useState<
    "choose" | "camera" | "camera-review" | "upload-review"
  >("choose");

  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [cameraQueue, setCameraQueue] = useState<QueuedItem[]>([]);
  const [uploadQueue, setUploadQueue] = useState<QueuedItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(setHideHeader(mode === "camera"));
    return () => {
      dispatch(setHideHeader(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const [uploadMultipleFiles] = useUploadMultipleFilesMutation();
  const [createPostcards] = useCreatePostcardsMutation();
  const hasOverlay = !!vibeTagOverlay?.imageUrl;

  const bakeImage = useCallback(
    async (raw: string): Promise<string> => {
      return bakeOverlay(raw, hasOverlay ? vibeTagOverlay!.imageUrl : null);
    },
    [hasOverlay, vibeTagOverlay]
  );

  const addImageToQueue = useCallback(
    async (
      raw: string,
      setter: React.Dispatch<React.SetStateAction<QueuedItem[]>>,
      currentLength: number
    ) => {
      if (currentLength >= MAX_ITEMS) {
        toast.error(`Maximum ${MAX_ITEMS} items allowed.`);
        return;
      }
      const id = `${Date.now()}-${Math.random()}`;
      setter((q) => [
        ...q,
        { id, kind: "image", raw, baked: null, caption: "", baking: true },
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

  const addVideoToQueue = useCallback(
    (
      blob: Blob,
      setter: React.Dispatch<React.SetStateAction<QueuedItem[]>>,
      currentLength: number
    ) => {
      if (currentLength >= MAX_ITEMS) {
        toast.error(`Maximum ${MAX_ITEMS} items allowed.`);
        return;
      }
      const id = `${Date.now()}-${Math.random()}`;
      const raw = URL.createObjectURL(blob);
      setter((q) => [
        ...q,
        {
          id,
          kind: "video",
          raw,
          baked: raw,
          caption: "",
          baking: false,
          blob,
        },
      ]);
    },
    []
  );

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
          audio: true,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        const markReady = () => setIsCameraReady(true);
        video.addEventListener("loadedmetadata", markReady, { once: true });
        video.addEventListener("canplay", markReady, { once: true });
        const fallback = setTimeout(markReady, 3000);
        video.addEventListener("loadedmetadata", () => clearTimeout(fallback), {
          once: true,
        });
        video.addEventListener("canplay", () => clearTimeout(fallback), {
          once: true,
        });
        video.play().catch(() => markReady());

        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          // multiple cameras detected — flip button is always shown anyway
          void devices;
        } catch {
          // ignore
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

    // Always output at 1920×1080
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vw = video.videoWidth || video.clientWidth;
    const vh = video.videoHeight || video.clientHeight;
    if (!vw || !vh) return;

    // Cover-fit the video frame into 1920×1080
    const scale = Math.max(OUTPUT_WIDTH / vw, OUTPUT_HEIGHT / vh);
    const sw = vw * scale;
    const sh = vh * scale;
    const sx = (OUTPUT_WIDTH - sw) / 2;
    const sy = (OUTPUT_HEIGHT - sh) / 2;

    if (facingMode === "user") {
      ctx.translate(OUTPUT_WIDTH, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, sw, sh);
    const raw = canvas.toDataURL("image/jpeg", 1.0);
    addImageToQueue(raw, setCameraQueue, cameraQueue.length);
    if (cameraQueue.length + 1 >= MAX_ITEMS) {
      stopCamera();
      setMode("camera-review");
      setActiveIdx(cameraQueue.length);
    } else {
      toast.success(`Photo ${cameraQueue.length + 1}/${MAX_ITEMS} captured`);
    }
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;
    recordedChunksRef.current = [];

    // Pick best supported codec + request highest bitrate
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
      ? "video/mp4;codecs=avc1"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8_000_000, // 8 Mbps — 1080p high quality
      audioBitsPerSecond: 192_000,   // 192 kbps audio
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      addVideoToQueue(blob, setCameraQueue, cameraQueue.length);
      stopCamera();
      setMode("camera-review");
      setActiveIdx(cameraQueue.length);
    };
    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(
      () => setRecordingSeconds((s) => s + 1),
      1000
    );
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_ITEMS - uploadQueue.length;
    const toProcess = files.slice(0, remaining);
    if (files.length > remaining)
      toast.warning(
        `Only ${remaining} more item(s) can be added (max ${MAX_ITEMS}).`
      );

    for (const file of toProcess) {
      if (file.type.startsWith("video/")) {
        addVideoToQueue(file, setUploadQueue, uploadQueue.length);
      } else {
        const raw = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
        // Resize to 1920×1080 before baking overlay
        const resized = await resizeTo1080p(raw);
        await addImageToQueue(resized, setUploadQueue, uploadQueue.length);
      }
    }
    setMode("upload-review");
    setActiveIdx(0);
    e.target.value = "";
  };

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

  const handleSubmitAll = async (queue: QueuedItem[]) => {
    const ready = queue.filter((item) => !item.baking);
    if (!ready.length) return;
    if (!eventId) {
      toast.error("Event ID missing.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const item of ready) {
        if (item.kind === "video" && item.blob) {
          const ext = item.blob.type.includes("mp4") ? "mp4" : "webm";
          formData.append("files", item.blob, `postcard-${item.id}.${ext}`);
        } else {
          const src = item.baked ?? item.raw;
          const blob = dataUrlToBlob(src);
          formData.append("files", blob, `postcard-${item.id}.jpg`);
        }
      }
      const uploadResult = await uploadMultipleFiles(formData).unwrap();
      const uploadedItems: { fileKey: string; mediaType: string }[] = (
        uploadResult?.data ?? []
      ).map((item: { fileKey: string; mediaType: string }) => ({
        fileKey: item.fileKey,
        mediaType: item.mediaType,
      }));
      if (!uploadedItems.length) {
        toast.error("Upload failed — no file keys returned.");
        return;
      }
      await createPostcards({
        eventId,
        vibeTagId,
        media: uploadedItems,
      }).unwrap();
      toast.success(
        `${ready.length} item${ready.length > 1 ? "s" : ""} posted!`
      );
      ready.forEach((item) =>
        onSubmit?.({ image: item.baked ?? item.raw, caption: item.caption })
      );
      onClose?.();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (item: QueuedItem) => {
    const a = document.createElement("a");
    a.href = item.baked ?? item.raw;
    a.download = `${eventName.replace(/\s+/g, "-")}-postcard.${
      item.kind === "video" ? "webm" : "png"
    }`;
    a.click();
    toast.success("Downloaded!");
  };

  const handleShare = async (item: QueuedItem) => {
    const src = item.baked ?? item.raw;
    try {
      let file: File;
      if (item.kind === "video" && item.blob) {
        const ext = item.blob.type.includes("mp4") ? "mp4" : "webm";
        file = new File([item.blob], `postcard.${ext}`, {
          type: item.blob.type,
        });
      } else {
        const blob = dataUrlToBlob(src);
        file = new File([blob], "postcard.png", { type: blob.type });
      }
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

  useEffect(
    () => () => {
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    },
    [stopCamera]
  );

  const activeItem = activeQueue[activeIdx] ?? null;
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <div
      className="fixed inset-0 z-100000 flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >
      <canvas ref={canvasRef} className="hidden" />

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
              ? cameraMode === "video"
                ? "Record Video"
                : "Take Photo"
              : mode === "camera-review"
              ? "Camera Captures"
              : mode === "upload-review"
              ? "Uploaded Media"
              : "Create Postcard"}
          </h2>
          {mode === "camera" && (
            <span className="text-white/60 text-[10px]">
              {isRecording
                ? `● REC ${formatTime(recordingSeconds)}`
                : `${cameraQueue.length}/${MAX_ITEMS} captured`}
            </span>
          )}
          {(mode === "camera-review" || mode === "upload-review") &&
            activeQueue.length > 0 && (
              <span className="text-muted-foreground text-[10px]">
                {activeQueue.length}/{MAX_ITEMS} item
                {activeQueue.length > 1 ? "s" : ""}
              </span>
            )}
        </div>

        {mode === "camera-review" && cameraQueue.length < MAX_ITEMS ? (
          <button
            onClick={() => startCamera(facingMode)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Take more"
          >
            <Camera className="h-5 w-5" />
          </button>
        ) : mode === "upload-review" && uploadQueue.length < MAX_ITEMS ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Upload more"
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

      {mode === "camera" && (
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              facingMode === "user" && "transform-[scaleX(-1)]"
            )}
          />

          {!isCameraReady && !isFlipping && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black">
              <Loader2 className="h-9 w-9 animate-spin text-white" />
              <p className="text-white/70 text-sm">Starting camera…</p>
            </div>
          )}

          {hasOverlay && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <img
                src={vibeTagOverlay!.imageUrl}
                alt={vibeTagOverlay!.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {isRecording && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/80 border border-red-500/60 rounded-2xl px-5 py-2.5 shadow-lg shadow-red-500/20">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-md shadow-red-500" />
              <span className="text-white text-xl font-mono font-bold tracking-widest">
                {formatTime(recordingSeconds)}
              </span>
              <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">
                REC
              </span>
            </div>
          )}

          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/50 rounded-full p-1">
            <button
              onClick={() => {
                if (isRecording) stopRecording();
                setCameraMode("photo");
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-colors",
                cameraMode === "photo" ? "bg-white text-black" : "text-white/70"
              )}
            >
              Photo
            </button>
            <button
              onClick={() => {
                setCameraMode("video");
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-colors",
                cameraMode === "video" ? "bg-white text-black" : "text-white/70"
              )}
            >
              Video
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-8 pb-10 pt-6 bg-linear-to-trom-black/70 to-transparent">
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
                {cameraQueue[cameraQueue.length - 1] &&
                  (cameraQueue[cameraQueue.length - 1].kind === "video" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <img
                      src={
                        cameraQueue[cameraQueue.length - 1].baked ??
                        cameraQueue[cameraQueue.length - 1].raw
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ))}
                {cameraQueue.length > 0 && (
                  <span className="absolute bottom-0 right-0 bg-primary text-white text-[9px] font-bold px-1 rounded-tl">
                    {cameraQueue.length}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Review</span>
            </button>

            {/* Shutter / Record button */}
            {cameraMode === "photo" ? (
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady || cameraQueue.length >= MAX_ITEMS}
                className={cn(
                  "relative flex h-19 w-19 items-center justify-center rounded-full transition-transform active:scale-90",
                  (!isCameraReady || cameraQueue.length >= MAX_ITEMS) &&
                    "opacity-30 pointer-events-none"
                )}
                aria-label="Capture photo"
              >
                <span className="absolute inset-0 rounded-full border-[3px] border-white" />
                <span className="h-15 w-15 rounded-full bg-white" />
              </button>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isCameraReady}
                className={cn(
                  "relative flex h-19 w-19 items-center justify-center rounded-full transition-transform active:scale-90",
                  !isCameraReady && "opacity-30 pointer-events-none"
                )}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                <span className="absolute inset-0 rounded-full border-[3px] border-white" />
                {isRecording ? (
                  <span className="h-7 w-7 rounded-md bg-red-500" />
                ) : (
                  <span className="h-15 w-15 rounded-full bg-red-500" />
                )}
              </button>
            )}

            {/* Flip camera */}
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
          <div className="space-y-6">
            {/* Full-width 16:9 preview */}
            <div className="relative w-full overflow-hidden bg-linear-to-br from-primary via-accent to-primary p-0.75">
              <div className="relative w-full bg-muted flex items-center justify-center overflow-hidden" style={{ aspectRatio: "16/9" }}>
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
              <p className="text-center text-xs text-destructive px-6">
                {cameraError}
              </p>
            )}

            <div className="grid gap-3 px-6 pb-6">
              <Button
                onClick={() => startCamera(facingMode)}
                className="h-14 rounded-2xl gap-3"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                Take Photo / Record Video
                <span className="ml-auto text-xs opacity-60">
                  max {MAX_ITEMS}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-14 rounded-2xl gap-3"
                size="lg"
              >
                <Upload className="h-5 w-5" />
                Upload Photo or Video
                <span className="ml-auto text-xs opacity-60">
                  max {MAX_ITEMS}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REVIEW MODE ══════════════════════════════════════════════════════ */}
      {(mode === "camera-review" || mode === "upload-review") &&
        activeQueue.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden">
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
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                    idx === activeIdx
                      ? "border-primary"
                      : "border-transparent opacity-60"
                  )}
                  style={{ width: "142px", height: "80px" }}
                >
                  {item.baking ? (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    </div>
                  ) : item.kind === "video" ? (
                    <div className="absolute inset-0 bg-black flex items-center justify-center">
                      <Video className="h-4 w-4 text-white" />
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
              {activeQueue.length < MAX_ITEMS && (
                <button
                  onClick={() =>
                    isCamera
                      ? startCamera(facingMode)
                      : fileInputRef.current?.click()
                  }
                  className="shrink-0 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  style={{ width: "142px", height: "80px" }}
                  aria-label={isCamera ? "Take more" : "Upload more"}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Active item detail */}
            {activeItem && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Full-width 16:9 preview */}
                  <div className="relative w-full overflow-hidden bg-muted shadow-md" style={{ aspectRatio: "16/9" }}>
                    {activeItem.baking ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">
                          Applying VibeTag…
                        </p>
                      </div>
                    ) : activeItem.kind === "video" ? (
                      <video
                        src={activeItem.raw}
                        controls
                        className="h-full w-full object-cover"
                        playsInline
                      />
                    ) : (
                      <img
                        src={activeItem.baked ?? activeItem.raw}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
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
                  </div>

                  <div className="px-4 pb-6 space-y-4">
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
                        Post {activeQueue.length} Item
                        {activeQueue.length > 1 ? "s" : ""} to Event Feed
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => {
                      setCameraQueue([]);
                      setUploadQueue([]);
                      setActiveIdx(0);
                      setMode("choose");
                    }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start over
                  </button>
                  </div>{/* end px-4 pb-6 padded section */}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Hidden file input — images + videos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
