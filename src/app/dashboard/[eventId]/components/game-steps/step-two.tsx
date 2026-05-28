import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Lock, Clock, Users, CalendarClock, RefreshCw } from "lucide-react";
import { EventPhase, ScheduleMode } from "../game-creation-wizard";

// End date is locked ONLY for pre-event — auto-set to 10 mins before event start.
// main-event, post-event, and both are always free.
const isEndDateLocked = (phase: EventPhase) => phase === "pre-event";

interface StepTwoProps {
  phase: EventPhase;
  setPhase: (v: EventPhase) => void;
  startsAt: string;
  setStartsAt: (v: string) => void;
  maxStartsAt: string;
  gameEndsAt: string;
  setGameEndsAt: (v: string) => void;
  repetitions: number;
  setRepetitions: (v: number) => void;
  gameDuration: number;
  setGameDuration: (v: number) => void;
  maxWinners: number;
  setMaxWinners: (v: number) => void;
  scheduleMode: ScheduleMode;
  setScheduleMode: (v: ScheduleMode) => void;
}

const PHASES: { value: EventPhase; label: string; desc: string }[] = [
  { value: "pre-event",  label: "Pre-Event",  desc: "Before the event starts" },
  { value: "main-event", label: "Main Event", desc: "During the event" },
  { value: "post-event", label: "Post-Event", desc: "After the event ends" },
  { value: "both",       label: "Both",       desc: "Pre & main event" },
];

const SCHEDULE_MODES: { value: ScheduleMode; label: string; desc: string }[] = [
  { value: "concurrent", label: "All at Once", desc: "All rounds available simultaneously" },
  { value: "daily",      label: "Daily",       desc: "New round unlocks each day" },
  { value: "weekly",     label: "Weekly",      desc: "New round unlocks each week" },
];

const StepTwo = ({
  phase, setPhase,
  startsAt, setStartsAt,
  maxStartsAt, gameEndsAt, setGameEndsAt,
  repetitions, setRepetitions,
  gameDuration, setGameDuration,
  maxWinners, setMaxWinners,
  scheduleMode, setScheduleMode,
}: StepTwoProps) => {
  const endLocked = isEndDateLocked(phase);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* When does this game run */}
      <div className="space-y-3">
        <div>
          <Label>When does this game run?</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Choose which phase of the event this game belongs to.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PHASES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPhase(value)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-xl border-2 p-3 text-left transition-all",
                phase === value ? "border-[#531342] bg-[#531342]/5" : "border-border hover:border-[#531342]/40"
              )}
            >
              <span className={cn("text-sm font-semibold", phase === value ? "text-[#531342]" : "")}>{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timing */}
      <div className="space-y-3">
        <Label className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Game Timing</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Starts At <span className="text-destructive">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={startsAt}
              max={endLocked && maxStartsAt ? maxStartsAt : undefined}
              onChange={(e) => setStartsAt(e.target.value)}
              className="h-10"
            />
            {endLocked && maxStartsAt && (
              <p className="text-[11px] text-muted-foreground">Must be before the event starts</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Ends At {endLocked && <Lock className="h-3 w-3" />}
            </Label>
            <Input
              type="datetime-local"
              value={gameEndsAt}
              disabled={endLocked}
              onChange={(e) => !endLocked && setGameEndsAt(e.target.value)}
              className={cn("h-10", endLocked && "cursor-not-allowed opacity-60")}
            />
            <p className="text-[11px] text-muted-foreground">
              {endLocked
                ? "Auto-set: 10 mins before event starts"
                : "Set when this game session ends"}
            </p>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Duration per Question (seconds)</Label>
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((s) => (
            <Button
              key={s}
              type="button"
              variant={gameDuration === s ? "default" : "outline"}
              size="sm"
              className={cn("flex-1 rounded-full", gameDuration === s && "bg-[#531342] hover:bg-[#531342]/90 text-white")}
              onClick={() => setGameDuration(s)}
            >
              {s}s
            </Button>
          ))}
        </div>
      </div>

      {/* Winners */}
      <div className="space-y-2">
        <div>
          <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Number of Winners</Label>
          <p className="text-xs text-muted-foreground mt-0.5">You'll set a reward for each winner in the next step.</p>
        </div>
        <div className="flex gap-2">
          {[1, 3, 5, 10].map((n) => (
            <Button
              key={n}
              type="button"
              variant={maxWinners === n ? "default" : "outline"}
              size="sm"
              className={cn("flex-1 rounded-full", maxWinners === n && "bg-[#531342] hover:bg-[#531342]/90 text-white")}
              onClick={() => setMaxWinners(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      {/* Repetitions */}
      <div className="space-y-2">
        <div>
          <Label className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Repetitions</Label>
          <p className="text-xs text-muted-foreground mt-0.5">How many times the game session repeats.</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 5].map((n) => (
            <Button
              key={n}
              type="button"
              variant={repetitions === n ? "default" : "outline"}
              size="sm"
              className={cn("flex-1 rounded-full", repetitions === n && "bg-[#531342] hover:bg-[#531342]/90 text-white")}
              onClick={() => setRepetitions(n)}
            >
              {n}×
            </Button>
          ))}
        </div>
      </div>

      {/* Schedule Mode */}
      <div className="space-y-3">
        <Label>Round Schedule</Label>
        <div className="space-y-2">
          {SCHEDULE_MODES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setScheduleMode(value)}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all",
                scheduleMode === value ? "border-[#531342] bg-[#531342]/5" : "border-border hover:border-[#531342]/40"
              )}
            >
              <div className={cn(
                "mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                scheduleMode === value ? "border-[#531342]" : "border-muted-foreground"
              )}>
                {scheduleMode === value && <div className="h-2 w-2 rounded-full bg-[#531342]" />}
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
