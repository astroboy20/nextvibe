import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface StepOneProps {
  gameName: string;
  setGameName: (v: string) => void;
  numberOfRounds: number;
  setNumberOfRounds: (v: number) => void;
}

const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const StepOne = ({ gameName, setGameName, numberOfRounds, setNumberOfRounds }: StepOneProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Label>Game Name <span className="text-destructive">*</span></Label>
      <Input
        placeholder="e.g. Nextvibe Trivia Night"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        className="h-11 text-base"
        autoFocus
      />
    </div>

    <div className="space-y-3">
      <div>
        <Label>Number of Rounds</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Each round can have a different game type and its own set of questions. Max 10 rounds.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {ROUND_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNumberOfRounds(n)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border-2 py-4 transition-all",
              numberOfRounds === n
                ? "border-[#531342] bg-[#531342]/10"
                : "border-border hover:border-[#531342]/40"
            )}
          >
            <span className={cn("text-2xl font-bold", numberOfRounds === n ? "text-[#531342]" : "text-foreground")}>
              {n}
            </span>
            <span className="text-[11px] text-muted-foreground">{n === 1 ? "round" : "rounds"}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default StepOne;
