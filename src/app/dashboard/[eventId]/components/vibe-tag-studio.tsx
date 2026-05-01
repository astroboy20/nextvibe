"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Vibetags from "./vibetag/vibetags";

interface VibeTag {
  id: string;
  name: string;
  imageUrl: string;
}

interface VibeTagStudioContentProps {
  eventId: string;
  name?: string;
  vibeTag?: VibeTag | null;
}

const VibeTagStudioContent = ({
  eventId,
  name,
  vibeTag,
}: VibeTagStudioContentProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-3">
        <Button
          size="sm"
          className="w-full gap-1.5 rounded-xl mb-4 bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => setOpen(true)}
        >
          <Tag className="h-3.5 w-3.5" />
          {vibeTag ? "Update VibeTag" : "Create VibeTag"}
        </Button>

        {vibeTag ? (
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            {/* VibeTag image preview */}
            <div className="h-12 w-10 rounded-lg shrink-0 overflow-hidden bg-muted border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vibeTag.imageUrl}
                alt={vibeTag.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate">{vibeTag.name}</h4>
                <Badge
                  variant="outline"
                  className="border-[#531342]/50 text-[#531342] text-[10px]"
                >
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Applied to all postcards for this event
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center rounded-xl border border-dashed border-border">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No VibeTag set yet</p>
            <p className="text-xs text-muted-foreground/60">
              Create one to stamp your event&apos;s identity on every postcard
            </p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg h-screen overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>
              {vibeTag ? "Update VibeTag" : "Create VibeTag"}
            </DialogTitle>
          </DialogHeader>
          <Vibetags onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VibeTagStudioContent;
