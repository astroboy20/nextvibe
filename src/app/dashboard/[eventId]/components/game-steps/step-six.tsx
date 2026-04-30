import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  Calendar,
  Sparkles,
  Pencil,
  Trophy,
  Play,
  Loader2,
} from "lucide-react";
import { Question, RewardTier } from "../game-creation-wizard";
import { Badge } from "@/components/ui/badge";

interface StepSixProps {
  gameName: string;
  gameType: any;
  gameTypeConfig: any;
  phase: string;
  startsAt: any;
  endsAt: any;
  rounds: any;
  gameDuration: any;
  maxWinners: any;
  priceCurrency: any;
  basePrice: any;
  perRoundPrice: any;
  scheduleMode: any;
  questions: Question[];
  contentMode: string;
  rewardTiers: RewardTier[];
  handleComplete: () => void;
  isLoading?: boolean;
}

const StepSix = ({
  gameName,
  gameTypeConfig,
  gameType,
  phase,
  startsAt,
  endsAt,
  rounds,
  gameDuration,
  maxWinners,
  priceCurrency,
  basePrice,
  perRoundPrice,
  scheduleMode,
  questions,
  contentMode,
  rewardTiers,
  handleComplete,
  isLoading,
}: StepSixProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4">
        <Eye className="h-8 w-8 text-[#531342]" />
      </div>
      <h3 className="font-display text-xl font-bold">Preview & Submit</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Review your game before publishing
      </p>
    </div>

    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#531342]/10">
            {gameTypeConfig[gameType].icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{gameName || "Untitled Game"}</h4>
            <p className="text-sm text-muted-foreground">
              {gameTypeConfig[gameType].label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-[#531342]/10 p-3">
            <p className="text-lg font-bold">{rounds}</p>
            <p className="text-xs text-muted-foreground">Rounds</p>
          </div>
          <div className="rounded-lg bg-[#531342]/10 p-3">
            <p className="text-lg font-bold">{questions.length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="rounded-lg bg-[#531342]/10 p-3">
            <p className="text-xs font-semibold capitalize">
              {phase.replace("-", " ")}
            </p>
            <p className="text-xs text-muted-foreground">Phase</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-[#531342]/10 p-3">
            <p className="text-lg font-bold">{gameDuration}m</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          <div className="rounded-lg bg-[#531342]/10 p-3">
            <p className="text-lg font-bold">{maxWinners}</p>
            <p className="text-xs text-muted-foreground">Max Winners</p>
          </div>
        </div>

        <div className="rounded-lg bg-[#531342]/10 p-3 text-center">
          <p className="text-sm font-bold">
            {priceCurrency} {basePrice} base + {priceCurrency} {perRoundPrice}
            /round
          </p>
          <p className="text-xs text-muted-foreground">Pricing</p>
        </div>

        {startsAt && endsAt && (
          <div className="rounded-lg bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            {new Date(startsAt).toLocaleString()} →{" "}
            {new Date(endsAt).toLocaleString()}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {scheduleMode.charAt(0).toUpperCase() + scheduleMode.slice(1)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {contentMode === "ai" ? (
              <Sparkles className="h-3 w-3" />
            ) : (
              <Pencil className="h-3 w-3" />
            )}
            {contentMode === "ai" ? "AI Generated" : "Manual"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" />
            {rewardTiers.length} Reward Tier
            {rewardTiers.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Button
      onClick={handleComplete}
      disabled={isLoading}
      className="w-full gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Play className="h-4 w-4" />
          Create Game
        </>
      )}
    </Button>
  </div>
);

export default StepSix;
