"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Gamepad2,
  Plus,
  Play,
  Trophy,
  HelpCircle,
  Puzzle,
  MessageSquare,
  Clock,
  Users,
  Zap,
  Coins,
  StopCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameCreationWizard } from "./game-creation-wizard";
import {
  useGetGamesQuery,
  useUpdateGameStatusMutation,
} from "@/app/provider/api/eventApi";
import { toast } from "sonner";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
type EventPhase = "pre-event" | "main-event" | "both";

interface GameProps {
  eventId: string;
  eventName: string;
  roundId?: string;
  eventStartsAt?: string; // ISO string — used to constrain game dates
}

// Raw API shape
interface ApiRound {
  id: string;
  gameSessionId: string;
  title: string;
  description: string;
  gameType: "TRIVIA" | "WORD_PUZZLE" | "TWO_TRUTHS" | "THIS_OR_THAT";
  config: {
    questions: {
      text: string;
      options: string[];
      correctIndex: number;
      timeLimitSecs: number;
    }[];
  };
  orderIndex: number;
  createdAt: string;
}

interface ApiRewardTier {
  id: string;
  gameSessionId: string;
  rank: number;
  type: "CASH" | "DISCOUNT" | "VOUCHER";
  title: string;
  description: string;
  value: string;
  discountType: string;
  discountValue: string;
  usageLimit: number;
  expiryDate: string;
  quantity: number;
}

interface ApiGame {
  id: string;
  eventId: string;
  title: string;
  scheduleType: string;
  repetitions: number;
  startsAt: string;
  endsAt: string;
  activityTiming: "DURING_EVENT" | "PRE_EVENT" | "BOTH";
  maxWinners: number;
  gameDuration: number;
  basePrice: string;
  perRoundPrice: string;
  priceCurrency: string;
  status: "PENDING" | "LIVE" | "ENDED";
  deletedAt: string | null;
  createdAt: string;
  rounds: ApiRound[];
  rewardTiers: ApiRewardTier[];
  _count: {
    sessionEntries: number;
  };
}

// Map API gameType string to local union
const mapGameType = (apiType: ApiRound["gameType"]): GameType => {
  const map: Record<ApiRound["gameType"], GameType> = {
    TRIVIA: "trivia",
    WORD_PUZZLE: "word-puzzle",
    TWO_TRUTHS: "two-truths",
    THIS_OR_THAT: "this-or-that",
  };
  return map[apiType] ?? "trivia";
};

// Map API activityTiming to EventPhase
const mapPhase = (timing: ApiGame["activityTiming"]): EventPhase => {
  const map: Record<ApiGame["activityTiming"], EventPhase> = {
    PRE_EVENT: "pre-event",
    DURING_EVENT: "main-event",
    BOTH: "both",
  };
  return map[timing] ?? "main-event";
};

// Map API status to component status
const mapStatus = (
  apiStatus: ApiGame["status"]
): "draft" | "live" | "ended" => {
  const map: Record<ApiGame["status"], "draft" | "live" | "ended"> = {
    PENDING: "draft",
    LIVE: "live",
    ENDED: "ended",
  };
  return map[apiStatus] ?? "draft";
};

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-4 w-4" />,
  "word-puzzle": <Puzzle className="h-4 w-4" />,
  "two-truths": <MessageSquare className="h-4 w-4" />,
  "this-or-that": <Zap className="h-4 w-4" />,
};

export function GamificationHubContent({ eventId, eventName, eventStartsAt }: GameProps) {
  const [activePhase, setActivePhase] = useState<
    "all" | "pre-event" | "main-event"
  >("all");
  const [isAddingGame, setIsAddingGame] = useState(false);

  const { data: gamesDetails, isLoading, isError } = useGetGamesQuery(eventId);

  const games: (ApiGame & {
    mappedType: GameType;
    mappedPhase: EventPhase;
    mappedStatus: "draft" | "live" | "ended";
  })[] = (gamesDetails ?? [])?.data?.map((game: ApiGame) => {
    const primaryRound = game.rounds[0];
    return {
      ...game,
      mappedType: primaryRound ? mapGameType(primaryRound.gameType) : "trivia",
      mappedPhase: mapPhase(game.activityTiming),
      mappedStatus: mapStatus(game.status),
    };
  });

  const filteredGames =
    activePhase === "all"
      ? games
      : games?.filter(
          (g) => g.mappedPhase === activePhase || g.mappedPhase === "both"
        );

  const [changeGameStatus, { isLoading: isChangeStatusLoading }] =
    useUpdateGameStatusMutation();

  const handleStartGame = async (roundId:string) => {
    try {
      await changeGameStatus({
        roundId: roundId ?? "",
        status: "ACTIVE",
      }).unwrap();

      toast.success("Game started");
    } catch {
      toast.error("Failed to start game");
    }
  };

  const handleEndGame = async (roundId:string) => {
    try {
      await changeGameStatus({
        roundId: roundId ?? "",
        status: "ENDED",
      }).unwrap();

      toast.success("Game ended");
    } catch {
      toast.error("Failed to end game");
    }
  };
  const getStatusBadge = (status: "draft" | "live" | "ended") => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            Live
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Pending</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
    }
  };

  const getPhaseBadge = (phase: EventPhase) => {
    switch (phase) {
      case "pre-event":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-600"
          >
            Pre-Event
          </Badge>
        );
      case "main-event":
        return (
          <Badge variant="outline" className="border-primary/50 text-primary">
            Main Event
          </Badge>
        );
      case "both":
        return (
          <Badge
            variant="outline"
            className="border-accent/50 text-accent-foreground"
          >
            Both
          </Badge>
        );
    }
  };

  const formatPrice = (basePrice: string, currency: string) => {
    const amount = parseFloat(basePrice);
    if (amount === 0) return "Free";
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatRewardValue = (value: string, currency: string) => {
    const amount = parseFloat(value);
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          size="sm"
          className="w-full gap-1.5 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => setIsAddingGame(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Game
        </Button>

        <Dialog open={isAddingGame} onOpenChange={setIsAddingGame}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
            </DialogHeader>
            <GameCreationWizard
              onComplete={() => setIsAddingGame(false)}
              onCancel={() => setIsAddingGame(false)}
              eventId={eventId}
              eventName={eventName}
              eventStartsAt={eventStartsAt}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activePhase}
        onValueChange={(v) =>
          setActivePhase(v as "all" | "pre-event" | "main-event")
        }
        className="mb-4"
      >
        <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2">
          <TabsTrigger
            value="all"
            className="rounded-full data-[state=active]:bg-[#531342] data-[state=active]:text-primary-foreground"
          >
            All Games
          </TabsTrigger>
          <TabsTrigger
            value="pre-event"
            className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Pre-Event
          </TabsTrigger>
          <TabsTrigger
            value="main-event"
            className="rounded-full data-[state=active]:bg-[#531342] data-[state=active]:text-primary-foreground"
          >
            Main Event
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          Loading games...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-8 text-sm text-destructive">
          Failed to load games. Please try again.
        </div>
      )}

      {!isLoading && !isError && filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No games yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add your first game to engage attendees
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGames?.map((game) => {
            const topReward = game?.rewardTiers.find((r) => r.rank === 1);
            const entryCount = game?._count.sessionEntries;

            return (
              <div
                key={game.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-all",
                  game.mappedStatus === "live"
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    game.mappedStatus === "live"
                      ? "bg-green-500/10"
                      : "bg-muted"
                  )}
                >
                  {gameTypeIcons[game.mappedType]}
                </div>

                <div className="flex justify-between w-full">
                  <div className="">
                    {" "}
                    <div className="flex items-center gap-2 ">
                      <h4 className="font-medium text-sm truncate">
                        {game.title}
                      </h4>
                      {getStatusBadge(game.mappedStatus)}
                      {getPhaseBadge(game.mappedPhase)}
                    </div>
                    <div className="flex flex-col gap-3 mt-1 text-xs text-muted-foreground ">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {game.rounds.length} round
                          {game.rounds.length !== 1 ? "s" : ""}
                        </span>

                        {entryCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {entryCount} entr{entryCount === 1 ? "y" : "ies"}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {formatPrice(game.basePrice, game.priceCurrency)}
                        </span>
                      </div>
                      {topReward && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-amber-600">
                            <Trophy className="h-3 w-3" />
                            {formatRewardValue(
                              topReward.value,
                              game.priceCurrency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {game.mappedStatus === "live" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={isChangeStatusLoading}
                      onClick={()=>handleEndGame(game.rounds?.[0]?.id)}
                    >
                      {isChangeStatusLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <StopCircle className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  ) : game.mappedStatus === "draft" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-green-600"
                      disabled={isChangeStatusLoading}
                      onClick={()=>handleStartGame(game.rounds?.[0]?.id)}
                    >
                      {isChangeStatusLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {games?.some((g) => g.mappedStatus === "live") && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Live Leaderboards
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-amber-500/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Pre-Event Top</p>
              <p className="font-semibold text-sm mt-1">—</p>
              <p className="text-lg font-bold text-amber-600">No data</p>
            </div>
            <div className="rounded-lg bg-[#531342]/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Main Event Top</p>
              <p className="font-semibold text-sm mt-1">—</p>
              <p className="text-lg font-bold text-primary">No data</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
