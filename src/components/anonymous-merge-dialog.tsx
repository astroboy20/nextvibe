"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Trophy } from "lucide-react";
import type { AnonPendingSession } from "@/lib/anonymous-game";

interface Props {
  sessions: AnonPendingSession[];
  onConfirm: (confirmedEventIds: string[]) => void | Promise<void>;
  onSkip: () => void;
  isLoading?: boolean;
}

export function AnonymousMergeDialog({ sessions, onConfirm, onSkip, isLoading }: Props) {
  const uniqueEvents = sessions.reduce<{ eventId: string; eventName: string }[]>(
    (acc, s) => {
      if (!acc.find((e) => e.eventId === s.eventId)) {
        acc.push({ eventId: s.eventId, eventName: s.eventName });
      }
      return acc;
    },
    [],
  );

  const [selected, setSelected] = useState<Set<string>>(
    new Set(uniqueEvents.map((e) => e.eventId)),
  );

  const toggle = (eventId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(eventId) ? next.delete(eventId) : next.add(eventId);
      return next;
    });
  };

  const handleConfirm = () => onConfirm(Array.from(selected));

  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Save your game progress?</DialogTitle>
          <DialogDescription className="text-center">
            You played {sessions.length} game{sessions.length !== 1 ? "s" : ""} before
            signing in. Select the events you want to RSVP and register your participation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {uniqueEvents.map((event) => (
            <label
              key={event.eventId}
              className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={selected.has(event.eventId)}
                onCheckedChange={() => toggle(event.eventId)}
                className="border-gray-300 data-[state=checked]:bg-[#5B1A57] data-[state=checked]:border-[#5B1A57]"
              />
              <span className="text-sm font-medium leading-none">{event.eventName}</span>
            </label>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleConfirm}
            disabled={selected.size === 0 || isLoading}
            className="w-full bg-[#5B1A57] hover:bg-[#4a1446] text-white"
          >
            {isLoading ? "Saving…" : `RSVP & Save${selected.size > 0 ? ` (${selected.size})` : ""}`}
          </Button>
          <Button variant="ghost" onClick={onSkip} disabled={isLoading} className="w-full">
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
