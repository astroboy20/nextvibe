"use client";

import { useRef } from "react";
import { Canvas, Image as FabricImage } from "fabric";
import { useDispatch, useSelector } from "react-redux";
import { setIsUploadImgOpen } from "@/app/provider/slices/canvasslice";
import { RootState } from "@/app/provider/store";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Wand } from "lucide-react";

interface UploadImgProps {
  canvas: Canvas | null;
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

  const openFilePicker = (mode: "regular" | "removeBg") => {
    currentModeRef.current = mode;
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(setIsUploadImgOpen(false));

    if (currentModeRef.current === "regular") {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        FabricImage.fromURL(data).then((img) => {
          img.scaleToWidth(200);
          canvas?.setActiveObject(img);
          canvas?.centerObject(img);
          canvas?.add(img);
        });
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const form = new FormData();
        form.append("image_file", file);
        form.append("size", "auto");

        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY!,
          },
          body: form,
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("remove.bg error:", err);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        FabricImage.fromURL(url).then((img) => {
          img.scaleToWidth(200);
          canvas?.setActiveObject(img);
          canvas?.centerObject(img);
          canvas?.add(img);
        });
      } catch (error) {
        console.error("Background removal failed:", error);
      }
    }

    e.target.value = "";
  };

  return (
    <Dialog
      open={isUploadImgOpen}
      onOpenChange={(open) => !open && dispatch(setIsUploadImgOpen(false))}
    >
      <DialogContent className="max-w-md w-full p-6">
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
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Button
                key={i}
                variant="outline"
                className="flex flex-col items-center justify-center p-6 space-y-2 hover:scale-105 transition-transform duration-300"
                onClick={() => openFilePicker(item.mode as any)}
              >
                <Icon className="w-8 h-8" />
                <span className="font-semibold text-sm">{item.label}</span>
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
