"use client";

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Image as FabricImage } from "fabric";
import { useDispatch, useSelector } from "react-redux";
import { setIsUploadImgOpen } from "@/app/provider/slices/canvas-slice";
import { RootState } from "@/app/provider/store";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Wand, Loader2, CheckCircle, AlertCircle, Crop } from "lucide-react";

interface UploadImgProps {
  canvas: any | null;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const items = [
  {
    label: "Upload Image",
    description: "Select from device",
    icon: ImageIcon,
    mode: "regular",
  },
  {
    label: "Upload as PNG",
    description: "Remove bg with AI",
    icon: Wand,
    mode: "removeBg",
  },
];

/** Crops a loaded image URL to the given pixel area and returns a blob URL */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob!));
    }, "image/png");
  });
}

export default function UploadImg({ canvas }: UploadImgProps) {
  const isUploadImgOpen = useSelector(
    (state: RootState) => state.canvas.isUploadImgOpen
  );
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentModeRef = useRef<"regular" | "removeBg">("regular");
  // Guard: prevents addToCanvas from being called twice for the same upload
  const isAddingToCanvasRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // ── Crop state ────────────────────────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);
  // Keep track of which mode triggered the crop so we know what to do after
  const cropModeRef = useRef<"regular" | "removeBg">("regular");

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const addToCanvas = (url: string) => {
    if (!canvas) return;
    // Guard against double-add (async fromURL can race if called twice)
    if (isAddingToCanvasRef.current) return;
    isAddingToCanvasRef.current = true;
    FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
      img.scaleToWidth(200);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.centerObject(img);
      canvas.requestRenderAll();
      isAddingToCanvasRef.current = false;
    });
  };

  const openFilePicker = (mode: "regular" | "removeBg") => {
    currentModeRef.current = mode;
    isAddingToCanvasRef.current = false;
    setUploadStatus({ type: null, message: "" });
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: "error", message: "File size must be less than 5MB" });
      toast.error("File too large", { description: "Please select an image smaller than 5MB" });
      e.target.value = "";
      return;
    }

    // If it's a PNG, show the crop dialog first
    if (file.type === "image/png") {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        cropModeRef.current = currentModeRef.current;
        setCropSrc(data);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsCropMode(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
      return;
    }

    // Non-PNG: go straight through (regular upload only — no bg removal for non-PNG)
    await processRegularUpload(file);
    e.target.value = "";
  };

  const processRegularUpload = async (file: File) => {
    setIsLoading(true);
    setUploadStatus({ type: null, message: "" });
    try {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        addToCanvas(data);
        setUploadStatus({ type: "success", message: "Image uploaded successfully!" });
        toast.success("Image uploaded", { description: "Image added to canvas" });
        setTimeout(() => {
          dispatch(setIsUploadImgOpen(false));
          setUploadStatus({ type: null, message: "" });
        }, 1500);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Upload failed";
      setUploadStatus({ type: "error", message: msg });
      toast.error("Upload failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  /** Called when user confirms the crop */
  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setIsCropMode(false);
    setIsLoading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const croppedUrl = await getCroppedImg(cropSrc, croppedAreaPixels);

      if (cropModeRef.current === "removeBg") {
        // Convert blob URL → Blob → File, then send to remove.bg
        setUploadStatus({ type: null, message: "Removing background..." });
        const blob = await fetch(croppedUrl).then((r) => r.blob());
        const form = new FormData();
        form.append("image_file", blob, "cropped.png");
        form.append("size", "auto");

        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY! },
          body: form,
        });

        if (!res.ok) {
          let errorMessage = "Failed to remove background";
          try {
            const err = await res.json();
            if (err.errors?.length) errorMessage = err.errors[0]?.title ?? errorMessage;
            else if (err.message) errorMessage = err.message;
          } catch { /* ignore parse error */ }
          setUploadStatus({ type: "error", message: errorMessage });
          toast.error("Background removal failed", { description: errorMessage });
          setIsLoading(false);
          return;
        }

        const resultBlob = await res.blob();
        const resultUrl = URL.createObjectURL(resultBlob);
        addToCanvas(resultUrl);
        setUploadStatus({ type: "success", message: "Background removed successfully!" });
        toast.success("Background removed", { description: "Image added to canvas" });
      } else {
        addToCanvas(croppedUrl);
        setUploadStatus({ type: "success", message: "Image uploaded successfully!" });
        toast.success("Image uploaded", { description: "Image added to canvas" });
      }

      setTimeout(() => {
        dispatch(setIsUploadImgOpen(false));
        setUploadStatus({ type: null, message: "" });
        setCropSrc(null);
      }, 1500);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to process image";
      setUploadStatus({ type: "error", message: msg });
      toast.error("Failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropSkip = async () => {
    if (!cropSrc) return;
    setIsCropMode(false);

    if (cropModeRef.current === "removeBg") {
      // Send the original (uncropped) PNG to remove.bg
      setIsLoading(true);
      setUploadStatus({ type: null, message: "Removing background..." });
      try {
        const blob = await fetch(cropSrc).then((r) => r.blob());
        const form = new FormData();
        form.append("image_file", blob, "image.png");
        form.append("size", "auto");

        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY! },
          body: form,
        });

        if (!res.ok) {
          let errorMessage = "Failed to remove background";
          try {
            const err = await res.json();
            if (err.errors?.length) errorMessage = err.errors[0]?.title ?? errorMessage;
          } catch { /* ignore */ }
          setUploadStatus({ type: "error", message: errorMessage });
          toast.error("Background removal failed", { description: errorMessage });
          setIsLoading(false);
          return;
        }

        const resultBlob = await res.blob();
        addToCanvas(URL.createObjectURL(resultBlob));
        setUploadStatus({ type: "success", message: "Background removed successfully!" });
        toast.success("Background removed", { description: "Image added to canvas" });
        setTimeout(() => {
          dispatch(setIsUploadImgOpen(false));
          setUploadStatus({ type: null, message: "" });
          setCropSrc(null);
        }, 1500);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Upload failed";
        setUploadStatus({ type: "error", message: msg });
        toast.error("Upload failed", { description: msg });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Just add the original image straight to canvas
      addToCanvas(cropSrc);
      toast.success("Image uploaded", { description: "Image added to canvas" });
      setTimeout(() => {
        dispatch(setIsUploadImgOpen(false));
        setCropSrc(null);
      }, 800);
    }
  };

  return (
    <>
      {/* ── Crop Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={isCropMode} onOpenChange={(open) => {
        if (!open) {
          // User dismissed the crop dialog (backdrop tap / escape) — cancel entirely
          setIsCropMode(false);
          setCropSrc(null);
        }
      }}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Crop className="w-4 h-4" />
              Crop Image
            </DialogTitle>
          </DialogHeader>

          {/* Cropper area */}
          <div className="relative w-full bg-black" style={{ height: 340 }}>
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{ containerStyle: { borderRadius: 0 } }}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex gap-2 px-4 pb-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCropSkip}
            >
              Skip Crop
            </Button>
            <Button
              className="flex-1"
              onClick={handleCropConfirm}
            >
              Apply Crop
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Main Upload Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={isUploadImgOpen}
        onOpenChange={(open) => !open && dispatch(setIsUploadImgOpen(false))}
      >
        <DialogContent className="max-w-md w-full p-6 mb-10!">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Upload Image</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={onFileChange}
            disabled={isLoading}
          />

          {/* Status Messages */}
          {uploadStatus.type && (
            <div
              className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${
                uploadStatus.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  uploadStatus.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {uploadStatus.message}
              </span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-800">
                {currentModeRef.current === "removeBg"
                  ? "Removing background..."
                  : "Uploading image..."}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-4">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <Button
                  key={i}
                  variant="outline"
                  className="flex flex-col gap-2 items-center justify-center p-6 space-y-2 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => openFilePicker(item.mode as any)}
                  disabled={isLoading}
                >
                  {isLoading && item.mode === currentModeRef.current ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Icon className="w-8 h-8" />
                  )}
                  <span className="font-semibold text-sm my-3">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </Button>
              );
            })}
          </div>

          {/* PNG crop hint */}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            PNG files will open a crop tool before uploading
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
