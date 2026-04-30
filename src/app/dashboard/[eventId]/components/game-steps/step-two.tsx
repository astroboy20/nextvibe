import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { EventPhase, ScheduleMode } from "../game-creation-wizard";

interface StepTwoProps {
  phase: string;
  setPhase: any;
  startsAt: any;
  setStartsAt: any;
  endsAt: any;
  setEndsAt: any;
  rounds: any;
  setRounds: any;
  gameDuration: any;
  setGameDuration: any;
  maxWinners: any;
  setMaxWinners: any;
  priceCurrency: any;
  basePrice: any;
  setBasePrice: any;
  perRoundPrice: any;
  setPerRoundPrice: any;
  scheduleMode: any;
  setScheduleMode: any;
}
const StepTwo = ({
  phase,
  setPhase,
  startsAt,
  endsAt,
  setEndsAt,
  setStartsAt,
  rounds,
  setRounds,
  gameDuration,
  setGameDuration,
  maxWinners,
  setMaxWinners,
  priceCurrency,
  basePrice,
  setBasePrice,
  perRoundPrice,
  setPerRoundPrice,
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
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>End Date & Time</Label>
        <Input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
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
              rounds === num
                ? "bg-[#531342] text-white hover:bg-[#531342]/90"
                : ""
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
      <Label>Game Duration (minutes)</Label>
      <div className="flex gap-2">
        {[15, 30, 45, 60].map((mins) => (
          <Button
            key={mins}
            variant={gameDuration === mins ? "default" : "outline"}
            size="sm"
            className={`flex-1 rounded-full ${
              gameDuration === mins
                ? "bg-[#531342] text-white hover:bg-[#531342]/90"
                : ""
            }`}
            onClick={() => setGameDuration(mins)}
          >
            {mins}m
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
              maxWinners === num
                ? "bg-[#531342] text-white hover:bg-[#531342]/90"
                : ""
            }`}
            onClick={() => setMaxWinners(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>

    {/* Pricing */}
    {/* <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Base Price ({priceCurrency})</Label>
        <Input
          type="number"
          min={0}
          value={basePrice}
          onChange={(e) => setBasePrice(Number(e.target.value))}
          placeholder="500"
        />
      </div>
      <div className="space-y-2">
        <Label>Per Round Price ({priceCurrency})</Label>
        <Input
          type="number"
          min={0}
          value={perRoundPrice}
          onChange={(e) => setPerRoundPrice(Number(e.target.value))}
          placeholder="100"
        />
      </div>
    </div> */}

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
              {
                value: "concurrent",
                label: "All at Once",
                desc: "All games available at the same time",
              },
              {
                value: "daily",
                label: "Daily",
                desc: "New round unlocks each day",
              },
              {
                value: "weekly",
                label: "Weekly",
                desc: "New round unlocks each week",
              },
            ] as { value: ScheduleMode; label: string; desc: string }[]
          ).map(({ value, label, desc }) => (
            <label
              key={value}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
                scheduleMode === value
                  ? "border-[#531342] bg-[#531342]/5"
                  : "border-border"
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
