"use client";

import { useState } from "react";
import { Gamepad2, CheckCircle2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SimplifiedGamificationForm } from "./simplified-gamification-form";

interface GamesStepProps {
  initialData?: any;
  eventStartDate?: string;
  eventEndDate?: string;
  onSave: (data: any) => void;
  onBack: () => void;
}

export default function GamesStep({
  initialData,
  eventStartDate,
  eventEndDate,
  onSave,
  onBack,
}: GamesStepProps) {
  const [gamesData, setGamesData] = useState<any>(initialData ?? null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (data: any) => {
    setGamesData(data);
    setModalOpen(false);
    toast.success("Games configuration saved!");
  };

  const handleContinue = () => {
    if (!gamesData) {
      toast.warning("Please set up at least one game before continuing");
      return;
    }
    onSave(gamesData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 items-center" onClick={onBack}>
        <ChevronLeft className="cursor-pointer" /> Back
      </div>
      {/* Header */}
      <div>
        <p className="text-lg font-semibold text-[#5B1A57]">Event Games</p>
        <p className="text-sm text-gray-500 mt-1">
          Set up engaging games for your attendees including trivia, word
          puzzles, this or that, and more.
        </p>
      </div>

      {/* Game setup button */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "w-full rounded-xl border-2 p-4 text-left transition-all",
          gamesData
            ? "border-emerald-400 bg-emerald-50"
            : "border-[#5B1A57] bg-transparent hover:bg-[#5B1A57]/5"
        )}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full border border-[#5B1A57] flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5 text-[#5B1A57]" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {gamesData ? "Edit Games" : "Set Up Games"}
            </p>
            <p className="text-xs text-gray-500">
              {gamesData
                ? `${gamesData.games?.length ?? 0} game round(s) configured`
                : "Trivia, word puzzles, this or that, and more"}
            </p>
          </div>
        </div>
        {gamesData && (
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Games configured
          </p>
        )}
      </button>

      {/* Games Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="w-[98%] sm:max-w-3xl max-h-[70vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Games Setup
            </DialogTitle>
          </DialogHeader>
          <SimplifiedGamificationForm
            eventGamificationType="main-event"
            initialData={gamesData}
            onNext={handleSave}
            onBack={() => setModalOpen(false)}
            eventStartDate={eventStartDate}
            eventEndDate={eventEndDate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
