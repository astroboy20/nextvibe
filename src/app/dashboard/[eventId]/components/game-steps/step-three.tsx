"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Pencil, Sparkles } from "lucide-react";

type GameType = "TRIVIA" | "WORD-PUZZLE" | "TWO-TRUTHS" | "THIS-OR-THAT";

interface StepThreeProps {
  contentMode: string;
  setContentMode: any;
  aiPrompt: {
    topic: string;
    count: number;
    gameType: GameType | "";
    difficulty: string;
    activityTiming: "pre_event" | "ongoing" | "post_event" | "";

    eventName: string;
  };
  setAiPrompt: any;
}

const gameTypeConfig: Record<GameType, { label: string; description: string }> =
  {
    TRIVIA: {
      label: "Trivia",
      description: "Multiple choice questions",
    },
    "WORD-PUZZLE": {
      label: "Word Puzzle",
      description: "Find words from letters",
    },
    "TWO-TRUTHS": {
      label: "2 Truths & 1 Lie",
      description: "Guess the lie",
    },
    "THIS-OR-THAT": {
      label: "This or That",
      description: "Choose between options",
    },
  };

const StepThree = ({
  contentMode,
  setContentMode,
  aiPrompt,
  setAiPrompt,
}: StepThreeProps) => {
  const updateField = (field: string, value: any) => {
    setAiPrompt((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Selection */}
      <div className="space-y-3">
        <Label>Content Creation Method</Label>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setContentMode("ai")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
              contentMode === "ai"
                ? "border-[#531342] bg-linear-to-br from-[#531342]/10 to-accent/10"
                : "border-border hover:border-[#531342]/50"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                contentMode === "ai"
                  ? "bg-linear-to-br from-[#531342] to-accent text-[#531342]"
                  : "bg-muted"
              )}
            >
              <Sparkles className="h-7 w-7" />
            </div>
            <span className="font-semibold">AI Generated</span>
            <span className="text-xs text-muted-foreground text-center">
              Let AI create questions based on your prompt
            </span>
          </button>

          <button
            onClick={() => setContentMode("manual")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
              contentMode === "manual"
                ? "border-[#531342] bg-[#531342]/10"
                : "border-border hover:border-[#531342]/50"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                contentMode === "manual"
                  ? "bg-[#531342] text-white"
                  : "bg-muted"
              )}
            >
              <Pencil className="h-7 w-7" />
            </div>
            <span className="font-semibold">Manual Input</span>
            <span className="text-xs text-muted-foreground text-center">
              Create your own questions manually
            </span>
          </button>
        </div>
      </div>

      {/* AI MODE */}
      {contentMode === "ai" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Topic */}
            <div className="space-y-3">
              <Label>Topic</Label>
              <Input
                value={aiPrompt.topic}
                onChange={(e) => updateField("topic", e.target.value)}
                placeholder="e.g. 90s pop culture"
              />
            </div>

            {/* Count */}
            <div className="space-y-3">
              <Label>Count</Label>
              <Input
                type="number"
                value={aiPrompt.count}
                onChange={(e) => updateField("count", Number(e.target.value))}
                placeholder="e.g. 10"
              />
            </div>

            {/* Activity Timing */}
            <div className="space-y-3">
              <Label>Activity Timing</Label>
              <Select
                value={aiPrompt.activityTiming}
                onValueChange={(val) => updateField("activityTiming", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timing" className="w-full" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_event">Pre Event</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="post_event">Post Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Game Type */}
            <div className="space-y-3">
              <Label>Game Type</Label>
              <Select
                value={aiPrompt.gameType}
                onValueChange={(val) => updateField("gameType", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(gameTypeConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">{val.label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <Label>Difficulty</Label>
              <Select
                value={aiPrompt.difficulty}
                onValueChange={(val) => updateField("difficulty", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Name */}
            <div className="space-y-3">
              <Label>Event Name</Label>
              <Input
                value={aiPrompt.eventName}
                disabled
                onChange={(e) => updateField("eventName", e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Be specific about the theme, difficulty level, and audience for
            better results
          </p>
        </>
      )}

      {/* MANUAL MODE */}
      {contentMode === "manual" && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
          <Pencil className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You&apos;ll be able to add questions manually in the next step
          </p>
        </div>
      )}
    </div>
  );
};

export default StepThree;
