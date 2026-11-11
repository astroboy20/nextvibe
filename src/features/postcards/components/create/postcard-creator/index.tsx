"use client";

import { apiErrorMessage } from "@/shared/lib/error-handler";
import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Camera, Plus, Loader2, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCreatePostcardsMutation,
  useSwapPostcardMutation,
} from "@/features/postcards/api/postcards-api";
import { setHideHeader } from "@/store/slices/ui-slice";
import { useDispatch } from "react-redux";
import { useBeforeUnload } from "@/shared/hooks/use-before-unload";
import { AuthBottomSheet } from "@/features/auth/components/auth-bottom-sheet";
import Cookies from "js-cookie";
import { bakeOverlay, resizeTo1080p, dataUrlToBlob, OUTPUT_WIDTH, OUTPUT_HEIGHT } from "./utils";
import { uploadBlobToCDN, fileUrlToStorageKey } from "@/shared/api/uploads-api";
import type { QueuedItem, PostcardCreatorProps } from "./types";

export type { VibeTagOverlay } from "./types";

const MAX_ITEMS = 20;
const MAX_VIDEO_DURATION_SECS = 125;
const MAX_VIDEO_UPLOAD_SIZE_MB = 151;

const PostcardChooseView = lazy(() => import("./postcard-choose-view").then((m) => ({ default: m.PostcardChooseView })));
const PostcardCameraView = lazy(() => import("./postcard-camera-view").then((m) => ({ default: m.PostcardCameraView })));
const PostcardReviewView = lazy(() => import("./postcard-review-view").then((m) => ({ default: m.PostcardReviewView })));

export function PostcardCreator({ vibeTagName = "Event VibeTag", vibeTagOverlay, vibeTagId, eventName = "Event", eventId, onClose, onSubmit, swapPostcardId, swapLikeCount = 0, swapCommentCount = 0 }: PostcardCreatorProps) {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<"choose"|"camera"|"camera-review"|"upload-review">("choose");
  const [cameraMode, setCameraMode] = useState<"photo"|"video">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraQueue, setCameraQueue] = useState<QueuedItem[]>([]);
  const [uploadQueue, setUploadQueue] = useState<QueuedItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [cameraError, setCameraError] = useState<string|null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment"|"user">("environment");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const pendingQueueRef = useRef<QueuedItem[]|null>(null);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStage, setSubmitStage] = useState<"uploading"|"saving">("uploading");
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => { dispatch(setHideHeader(true)); return () => { dispatch(setHideHeader(false)); }; }, [dispatch]);

  const [createPostcards] = useCreatePostcardsMutation();
  const [swapPostcard] = useSwapPostcardMutation();
  const isSwapMode = !!swapPostcardId;
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const pendingSwapQueueRef = useRef<QueuedItem[] | null>(null);
  const hasOverlay = !!vibeTagOverlay?.imageUrl;
  const hasUnsavedWork = mode !== "choose" || cameraQueue.length > 0 || uploadQueue.length > 0;
  useBeforeUnload(hasUnsavedWork);

  const bakeImage = useCallback(async (raw: string) => bakeOverlay(raw, hasOverlay ? vibeTagOverlay!.imageUrl : null), [hasOverlay, vibeTagOverlay]);

  const addImageToQueue = useCallback(async (raw: string, setter: React.Dispatch<React.SetStateAction<QueuedItem[]>>, currentLength: number) => {
    if (currentLength >= MAX_ITEMS) { toast.error(`Maximum ${MAX_ITEMS} items allowed.`); return; }
    const id = `${Date.now()}-${Math.random()}`;
    setter((q) => [...q, { id, kind: "image", raw, baked: null, caption: "", baking: true }]);
    const baked = await bakeImage(raw);
    setter((q) => q.map((item) => item.id === id ? { ...item, baked, baking: false } : item));
  }, [bakeImage]);

  const addVideoToQueue = useCallback(async (blob: Blob, setter: React.Dispatch<React.SetStateAction<QueuedItem[]>>, currentLength: number) => {
    if (currentLength >= MAX_ITEMS) { toast.error(`Maximum ${MAX_ITEMS} items allowed.`); return; }
    const id = `${Date.now()}-${Math.random()}`;
    const raw = URL.createObjectURL(blob);
    // Preview overlay: shown on top of the raw video in the creator review screen.
    // The video itself is never re-encoded; the overlay is composited live at playback
    // (and baked onto the thumbnail frame on submit).
    const previewOverlayUrl = hasOverlay ? (vibeTagOverlay?.imageUrl ?? null) : null;
    setter((q) => [...q, { id, kind: "video", raw, baked: raw, caption: "", baking: false, blob, overlayUrl: previewOverlayUrl }]);
  }, [hasOverlay, vibeTagOverlay]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async (facing: "environment"|"user") => {
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError("Camera not supported in this browser."); return; }
    stopCamera(); setIsCameraReady(false); setCameraError(null); setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }, video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      const markReady = () => setIsCameraReady(true);
      video.addEventListener("loadedmetadata", markReady, { once: true });
      video.addEventListener("canplay", markReady, { once: true });
      const fallback = setTimeout(markReady, 3000);
      video.addEventListener("loadedmetadata", () => clearTimeout(fallback), { once: true });
      video.addEventListener("canplay", () => clearTimeout(fallback), { once: true });
      video.play().catch(() => markReady());
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError" ? "Camera permission denied."
        : err?.name === "NotFoundError" ? "No camera found on this device."
        : err?.name === "NotReadableError" ? "Camera is in use by another app."
        : "Could not start camera.";
      setCameraError(msg); toast.error(msg); setMode("choose");
    }
  }, [stopCamera]);

  const handleFlipCamera = () => {
    const next: "environment"|"user" = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next); setIsFlipping(true);
    startCamera(next).finally(() => setIsFlipping(false));
  };

  const capturePhoto = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = OUTPUT_WIDTH; canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false }); if (!ctx) return;
    const vw = video.videoWidth || video.clientWidth;
    const vh = video.videoHeight || video.clientHeight;
    if (!vw || !vh) return;
    const scale = Math.max(OUTPUT_WIDTH / vw, OUTPUT_HEIGHT / vh);
    const sw = vw * scale; const sh = vh * scale;
    const sx = (OUTPUT_WIDTH - sw) / 2; const sy = (OUTPUT_HEIGHT - sh) / 2;
    if (facingMode === "user") { ctx.translate(OUTPUT_WIDTH, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, sx, sy, sw, sh);
    const raw = canvas.toDataURL("image/jpeg", 0.82);
    addImageToQueue(raw, setCameraQueue, cameraQueue.length);
    if (cameraQueue.length + 1 >= MAX_ITEMS) { stopCamera(); setMode("camera-review"); setActiveIdx(cameraQueue.length); }
    else toast.success(`Photo ${cameraQueue.length + 1}/${MAX_ITEMS} captured`);
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    mediaRecorderRef.current?.stop(); mediaRecorderRef.current = null;
    setIsRecording(false); setRecordingSeconds(0);
  };

  const startRecording = () => {
    const stream = streamRef.current; if (!stream) return;
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1") ? "video/mp4;codecs=avc1"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8") ? "video/webm;codecs=vp8"
      : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 128_000 });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      recordedChunksRef.current = [];
      addVideoToQueue(blob, setCameraQueue, cameraQueue.length);
      stopCamera(); setMode("camera-review"); setActiveIdx(cameraQueue.length);
    };
    recorder.start(1000); mediaRecorderRef.current = recorder;
    setIsRecording(true); setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => {
        const next = s + 1;
        if (next >= 35) { stopRecording(); toast.info("Recording stopped at 35s limit."); }
        return next;
      });
    }, 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    const remaining = MAX_ITEMS - uploadQueue.length;
    const toProcess = files.slice(0, remaining);
    if (files.length > remaining) toast.warning(`Only ${remaining} more item(s) can be added.`);
    setIsProcessingUpload(true); setLocalUploadProgress(0);
    let addedCount = 0;
    for (let i = 0; i < toProcess.length; i++) {
      const file = toProcess[i];
      if (file.type.startsWith("video/")) {
        if (file.size > MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds ${MAX_VIDEO_UPLOAD_SIZE_MB} MB limit.`);
          setLocalUploadProgress(Math.round(((i+1)/toProcess.length)*100)); continue;
        }
        const duration = await new Promise<number>((res) => {
          const tmp = document.createElement("video"); tmp.preload = "metadata";
          const url = URL.createObjectURL(file);
          tmp.onloadedmetadata = () => { URL.revokeObjectURL(url); res(tmp.duration); };
          tmp.onerror = () => { URL.revokeObjectURL(url); res(0); };
          tmp.src = url;
        });
        if (duration > MAX_VIDEO_DURATION_SECS) {
          toast.error(`"${file.name}" exceeds ${MAX_VIDEO_DURATION_SECS}s duration limit.`);
          setLocalUploadProgress(Math.round(((i+1)/toProcess.length)*100)); continue;
        }
        await addVideoToQueue(file, setUploadQueue, uploadQueue.length + addedCount); addedCount++;
      } else {
        const raw = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
        const resized = await resizeTo1080p(raw);
        await addImageToQueue(resized, setUploadQueue, uploadQueue.length + addedCount); addedCount++;
      }
      setLocalUploadProgress(Math.round(((i+1)/toProcess.length)*100));
    }
    setIsProcessingUpload(false); setLocalUploadProgress(0);
    if (addedCount > 0) { setMode("upload-review"); setActiveIdx(0); }
    e.target.value = "";
  };

  const isCamera = mode === "camera" || mode === "camera-review";
  const activeQueue = mode === "upload-review" ? uploadQueue : cameraQueue;
  const activeSetQueue = mode === "upload-review" ? setUploadQueue : setCameraQueue;

  const removeFromQueue = (id: string) => {
    activeSetQueue((q) => {
      const removed = q.find((item) => item.id === id);
      if (removed?.kind === "video") {
        if (removed.raw) URL.revokeObjectURL(removed.raw);
        if (removed.baked && removed.baked !== removed.raw) URL.revokeObjectURL(removed.baked);
      }
      const next = q.filter((item) => item.id !== id);
      if (next.length === 0) setMode("choose");
      else setActiveIdx((i) => Math.min(i, next.length - 1));
      return next;
    });
  };

  const handleSubmitAll = async (queue: QueuedItem[]) => {
    const ready = queue.filter((item) => !item.baking);
    if (!ready.length) return;
    if (!eventId) { toast.error("Event ID missing."); return; }
    if (!Cookies.get("accessToken")) { pendingQueueRef.current = queue; setShowAuthSheet(true); return; }

    // In swap mode, show a confirmation before proceeding (likes/comments will be lost)
    if (isSwapMode && !showSwapConfirm) {
      pendingSwapQueueRef.current = queue;
      setShowSwapConfirm(true);
      return;
    }

    setIsSubmitting(true); setSubmitProgress(0); setSubmitStage("uploading");

    /**
     * Presigned upload helper — requests a one-time upload URL from the server,
     * PUTs the blob directly to storage, and returns the storage key derived
     * from the returned fileUrl.
     *
     * Guide: every file (photo, video, thumbnail) goes through this same flow.
     * We never send raw bytes through the postcard creation endpoint itself.
     */
    const getPresignedUrl = async (filename: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> => {
      const accessToken = Cookies.get("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events/upload-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ filename, contentType }),
      });
      if (!res.ok) throw new Error(`Failed to get upload URL: ${res.status}`);
      const json = await res.json();
      const { uploadUrl, fileUrl } = json?.data ?? json;
      if (!uploadUrl || !fileUrl) throw new Error("Invalid upload intent response");
      return { uploadUrl, fileKey: fileUrlToStorageKey(fileUrl) };
    };

    /**
     * Capture frame 0 from a video blob and composite the vibe tag overlay
     * onto it, exactly like a photo. This becomes the thumbnail — what shows
     * in feeds, grids, and leaderboards whenever the video isn't playing.
     */
    const captureVideoThumbnail = async (blob: Blob, overlayUrl: string | null): Promise<Blob> => {
      return new Promise((resolve) => {
        const srcUrl = URL.createObjectURL(blob);
        const vid = document.createElement("video");
        vid.playsInline = true;
        vid.muted = true;
        vid.preload = "metadata";
        vid.src = srcUrl;
        vid.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;";
        document.body.appendChild(vid);

        const cleanup = () => {
          vid.pause();
          vid.removeAttribute("src");
          vid.load();
          if (vid.parentNode) vid.parentNode.removeChild(vid);
          URL.revokeObjectURL(srcUrl);
        };

        vid.onloadeddata = async () => {
          // Seek to frame 0 — currentTime = 0 is already the default
          vid.currentTime = 0;
        };

        vid.onseeked = async () => {
          const vw = vid.videoWidth || OUTPUT_WIDTH;
          const vh = vid.videoHeight || OUTPUT_HEIGHT;
          const canvas = document.createElement("canvas");
          canvas.width = vw;
          canvas.height = vh;
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) { cleanup(); resolve(dataUrlToBlob(await bakeOverlay("", null))); return; }
          ctx.drawImage(vid, 0, 0, vw, vh);
          cleanup();
          // Composite the overlay exactly like a photo
          const frameDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          const composited = await bakeOverlay(frameDataUrl, overlayUrl);
          resolve(dataUrlToBlob(composited));
        };

        vid.onerror = () => { cleanup(); resolve(new Blob([], { type: "image/jpeg" })); };
        // Trigger load
        vid.load();
      });
    };

    try {
      // Upload each item via presigned URL and collect the media payload
      const uploadedItems: {
        fileKey: string;
        mediaType: string;
        thumbnailKey?: string;
        vibeTagOverlayUrl?: string;
      }[] = [];

      const totalItems = ready.length;

      for (let i = 0; i < ready.length; i++) {
        const item = ready[i];
        const baseProgress = Math.round((i / totalItems) * 80);

        if (item.kind === "video" && item.blob) {
          // ── VIDEO ──────────────────────────────────────────────────────────
          // 1. Upload raw video (untouched — no frame baking)
          const ext = item.blob.type.includes("mp4") ? "mp4" : "webm";
          const videoContentType = item.blob.type || `video/${ext}`;
          const { uploadUrl: videoUploadUrl, fileKey } = await getPresignedUrl(
            `postcard-${item.id}.${ext}`,
            videoContentType,
          );
          await uploadBlobToCDN(item.blob, videoContentType, videoUploadUrl, (pct) => {
            setSubmitProgress(baseProgress + Math.round((pct * 0.6) / totalItems));
          });

          // 2. Capture frame 0 + composite overlay → upload as thumbnail
          const overlayUrl = hasOverlay ? (vibeTagOverlay?.imageUrl ?? null) : null;
          const thumbBlob = await captureVideoThumbnail(item.blob, overlayUrl);
          let thumbnailKey: string | undefined;
          if (thumbBlob.size > 0) {
            const { uploadUrl: thumbUploadUrl, fileKey: tKey } = await getPresignedUrl(
              `postcard-${item.id}-thumb.jpg`,
              "image/jpeg",
            );
            await uploadBlobToCDN(thumbBlob, "image/jpeg", thumbUploadUrl, (pct) => {
              setSubmitProgress(baseProgress + Math.round(60 / totalItems) + Math.round((pct * 0.2) / totalItems));
            });
            thumbnailKey = tKey;
          }

          uploadedItems.push({
            fileKey,
            mediaType: "VIDEO",
            ...(thumbnailKey ? { thumbnailKey } : {}),
            // Tell the server to resolve the vibe tag overlay at playback time
            ...(hasOverlay ? { vibeTagOverlayUrl: "true" } : {}),
          });
        } else {
          // ── PHOTO ──────────────────────────────────────────────────────────
          // Upload the fully composited image (baked already by addImageToQueue)
          const photoBlob = dataUrlToBlob(item.baked ?? item.raw);
          const { uploadUrl: photoUploadUrl, fileKey } = await getPresignedUrl(
            `postcard-${item.id}.jpg`,
            "image/jpeg",
          );
          await uploadBlobToCDN(photoBlob, "image/jpeg", photoUploadUrl, (pct) => {
            setSubmitProgress(baseProgress + Math.round((pct * 0.8) / totalItems));
          });
          // Photos: no thumbnailKey, no vibeTagOverlayUrl — always pre-composited
          uploadedItems.push({ fileKey, mediaType: "PHOTO" });
        }
      }

      if (!uploadedItems.length) { toast.error("Upload failed — no file keys returned."); return; }
      setSubmitStage("saving"); setSubmitProgress(90);

      if (isSwapMode && swapPostcardId) {
        await swapPostcard({ postcardId: swapPostcardId, eventId, vibeTagId, media: uploadedItems, caption }).unwrap();
      } else {
        await createPostcards({ eventId, vibeTagId, media: uploadedItems, caption }).unwrap();
      }

      setSubmitProgress(100);
      await new Promise((r) => setTimeout(r, 300));
      toast.success(isSwapMode ? "Postcard replaced successfully!" : `${ready.length} item${ready.length > 1 ? "s" : ""} posted!`);
      ready.forEach((item) => onSubmit?.({ image: item.baked ?? item.raw, caption: item.caption }));
      onClose?.();
    } catch (err: any) {
      const msg = apiErrorMessage(err) ?? err?.message ?? "Failed to post. Please try again.";
      if (isSwapMode && err?.status === 403) {
        toast.error("You can only replace your own postcards.");
      } else if (isSwapMode && err?.status === 404) {
        toast.error("The postcard you're replacing no longer exists.");
      } else {
        toast.error(msg);
      }
    } finally { setIsSubmitting(false); setSubmitProgress(0); setShowSwapConfirm(false); pendingSwapQueueRef.current = null; }
  };

  const handleDownload = (item: QueuedItem) => {
    const a = document.createElement("a");
    a.href = item.baked ?? item.raw;
    a.download = `${eventName.replace(/\s+/g, "-")}-postcard.${item.kind === "video" ? "webm" : "png"}`;
    a.click(); toast.success("Downloaded!");
  };

  const handleShare = async (item: QueuedItem) => {
    const src = item.baked ?? item.raw;
    try {
      let file: File;
      if (item.kind === "video" && item.blob) {
        const ext = item.blob.type.includes("mp4") ? "mp4" : "webm";
        file = new File([item.blob], `postcard.${ext}`, { type: item.blob.type });
      } else {
        const blob = dataUrlToBlob(src);
        file = new File([blob], "postcard.jpg", { type: blob.type });
      }
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `${eventName} Postcard`, text: item.caption || `Check out my postcard from ${eventName}!` }); }
      else if (navigator.share) { await navigator.share({ title: `${eventName} Postcard`, text: item.caption || `Check out my postcard from ${eventName}!` }); }
      else { await navigator.clipboard.writeText(item.caption || `Check out my postcard from ${eventName}!`); toast.success("Caption copied!"); }
    } catch (err: any) { if (err?.name !== "AbortError") toast.error("Could not share."); }
  };

  useEffect(() => () => {
    stopCamera();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const revokeQueue = (q: QueuedItem[]) => q.forEach((item) => {
      if (item.kind === "video") {
        if (item.raw) URL.revokeObjectURL(item.raw);
        if (item.baked && item.baked !== item.raw) URL.revokeObjectURL(item.baked);
      }
    });
    setCameraQueue((q) => { revokeQueue(q); return q; });
    setUploadQueue((q) => { revokeQueue(q); return q; });
  }, [stopCamera]);

  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="fixed inset-0 z-100000 flex flex-col bg-background" style={{ height: "100dvh", overflowY: mode === "camera" ? "hidden" : "auto" }}>
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      <div className={cn("flex items-center justify-between px-4 py-3 shrink-0 border-b", mode === "camera" ? "absolute top-0 left-0 right-0 z-20 bg-black/70 border-white/10 backdrop-blur-sm" : "bg-background border-border")}>
        <button onClick={() => { stopCamera(); onClose?.(); }} className={cn("p-2 rounded-full transition-colors", mode === "camera" ? "text-white hover:bg-white/10" : "hover:bg-muted")} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className={cn("font-semibold text-sm", mode === "camera" ? "text-white" : "text-foreground")}>
            {mode === "camera" ? (cameraMode === "video" ? "Record Video" : "Take Photo") : mode === "camera-review" ? "Camera Captures" : mode === "upload-review" ? "Uploaded Media" : isSwapMode ? "Replace Postcard" : "Create Postcard"}
          </h2>
          {mode === "camera" && <span className="text-white/60 text-[10px]">{isRecording ? `Recording ${formatTime(recordingSeconds)}` : `${cameraQueue.length}/${MAX_ITEMS} captured`}</span>}
          {(mode === "camera-review" || mode === "upload-review") && activeQueue.length > 0 && <span className="text-muted-foreground text-[10px]">{activeQueue.length}/{MAX_ITEMS} item{activeQueue.length > 1 ? "s" : ""}</span>}
        </div>
        {mode === "camera-review" && cameraQueue.length < MAX_ITEMS ? (
          <button onClick={() => startCamera(facingMode)} className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Take more"><Camera className="h-5 w-5" /></button>
        ) : mode === "upload-review" && uploadQueue.length < MAX_ITEMS ? (
          <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Upload more"><Plus className="h-5 w-5" /></button>
        ) : <div className="w-9" />}
      </div>

      {hasOverlay && mode !== "camera" && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="border-primary/30 text-primary gap-1 text-xs shrink-0 max-w-[55%] truncate">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">{vibeTagOverlay!.name}</span>
            </Badge>
            <span className="text-xs text-muted-foreground truncate">VibeTag stamped on photos and videos</span>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
        {mode === "camera" && (
          <PostcardCameraView
            videoRef={videoRef}
            vibeTagOverlay={vibeTagOverlay}
            facingMode={facingMode}
            cameraMode={cameraMode}
            isCameraReady={isCameraReady}
            isFlipping={isFlipping}
            isRecording={isRecording}
            recordingSeconds={recordingSeconds}
            cameraQueue={cameraQueue}
            maxItems={MAX_ITEMS}
            onSetCameraMode={setCameraMode}
            onCapturePhoto={capturePhoto}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onFlipCamera={handleFlipCamera}
            onGoToReview={() => { stopCamera(); setMode("camera-review"); setActiveIdx(0); }}
          />
        )}
        {mode === "choose" && (
          <PostcardChooseView
            vibeTagName={vibeTagName}
            vibeTagOverlay={vibeTagOverlay}
            eventName={eventName}
            cameraError={cameraError}
            isProcessingUpload={isProcessingUpload}
            localUploadProgress={localUploadProgress}
            maxItems={MAX_ITEMS}
            maxVideoUploadSizeMb={MAX_VIDEO_UPLOAD_SIZE_MB}
            maxVideoDurationSecs={MAX_VIDEO_DURATION_SECS}
            facingMode={facingMode}
            onStartCamera={startCamera}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        )}
        {(mode === "camera-review" || mode === "upload-review") && (
          <PostcardReviewView
            isCamera={isCamera}
            activeQueue={activeQueue}
            activeIdx={activeIdx}
            vibeTagName={vibeTagName}
            vibeTagOverlay={vibeTagOverlay}
            caption={caption}
            maxItems={MAX_ITEMS}
            isSubmitting={isSubmitting}
            submitProgress={submitProgress}
            submitStage={submitStage}
            facingMode={facingMode}
            onSetActiveIdx={setActiveIdx}
            onRemoveFromQueue={removeFromQueue}
            onUpdateCaption={setCaption}
            onDownload={handleDownload}
            onShare={handleShare}
            onSubmitAll={() => handleSubmitAll(activeQueue)}
            onStartOver={() => { setCameraQueue([]); setUploadQueue([]); setActiveIdx(0); setMode("choose"); }}
            onAddMore={() => isCamera ? startCamera(facingMode) : fileInputRef.current?.click()}
          />
        )}
      </Suspense>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileUpload} />

      <AuthBottomSheet
        open={showAuthSheet}
        onClose={() => setShowAuthSheet(false)}
        prompt="Sign in to post your postcard to the event feed."
        onSuccess={() => {
          setShowAuthSheet(false);
          if (pendingQueueRef.current) { handleSubmitAll(pendingQueueRef.current); pendingQueueRef.current = null; }
        }}
      />

      {/* Swap confirmation dialog */}
      {showSwapConfirm && (
        <div className="fixed inset-0 z-[200001] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-base">Replace this postcard?</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete the existing postcard and all its activity:
              </p>
            </div>
            <div className="flex gap-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
              <div className="flex flex-col items-center gap-0.5">
                <Heart className="h-4 w-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive">{swapLikeCount}</span>
                <span className="text-[10px] text-muted-foreground">likes</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <MessageCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive">{swapCommentCount}</span>
                <span className="text-[10px] text-muted-foreground">comments</span>
              </div>
              <p className="text-xs text-destructive/80 self-center ml-1">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSwapConfirm(false); pendingSwapQueueRef.current = null; }}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const q = pendingSwapQueueRef.current;
                  if (q) handleSubmitAll(q);
                }}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
