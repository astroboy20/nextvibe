"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 👉 import your existing VibeTag component
import VibeTag from "./vibetag"; // adjust path if needed
import Vibetags from "../../event/edit/components/steps/vibetag/vibetags";

const VibeTagStudioContent = () => {
  const [open, setOpen] = useState(false); // ✅ modal state

  const [vibeTags] = useState([
    {
      id: "1",
      name: "Detty December Vibes",
      phase: "main-event",
      template: "gradient",
      postcardCount: 24,
    },
    {
      id: "2",
      name: "Countdown Memories",
      phase: "pre-event",
      template: "polaroid",
      postcardCount: 8,
    },
  ]);

  const templatePreviews: Record<string, string> = {
    classic: "bg-gradient-to-br from-[#531342]/20 to-accent/20",
    polaroid: "bg-white border-4 border-b-8",
    minimal: "bg-muted",
    gradient: "bg-gradient-to-br from-[#531342] via-accent to-[#531342]",
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case "pre-event":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-600"
          >
            Pre-Event
          </Badge>
        );
      case "main-event":
        return (
          <Badge
            variant="outline"
            className="border-[#531342]/50 text-[#531342]"
          >
            Main Event
          </Badge>
        );
      case "both":
        return (
          <Badge
            variant="outline"
            className="border-accent/50 text-accent-foreground"
          >
            Both
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Button
          size="sm"
          className="w-full gap-1.5 rounded-xl mb-4 bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => setOpen(true)} // ✅ only addition
        >
          <Tag className="h-3.5 w-3.5" />
          Create VibeTag
        </Button>

        {vibeTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-3 rounded-xl border border-border p-3"
          >
            <div
              className={`h-12 w-10 rounded-lg shrink-0 ${
                templatePreviews[tag.template]
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate">{tag.name}</h4>
                {getPhaseBadge(tag.phase)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tag.postcardCount} postcards created
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ MODAL (added, no UI changes above) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Create VibeTag</DialogTitle>
          </DialogHeader>

          <Vibetags onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VibeTagStudioContent;