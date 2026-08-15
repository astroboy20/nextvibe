/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsPreviewOpen } from "@/app/provider/slices/canvas-slice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PreviewProps {
  canvas: any | null;
}

// Same pool as templates.tsx so the preview feels consistent
const DUMMY_PERSON_POOL = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=85&auto=format&fit=crop",
];

function pickRandom(): string {
  return DUMMY_PERSON_POOL[Math.floor(Math.random() * DUMMY_PERSON_POOL.length)];
}

export default function Preview({ canvas }: PreviewProps) {
  const dispatch = useDispatch();
  const [preview, setPreview] = useState<string | undefined>();
  const [dummyBg, setDummyBg] = useState<string>(() => pickRandom());
  const isPreviewOpen = useSelector((state: any) => state.canvas.isPreviewOpen);

  useEffect(() => {
    if (isPreviewOpen && canvas) {
      canvas.renderAll();
      const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
      setPreview(dataUrl);
      // Pick a fresh random dummy each time the preview opens
      setDummyBg(pickRandom());
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

        {/* Label */}
        <p className="text-xs text-muted-foreground text-center mt-1">
          The background photo below is just a dummy — it shows how your VibeTag will look on a real photo.
        </p>

        <div className="flex flex-col items-center gap-3 mt-4">
          {/* Composited preview: dummy person behind, vibetag on top */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200"
            style={{ width: 200, height: 400 }}
          >
            {/* Dummy person fills the full card */}
            <img
              src={dummyBg}
              alt="Dummy background"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Vibetag export overlaid at 80% opacity */}
            {preview && (
              <img
                src={preview}
                alt="VibeTag overlay"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.8 }}
              />
            )}

            {/* Subtle "Preview" badge */}
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
              <p className="text-[9px] font-semibold text-white/80 uppercase tracking-wide">Preview</p>
            </div>
          </div>

          {/* Swap dummy photo button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setDummyBg(pickRandom())}
          >
            <RefreshCw className="w-3 h-3" />
            Try another background
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
