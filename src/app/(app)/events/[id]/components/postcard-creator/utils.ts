// Max recording duration in seconds
export const MAX_RECORDING_SECS = 35;

// Image output dimensions
export const OUTPUT_WIDTH = 720;
export const OUTPUT_HEIGHT = 1280;

/**
 * Serial baking queue  only one video encodes at a time.
 */
export function createBakeQueue() {
  let promise: Promise<void> = Promise.resolve();
  return function enqueueBake<T>(fn: () => Promise<T>): Promise<T> {
    const result = promise.then(() => fn());
    promise = result.then(() => {}, () => {});
    return result;
  };
}

export async function bakeOverlay(
  baseDataUrl: string,
  overlayUrl: string | null
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    // alpha:false skips alpha compositing  measurably faster for opaque images
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) { resolve(baseDataUrl); return; }

    const base = new Image();
    base.crossOrigin = "anonymous";
    base.onload = () => {
      const scale = Math.max(OUTPUT_WIDTH / base.naturalWidth, OUTPUT_HEIGHT / base.naturalHeight);
      const sw = base.naturalWidth * scale;
      const sh = base.naturalHeight * scale;
      const sx = (OUTPUT_WIDTH - sw) / 2;
      const sy = (OUTPUT_HEIGHT - sh) / 2;
      ctx.drawImage(base, sx, sy, sw, sh);

      if (!overlayUrl) { resolve(canvas.toDataURL("image/jpeg", 0.82)); return; }

      const overlay = new Image();
      overlay.crossOrigin = "anonymous";
      overlay.onload = () => {
        ctx.drawImage(overlay, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      overlay.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.82));
      overlay.src = overlayUrl;
    };
    base.onerror = () => resolve(baseDataUrl);
    base.src = baseDataUrl;
  });
}

export async function resizeTo1080p(dataUrl: string): Promise<string> {
  return bakeOverlay(dataUrl, null);
}

/**
 * Bakes the vibetag overlay into every video frame.
 *
 * Optimizations vs original:
 * - canvas context uses { alpha: false, desynchronized: true }  skips alpha
 *   compositing and allows the GPU to decode frames off the main thread.
 * - Draw loop uses setTimeout at ~24 fps instead of requestAnimationFrame
 *   at 60 fps. This halves main-thread pressure and stops the browser from
 *   treating every frame render as a layout-blocking task.
 * - Audio: vid is never permanently muted here. We mute only to allow
 *   autoplay, then unmute right before play() so captureStream() sees live
 *   audio tracks. This fixes the no-sound bug.
 */
export async function bakeOverlayOntoVideo(
  videoBlob: Blob,
  overlayUrl: string
): Promise<Blob> {
  let overlayBlobUrl: string;
  try {
    const res = await fetch(overlayUrl);
    if (!res.ok) throw new Error("fetch failed");
    overlayBlobUrl = URL.createObjectURL(await res.blob());
  } catch {
    return videoBlob;
  }

  const overlayImg = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = overlayBlobUrl;
  }).catch(() => null);

  if (!overlayImg) { URL.revokeObjectURL(overlayBlobUrl); return videoBlob; }

  return new Promise((resolve) => {
    const srcUrl = URL.createObjectURL(videoBlob);
    let drawTimer: ReturnType<typeof setTimeout> | null = null;
    let abortTimer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;

    const done = (result: Blob) => {
      if (settled) return;
      settled = true;
      if (abortTimer !== null) clearTimeout(abortTimer);
      if (drawTimer !== null) clearTimeout(drawTimer);
      URL.revokeObjectURL(overlayBlobUrl);
      vid.pause();
      vid.removeAttribute("src");
      vid.load();
      if (vid.parentNode) vid.parentNode.removeChild(vid);
      URL.revokeObjectURL(srcUrl);
      resolve(result);
    };

    const vid = document.createElement("video");
    vid.playsInline = true;
    // Start muted so the browser allows autoplay, unmute before play()
    vid.muted = true;
    vid.preload = "auto";
    vid.src = srcUrl;
    vid.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;";
    document.body.appendChild(vid);

    vid.onerror = () => done(videoBlob);

    vid.onloadedmetadata = () => {
      const vw = vid.videoWidth || 720;
      const vh = vid.videoHeight || 1280;

      const estimatedDuration =
        isFinite(vid.duration) && vid.duration > 0
          ? vid.duration
          : Math.min(videoBlob.size / (330 * 1024), MAX_RECORDING_SECS);

      const canvas = document.createElement("canvas");
      canvas.width = vw;
      canvas.height = vh;
      // desynchronized:true lets the browser push canvas reads to the GPU
      // thread, reducing main-thread stalls during frame drawing.
      // alpha:false skips per-pixel alpha compositing  safe since video frames
      // and the vibetag overlay are both fully opaque.
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

      if (!ctx || typeof (canvas as any).captureStream !== "function") {
        done(videoBlob); return;
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : null;

      if (!mimeType) { done(videoBlob); return; }

      const canvasStream = (canvas as any).captureStream(24) as MediaStream;
      const outStream = new MediaStream([...canvasStream.getVideoTracks()]);

      // Capture audio BEFORE starting recorder so tracks are live from frame 1.
      // captureStream() on the video element gives us the decoded audio track.
      try {
        const liveSrc: MediaStream | null =
          typeof (vid as any).captureStream === "function"
            ? (vid as any).captureStream()
            : typeof (vid as any).mozCaptureStream === "function"
            ? (vid as any).mozCaptureStream()
            : null;
        if (liveSrc) {
          liveSrc.getAudioTracks().forEach((t) => outStream.addTrack(t));
        }
      } catch { /* no audio  video-only is fine */ }

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(outStream, {
          mimeType,
          videoBitsPerSecond: 2_000_000,  // 2 Mbps — slightly lower = less encode pressure
          audioBitsPerSecond: 128_000,
        });
      } catch { done(videoBlob); return; }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const result = new Blob(chunks, { type: mimeType });
        chunks.length = 0;
        done(result.size > 0 ? result : videoBlob);
      };

      // Draw at ~24 fps using setTimeout instead of requestAnimationFrame.
      // rAF runs at the display refresh rate (60-120 fps) and is treated as a
      // layout task  it blocks React re-renders and causes UI jank.
      // 24 fps is enough for smooth video and cuts main-thread draw calls by 60%.
      const FRAME_MS = Math.ceil(1000 / 24); // ~41ms per frame
      const drawFrame = () => {
        if (settled || vid.paused || vid.ended) return;
        ctx.drawImage(vid, 0, 0, vw, vh);
        ctx.drawImage(overlayImg, 0, 0, vw, vh);
        drawTimer = setTimeout(drawFrame, FRAME_MS);
      };

      vid.onended = () => {
        if (drawTimer !== null) clearTimeout(drawTimer);
        if (recorder.state !== "inactive") recorder.stop();
      };

      abortTimer = setTimeout(
        () => {
          if (drawTimer !== null) clearTimeout(drawTimer);
          if (recorder.state !== "inactive") recorder.stop();
        },
        Math.ceil((estimatedDuration + 15) * 1000)
      );

      recorder.start(250);

      // Unmute AFTER recorder.start() so audio tracks are live for capture,
      // then play(). This is the fix for the no-sound bug.
      vid.muted = false;
      vid.play()
        .then(() => { drawFrame(); })
        .catch(() => {
          // Autoplay blocked even when muted  fall back to muted video-only
          vid.muted = true;
          vid.play().catch(() => { if (recorder.state !== "inactive") recorder.stop(); });
          drawFrame();
        });
    };
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
