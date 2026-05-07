"use client";

import { useRef, useState } from "react";
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
import { ImageIcon, Wand, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface UploadImgProps {
  canvas: any | null;
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

export default function UploadImg({ canvas }: UploadImgProps) {
  const isUploadImgOpen = useSelector(
    (state: RootState) => state.canvas.isUploadImgOpen
  );
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentModeRef = useRef<"regular" | "removeBg">("regular");

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const openFilePicker = (mode: "regular" | "removeBg") => {
    currentModeRef.current = mode;
    setUploadStatus({ type: null, message: "" });
    fileInputRef.current?.click();
  };

  const addToCanvas = (url: string) => {
    if (!canvas) return;
    FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
      img.scaleToWidth(200);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.centerObject(img);
      canvas.requestRenderAll();
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        type: "error",
        message: "File size must be less than 5MB",
      });
      toast.error("File too large", {
        description: "Please select an image smaller than 5MB",
      });
      e.target.value = "";
      return;
    }

    setIsLoading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      if (currentModeRef.current === "regular") {
        const reader = new FileReader();
        reader.onload = (f) => {
          const data = f.target?.result as string;
          addToCanvas(data);
          setUploadStatus({
            type: "success",
            message: "Image uploaded successfully!",
          });
          toast.success("Image uploaded", {
            description: "Image added to canvas",
          });
          setTimeout(() => {
            dispatch(setIsUploadImgOpen(false));
            setUploadStatus({ type: null, message: "" });
          }, 1500);
        };
        reader.readAsDataURL(file);
      } else {
        const form = new FormData();
        form.append("image_file", file);
        form.append("size", "auto");

        setUploadStatus({
          type: null,
          message: "Removing background...",
        });

        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY!,
          },
          body: form,
        });

        if (!res.ok) {
          let errorMessage = "Failed to remove background";

          try {
            const err = await res.json();
            console.error("remove.bg error response:", err);

            if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
              errorMessage = err.errors[0]?.title || err.errors[0]?.message || errorMessage;
            } else if (err.message) {
              errorMessage = err.message;
            }
          } catch (parseErr) {
            console.error("Failed to parse error response:", parseErr);
            errorMessage = `HTTP ${res.status}: Failed to remove background`;
          }

          setUploadStatus({
            type: "error",
            message: errorMessage,
          });
          toast.error("Background removal failed", {
            description: errorMessage,
          });
          setIsLoading(false);
          e.target.value = "";
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        addToCanvas(url);

        setUploadStatus({
          type: "success",
          message: "Background removed successfully!",
        });
        toast.success("Background removed", {
          description: "Image added to canvas",
        });

        setTimeout(() => {
          dispatch(setIsUploadImgOpen(false));
          setUploadStatus({ type: null, message: "" });
        }, 1500);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setUploadStatus({
        type: "error",
        message: errorMessage,
      });
      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog
      open={isUploadImgOpen}
      onOpenChange={(open) => !open && dispatch(setIsUploadImgOpen(false))}
    >
      <DialogContent className="max-w-md w-full p-6 mb-10!">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Upload Image
          </DialogTitle>
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
            className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${uploadStatus.type === "success"
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
              className={`text-sm font-medium ${uploadStatus.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
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
                <span className="text-xs text-gray-500">
                  {item.description}
                </span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}