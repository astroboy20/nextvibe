import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, Clock, Users, RefreshCw, Trophy } from "lucide-react";
import { RoundData, RewardTier, gameTypeConfig } from "../game-creation-wizard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StepSixProps {
  gameName: string;
  phase: string;
  startsAt: string;
  endsAt: string;
  rounds: number;
  roundsData: RoundData[];
  gameDuration: number;
  maxWinners: number;
  priceCurrency: string;
  scheduleMode: string;
  contentMode: string;
  repetitions: number;
  rewardTiers: RewardTier[];
  handleComplete: () => void;
  isLoading?: boolean;
}

const PHASE_LABELS: Record<string, string> = {
  "pre-event": "Pre-Event", "main-event": "Main Event",
  "post-event": "Post-Event", "both": "Both",
};

const SCHEDULE_LABELS: Record<string, string> = {
  concurrent: "All at Once", daily: "Daily", weekly: "Weekly",
};

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

const StepSix = ({
  gameName, phase, startsAt, endsAt, rounds, roundsData,
  gameDuration, maxWinners, priceCurrency, scheduleMode,
  contentMode, repetitions, rewardTiers, handleComplete, isLoading,
}: StepSixProps) => (
  <div className="space-y-5 animate-fade-in">
    <div className="text-center space-y-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#531342]/10 mx-auto">
        <CheckCircle2 className="h-7 w-7 text-[#531342]" />
      </div>
      <h3 className="font-bold text-lg">Ready to publish</h3>
      <p className="text-sm text-muted-foreground">Review everything before creating your game.</p>
    </div>

    {/* Game summary */}
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-[#531342]/5 px-4 py-3 border-b border-border">
        <h4 className="font-semibold text-sm">{gameName || "Untitled Game"}</h4>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge variant="outline" className="text-xs">{PHASE_LABELS[phase] ?? phase}</Badge>
          <Badge variant="outline" className="text-xs">{SCHEDULE_LABELS[scheduleMode] ?? scheduleMode}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{contentMode === "ai" ? "AI Generated" : "Manual"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        {[
          { icon: <Clock className="h-3.5 w-3.5" />, value: `${gameDuration}s`, label: "Per question" },
          { icon: <Users className="h-3.5 w-3.5" />, value: maxWinners, label: "Winners" },
          { icon: <RefreshCw className="h-3.5 w-3.5" />, value: `${repetitions}×`, label: "Repeats" },
        ].map(({ icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 py-3">
            <div className="flex items-center gap-1 text-muted-foreground">{icon}</div>
            <p className="text-base font-bold">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {startsAt && (
        <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
          {new Date(startsAt).toLocaleString()} → {endsAt ? new Date(endsAt).toLocaleString() : "auto"}
        </div>
      )}
    </div>

    {/* Rounds summary */}
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {rounds} Round{rounds !== 1 ? "s" : ""}
      </p>
      {roundsData.map((r, i) => {
        const config = gameTypeConfig[r.gameType];
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#531342]/10 text-[#531342] shrink-0">
              {config?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.title || `Round ${i + 1}`}</p>
              <p className="text-xs text-muted-foreground">{config?.label} · {r.questions.length} question{r.questions.length !== 1 ? "s" : ""}</p>
            </div>
            <CheckCircle2 className={cn("h-4 w-4 shrink-0", r.questions.length > 0 ? "text-emerald-500" : "text-muted-foreground/30")} />
          </div>
        );
      })}
    </div>

    {/* Rewards summary */}
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-amber-500" /> Rewards
      </p>
      {rewardTiers.map((tier, i) => (
        <div key={tier.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold shrink-0",
            i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-muted-foreground"
          )}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{tier.title || `${ORDINALS[i]} Place`}</p>
            <p className="text-xs text-muted-foreground">{tier.type}{tier.value ? ` · ${tier.type === "CASH" ? `${priceCurrency} ` : ""}${tier.value}` : ""}</p>
          </div>
        </div>
      ))}
    </div>

    <Button
      onClick={handleComplete}
      disabled={isLoading}
      className="w-full h-12 gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white text-base font-semibold"
    >
      {isLoading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Creating Game…</>
      ) : (
        <><Play className="h-4 w-4" /> Create Game</>
      )}
    </Button>
  </div>
);

export default StepSix;
