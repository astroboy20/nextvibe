"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setIsPreviewOpen } from "@/app/provider/slices/canvasslice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface PreviewProps {
  canvas: any | null;
}

export default function Preview({ canvas }: PreviewProps) {
  const dispatch = useDispatch();
  const [preview, setPreview] = useState<string | undefined>();
  const isPreviewOpen = useSelector((state: any) => state.canvas.isPreviewOpen);

  useEffect(() => {
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(dataUrl);
    }
  }, [isPreviewOpen, canvas]);

  return (
    <Dialog
      open={isPreviewOpen}
      onOpenChange={(open) => !open && dispatch(setIsPreviewOpen(false))}
    >
      <DialogContent className="max-w-xl w-full p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Preview</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex justify-center items-center mt-4">
          <div className="flex bg-white rounded-xl shadow-md border border-gray-200 p-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              {preview && (
                <Image
                  src={preview}
                  width={200}
                  height={200}
                  alt="Canvas Preview"
                  className="rounded-md"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}