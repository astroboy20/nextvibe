"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-5 w-5" />,
  "word-puzzle": <Puzzle className="h-5 w-5" />,
  "two-truths": <MessageSquare className="h-5 w-5" />,
  "this-or-that": <Zap className="h-5 w-5" />,
};

const mockGames: Game[] = [
  {
    id: "1",
    name: "Birthday Trivia",
    type: "trivia",
    phase: "pre-event",
    status: "live",
    players: 42,
    rounds: 3,
    currentRound: 2,
  },
  {
    id: "2",
    name: "Party Word Hunt",
    type: "word-puzzle",
    phase: "main-event",
    status: "upcoming",
    players: 0,
    rounds: 1,
  },
  {
    id: "3",
    name: "Know the Host",
    type: "two-truths",
    phase: "pre-event",
    status: "live",
    players: 28,
    rounds: 5,
    currentRound: 3,
  },
  {
    id: "4",
    name: "This or That: Party Edition",
    type: "this-or-that",
    phase: "main-event",
    status: "upcoming",
    players: 0,
    rounds: 10,
  },
];

const preEventLeaderboard = [
  {
    rank: 1,
    username: "@chioma_vibes",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    score: 2450,
  },
  {
    rank: 2,
    username: "@tunde_life",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    score: 2180,
  },
  {
    rank: 3,
    username: "@ngozi_party",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    score: 1950,
  },
  {
    rank: 4,
    username: "@ade_vibes",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    score: 1720,
  },
  {
    rank: 5,
    username: "@funke_lagos",
    avatar:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a8bb?w=100&h=100&fit=crop&crop=face",
    score: 1580,
  },
];

const rankIcons = [
  <Crown className="h-4 w-4 text-amber-500" key={1}/>,
  <Medal className="h-4 w-4 text-gray-400" key={2}/>,
  <Medal className="h-4 w-4 text-amber-700" key={3}/>,
];

export function EventGamesTab() {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState<
    "all" | "pre-event" | "main-event"
  >("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedLeaderboardEntry, setSelectedLeaderboardEntry] = useState<
    (typeof preEventLeaderboard)[0] | null
  >(null);

  const filteredGames =
    activePhase === "all"
      ? mockGames
      : mockGames.filter((g) => g.phase === activePhase);

  const handlePlayGame = (game: Game) => {
    router.push(
      `/game?type=${game.type}&name=${encodeURIComponent(game.name)}`
    );
  };

  const handleShareScore = (entry: (typeof preEventLeaderboard)[0]) => {
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
      {/* Phase Filter */}
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

      {/* Games List */}
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

      {/* Leaderboard */}
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
          <CardContent className="p-0">
            {preEventLeaderboard.map((player, index) => (
              <div
                key={player.rank}
                className={cn(
                  "flex items-center gap-3 p-3",
                  index !== preEventLeaderboard.length - 1 &&
                    "border-b border-border",
                  index === 0 && "bg-amber-500/5"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {index < 3 ? (
                    rankIcons[index]
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {player.rank}
                    </span>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.username.charAt(1)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium text-sm">
                  {player.username}
                </span>
                <span className="font-display font-bold text-foreground">
                  {player.score.toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleShareScore(player)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <button className="mt-3 w-full text-center text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
          View Full Leaderboard <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Share Score Modal */}
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
              totalPlayers={preEventLeaderboard.length}
              eventName="Pre-Event Challenge"
              onClose={() => setShowShareModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
