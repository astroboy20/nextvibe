import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { EventPhase, ScheduleMode } from "../game-creation-wizard";

interface StepTwoProps {
  phase: string;
  setPhase: (v: EventPhase) => void;
  startsAt: string;
  setStartsAt: (v: string) => void;
  maxStartsAt: string;   // ceiling: must be before event start
  gameEndsAt: string;    // auto-derived: 1 min before event — read-only
  rounds: number;
  setRounds: (v: number) => void;
  gameDuration: number;
  setGameDuration: (v: number) => void;
  maxWinners: number;
  setMaxWinners: (v: number) => void;
  priceCurrency: string;
  basePrice: number;
  setBasePrice: (v: number) => void;
  perRoundPrice: number;
  setPerRoundPrice: (v: number) => void;
  scheduleMode: ScheduleMode;
  setScheduleMode: (v: ScheduleMode) => void;
}

const StepTwo = ({
  phase,
  setPhase,
  startsAt,
  setStartsAt,
  maxStartsAt,
  gameEndsAt,
  rounds,
  setRounds,
  gameDuration,
  setGameDuration,
  maxWinners,
  setMaxWinners,
  priceCurrency: _priceCurrency,
  basePrice: _basePrice,
  setBasePrice: _setBasePrice,
  perRoundPrice: _perRoundPrice,
  setPerRoundPrice: _setPerRoundPrice,
  scheduleMode,
  setScheduleMode,
}: StepTwoProps) => (
  <div className="space-y-6 animate-fade-in">
    {/* Event Phase */}
    <div className="space-y-3">
      <Label>Event Phase</Label>
      <ToggleGroup
        type="single"
        value={phase}
        onValueChange={(v) => v && setPhase(v as EventPhase)}
        className="justify-start flex-wrap"
      >
        <ToggleGroupItem value="pre-event" className="rounded-full">
          Pre-Event
        </ToggleGroupItem>
        <ToggleGroupItem value="main-event" className="rounded-full">
          Main Event
        </ToggleGroupItem>
        <ToggleGroupItem value="both" className="rounded-full">
          Both
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    {/* Date / Time */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Date & Time</Label>
        <Input
          type="datetime-local"
          value={startsAt}
          max={maxStartsAt || undefined}
          onChange={(e) => setStartsAt(e.target.value)}
        />
        {maxStartsAt && (
          <p className="text-xs text-muted-foreground">
            Must be before the event starts
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          End Date & Time
          <Lock className="h-3 w-3 text-muted-foreground" />
        </Label>
        <Input
          type="datetime-local"
          value={gameEndsAt}
          disabled
          className="cursor-not-allowed opacity-60"
        />
        <p className="text-xs text-muted-foreground">
          Auto-set to 1 min before event
        </p>
      </div>
    </div>

    {/* Rounds */}
    <div className="space-y-3">
      <Label>Number of Rounds</Label>
      <div className="flex gap-2">
        {[1, 3, 5, 10].map((num) => (
          <Button
            key={num}
            variant={rounds === num ? "default" : "outline"}
            size="sm"
            className={`flex-1 rounded-full ${
              rounds === num ? "bg-[#531342] text-white hover:bg-[#531342]/90" : ""
            }`}
            onClick={() => setRounds(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>

    {/* Game Duration */}
    <div className="space-y-2">
      <Label>Game Duration (Seconds)</Label>
      <div className="flex gap-2">
        {[15, 30, 45, 60].map((secs) => (
          <Button
            key={secs}
            variant={gameDuration === secs ? "default" : "outline"}
            size="sm"
            className={`flex-1 rounded-full ${
              gameDuration === secs ? "bg-[#531342] text-white hover:bg-[#531342]/90" : ""
            }`}
            onClick={() => setGameDuration(secs)}
          >
            {secs}s
          </Button>
        ))}
      </div>
    </div>

    {/* Max Winners */}
    <div className="space-y-2">
      <Label>Max Winners</Label>
      <div className="flex gap-2">
        {[1, 3, 5, 10].map((num) => (
          <Button
            key={num}
            variant={maxWinners === num ? "default" : "outline"}
            size="sm"
            className={`flex-1 rounded-full ${
              maxWinners === num ? "bg-[#531342] text-white hover:bg-[#531342]/90" : ""
            }`}
            onClick={() => setMaxWinners(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>

    {/* Schedule Mode */}
    <div className="space-y-3">
      <Label>Schedule Mode</Label>
      <RadioGroup
        value={scheduleMode}
        onValueChange={(v) => setScheduleMode(v as ScheduleMode)}
      >
        <div className="space-y-3">
          {(
            [
              { value: "concurrent", label: "All at Once", desc: "All games available at the same time" },
              { value: "daily",      label: "Daily",       desc: "New round unlocks each day" },
              { value: "weekly",     label: "Weekly",      desc: "New round unlocks each week" },
            ] as { value: ScheduleMode; label: string; desc: string }[]
          ).map(({ value, label, desc }) => (
            <label
              key={value}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
                scheduleMode === value ? "border-[#531342] bg-[#531342]/5" : "border-border"
              )}
            >
              <RadioGroupItem value={value} id={value} className="mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">{label}</div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  </div>
);

export default StepTwo;
