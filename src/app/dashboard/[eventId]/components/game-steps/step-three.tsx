"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Pencil, Sparkles, HelpCircle, Puzzle, MessageSquare, Zap } from "lucide-react";
import { GameType, GameTypeOrEmpty } from "../game-creation-wizard";

interface StepThreeProps {
  roundIndex: number;
  totalRounds: number;
  roundTitle: string;
  roundDescription: string;
  onRoundTitleChange: (v: string) => void;
  onRoundDescriptionChange: (v: string) => void;
  selectedGameType: GameType;
  onGameTypeChange: (v: GameType) => void;
  contentMode: string;
  setContentMode: (v: string) => void;
  aiPrompt: {
    topic: string;
    count: number | null;
    gameType: GameTypeOrEmpty;
    difficulty: string;
    activityTiming: "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH" | "";
    eventName: string;
  };
  setAiPrompt: React.Dispatch<React.SetStateAction<any>>;
}

const GAME_TYPES: { value: GameType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "trivia",         label: "Trivia",           description: "Multiple choice Q&A", icon: <HelpCircle className="h-5 w-5" /> },
  { value: "word-puzzle",    label: "Word Puzzle",      description: "Find hidden words",   icon: <Puzzle className="h-5 w-5" /> },
  { value: "two-truths",     label: "2 Truths & 1 Lie", description: "Spot the lie",        icon: <MessageSquare className="h-5 w-5" /> },
  { value: "this-or-that",   label: "This or That",     description: "Pick between two",    icon: <Zap className="h-5 w-5" /> },
];

const StepThree = ({
  roundIndex,
  totalRounds,
  roundTitle,
  roundDescription,
  onRoundTitleChange,
  onRoundDescriptionChange,
  selectedGameType,
  onGameTypeChange,
  contentMode,
  setContentMode,
  aiPrompt,
  setAiPrompt,
}: StepThreeProps) => {
  const updateField = (field: string, value: any) =>
    setAiPrompt((prev: any) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Round indicator */}
      <div className="flex items-center gap-2 rounded-xl bg-[#531342]/5 border border-[#531342]/20 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#531342] text-white text-xs font-bold shrink-0">
          {roundIndex + 1}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#531342]">
            Round {roundIndex + 1} of {totalRounds}
          </p>
          <p className="text-xs text-muted-foreground">Set up the game type and questions for this round.</p>
        </div>
      </div>

      {/* Round title & description */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Round Title</Label>
          <Input
            value={roundTitle}
            onChange={(e) => onRoundTitleChange(e.target.value)}
            placeholder={`Round ${roundIndex + 1} — General Knowledge`}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            value={roundDescription}
            onChange={(e) => onRoundDescriptionChange(e.target.value)}
            placeholder="Answer as fast as you can!"
            className="h-10"
          />
        </div>
      </div>

      {/* Game type */}
      <div className="space-y-3">
        <Label>Game Type for this Round</Label>
        <div className="grid grid-cols-2 gap-2">
          {GAME_TYPES.map(({ value, label, description, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onGameTypeChange(value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                selectedGameType === value
                  ? "border-[#531342] bg-[#531342]/5"
                  : "border-border hover:border-[#531342]/40"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                selectedGameType === value ? "bg-[#531342] text-white" : "bg-muted text-muted-foreground"
              )}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content method */}
      <div className="space-y-3">
        <Label>How do you want to add questions?</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setContentMode("ai")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              contentMode === "ai" ? "border-[#531342] bg-[#531342]/5" : "border-border hover:border-[#531342]/40"
            )}
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", contentMode === "ai" ? "bg-[#531342] text-white" : "bg-muted")}>
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">AI Generate</span>
            <span className="text-xs text-muted-foreground text-center">Let AI write questions from a topic</span>
          </button>
          <button
            type="button"
            onClick={() => setContentMode("manual")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              contentMode === "manual" ? "border-[#531342] bg-[#531342]/5" : "border-border hover:border-[#531342]/40"
            )}
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", contentMode === "manual" ? "bg-[#531342] text-white" : "bg-muted")}>
              <Pencil className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">Write Manually</span>
            <span className="text-xs text-muted-foreground text-center">Type your own questions</span>
          </button>
        </div>
      </div>

      {/* AI prompt fields */}
      {contentMode === "ai" && (
        <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Prompt</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Topic <span className="text-destructive">*</span></Label>
              <Input
                value={aiPrompt.topic}
                onChange={(e) => updateField("topic", e.target.value)}
                placeholder="e.g. Nigerian history, 90s pop culture"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Number of Questions <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={aiPrompt.count === null ? "" : aiPrompt.count}
                onChange={(e) => updateField("count", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 5"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Difficulty <span className="text-destructive">*</span></Label>
              <Select value={aiPrompt.difficulty} onValueChange={(v) => updateField("difficulty", v)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Be specific — "Lagos street food" beats "food".
          </p>
        </div>
      )}

      {contentMode === "manual" && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
          <Pencil className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click <strong>Next</strong> to start adding questions for this round.</p>
        </div>
      )}
    </div>
  );
};

export default StepThree;
