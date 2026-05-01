"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trophy,
  Play,
  Clock,
  Users,
  Crown,
  Medal,
  HelpCircle,
  Puzzle,
  MessageSquare,
  Zap,
  ChevronRight,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameScoreShare } from "./game-share";
import { useRouter } from "next/navigation";
import { useGetGamesQuery } from "@/app/provider/api/eventApi";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";

interface Game {
  id: string;
  name: string;
  type: GameType;
  phase: "pre-event" | "main-event";
  status: "live" | "upcoming" | "ended";
  players: number;
  rounds: number;
  currentRound?: number;
}

interface EventGamesTabProps {
  event: any;
}

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-5 w-5" />,
  "word-puzzle": <Puzzle className="h-5 w-5" />,
  "two-truths": <MessageSquare className="h-5 w-5" />,
  "this-or-that": <Zap className="h-5 w-5" />,
};

const rankIcons = [
  <Crown className="h-4 w-4 text-amber-500" key={1} />,
  <Medal className="h-4 w-4 text-gray-400" key={2} />,
  <Medal className="h-4 w-4 text-amber-700" key={3} />,
];

export function EventGamesTab({ event }: EventGamesTabProps) {
  const { data:gameData } = useGetGamesQuery(event?.id);
  console.log("Event details in GamesTab:", gameData);

  const router = useRouter();
  const [activePhase, setActivePhase] = useState<
    "all" | "pre-event" | "main-event"
  >("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedLeaderboardEntry, setSelectedLeaderboardEntry] =
    useState<any>(null);

  // ✅ MAP YOUR REAL DATA
  const games: any[] =
  gameData && gameData?.data?.map((g: any) => ({
      id: g.id,
      name: g.title,
      type:
        g.rounds?.[0]?.gameType === "TRIVIA"
          ? "trivia"
          : g.rounds?.[0]?.gameType === "WORD_PUZZLE"
          ? "word-puzzle"
          : "trivia",
      phase: g.activityTiming === "DURING_EVENT" ? "main-event" : "pre-event",
      status:
        g.status === "PENDING"
          ? "upcoming"
          : g.status === "LIVE"
          ? "live"
          : "ended",
      players: g._count?.sessionEntries || 0,
      rounds: g.rounds?.length || 1,
      currentRound: 1,
    })) || [];

  const leaderboard: any[] = []; // (no leaderboard in your data yet)

  const filteredGames =
    activePhase === "all"
      ? games
      : games.filter((g) => g.phase === activePhase);

  const handlePlayGame = (game: Game) => {
    router.push(
      `/game?type=${game.type}&name=${encodeURIComponent(game.name)}`
    );
  };

  const handleShareScore = (entry: any) => {
    setSelectedLeaderboardEntry(entry);
    setShowShareModal(true);
  };

  const getStatusBadge = (status: Game["status"]) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-green-500 text-white animate-pulse">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white" />
            Live
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as any)}>
        <TabsList className="w-full grid grid-cols-3 h-10">
          <TabsTrigger value="all" className="text-xs">
            All Games
          </TabsTrigger>
          <TabsTrigger value="pre-event" className="text-xs">
            Pre-Event
          </TabsTrigger>
          <TabsTrigger value="main-event" className="text-xs">
            Main Event
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredGames.map((game) => (
          <Card
            key={game.id}
            className={cn(
              "overflow-hidden transition-all",
              game.status === "live" && "border-green-500/30 bg-green-500/5"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0",
                    game.status === "live"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {gameTypeIcons[game.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-foreground">
                      {game.name}
                    </h4>
                    {getStatusBadge(game.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {game.currentRound
                        ? `Round ${game.currentRound}/${game.rounds}`
                        : `${game.rounds} rounds`}
                    </span>
                    {game.status === "live" && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {game.players} playing
                      </span>
                    )}
                  </div>
                </div>
                {game.status === "live" ? (
                  <Button
                    size="sm"
                    className="rounded-full gap-1.5 bg-green-600 hover:bg-green-700"
                    onClick={() => handlePlayGame(game)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Play
                  </Button>
                ) : game.status === "upcoming" ? (
                  <Button size="sm" variant="outline" className="rounded-full">
                    Notify Me
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="rounded-full">
                    Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard stays unchanged but empty */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Leaderboard
          </h3>
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-600"
          >
            Pre-Event
          </Badge>
        </div>

        <Card>
          <CardContent className="p-0"></CardContent>
        </Card>

        <button className="mt-3 w-full text-center text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
          View Full Leaderboard <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Share Score</DialogTitle>
          </DialogHeader>
          {selectedLeaderboardEntry && (
            <GameScoreShare
              gameName="Event Games"
              score={selectedLeaderboardEntry.score}
              rank={selectedLeaderboardEntry.rank}
              totalPlayers={leaderboard.length}
              eventName="Pre-Event Challenge"
              onClose={() => setShowShareModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
