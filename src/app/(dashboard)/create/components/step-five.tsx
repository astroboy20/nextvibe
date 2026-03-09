"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GamePrize } from "@/types/game.type";
import { useDispatch, useSelector } from "react-redux";
import {
  nextStep,
  prevStep,
  selectEventFormData,
} from "@/app/provider/slices/eventformslice";

const positionStyle = (position: number) => {
  if (position === 1) return "bg-yellow-400 text-yellow-900";
  if (position === 2) return "bg-gray-300 text-gray-800";
  if (position === 3) return "bg-amber-600 text-amber-50";
  return "bg-[#5B1A57]/10 text-[#5B1A57]";
};

function PrizeRow({ prize, index }: { prize: GamePrize; index: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            positionStyle(prize.position)
          )}
        >
          #{prize.position}
        </span>
        <div>
          <p className="text-sm font-medium">{prize.prize}</p>
          <p className="text-xs text-gray-400 capitalize">{prize.prizeType}</p>
        </div>
      </div>
    </div>
  );
}

function PrizeCard({ title, games }: { title: string; games: any }) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm">
      <CardContent className="pt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#5B1A57]" />
          <h4 className="font-semibold text-base">{title}</h4>
        </div>

        <p className="text-sm text-gray-400 -mt-2">
          {games.games?.length ?? 0} game round(s) &bull; Max{" "}
          {games.maxNoOfWinners ?? 0} winners
        </p>

        <Separator />

        <div className="flex flex-col gap-3">
          {games.prizes.map((prize: GamePrize, index: number) => (
            <PrizeRow key={index} prize={prize} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="rounded-xl border border-dashed border-gray-200">
      <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}

export default function StepFive() {
  const dispatch = useDispatch();
  const data = useSelector(selectEventFormData);

  const preEventGames = data.activities?.preEvent?.games as any;
  const duringEventGames = data.activities?.duringEvent?.games as any;

  const hasGames = preEventGames || duringEventGames;

  const hasPrePrizes = preEventGames?.prizes?.length > 0;
  const hasDuringPrizes = duringEventGames?.prizes?.length > 0;
  const noPrizesConfigured = hasGames && !hasPrePrizes && !hasDuringPrizes;

  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Game Rewards Summary</h3>
        <p className="text-sm text-gray-500">
          Review the prizes configured for your event games
        </p>
      </div>

      {!hasGames ? (
        <EmptyState message="No games configured. Please go back to Step 4 to set up games." />
      ) : (
        <div className="flex flex-col gap-4">
          {hasPrePrizes && (
            <PrizeCard title="Pre-Event Game Prizes" games={preEventGames} />
          )}
          {hasDuringPrizes && (
            <PrizeCard
              title="Main Event Game Prizes"
              games={duringEventGames}
            />
          )}
          {noPrizesConfigured && (
            <EmptyState message="No prizes configured for the games." />
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(prevStep())}
          className="flex-1 h-11 rounded-lg border-gray-300 text-gray-700 hover:border-[#5B1A57] hover:text-[#5B1A57] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={() => dispatch(nextStep())}
          className="flex-1 h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
