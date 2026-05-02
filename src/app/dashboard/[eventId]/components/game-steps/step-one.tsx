import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameType } from "../game-creation-wizard";
import { cn } from "@/lib/utils";

interface StepOneProps {
  gameName: string;
  setGameName: (v: string) => void;
  gameType: GameType;
  gameTypeConfig: Record<GameType, { icon: React.ReactNode; label: string; description: string }>;
  setGameType: (v: GameType) => void;
}
const StepOne = ({
  gameName,
  setGameName,
  gameTypeConfig,
  setGameType,
  gameType
}: StepOneProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Label>Game Name</Label>
      <Input
        placeholder="e.g., Birthday Trivia Challenge"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        className="text-lg"
      />
    </div>

    <div className="space-y-3">
      <Label>Game Type</Label>
      <div className="grid grid-cols-2 gap-3">
        {(
          Object.entries(gameTypeConfig) as [
            GameType,
            typeof gameTypeConfig.trivia
          ][]
        ).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setGameType(type)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              gameType === type
                ? "border-[#531342] bg-[#531342]/10"
                : "border-border hover:border-[#531342]/50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                gameType === type ? "bg-[#531342] text-white" : "bg-muted"
              )}
            >
              {config.icon}
            </div>
            <span className="font-medium text-sm">{config.label}</span>
            <span className="text-xs text-muted-foreground text-center">
              {config.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default StepOne;
