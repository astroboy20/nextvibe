import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Gamepad2, 
  Plus, 
  Play, 
  Pause, 
  Trophy, 
  HelpCircle,
  Puzzle,
  MessageSquare,
  MoreVertical,
  Clock,
  Users,
  Zap,
  Calendar,
  Sparkles,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameCreationWizard } from "./game-creation-wizard";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
type EventPhase = "pre-event" | "main-event" | "both";
type ScheduleMode = "daily" | "weekly" | "concurrent";

interface Game {
  id: string;
  name: string;
  type: GameType;
  phase: EventPhase;
  rounds: number;
  status: "draft" | "live" | "ended";
  players: number;
  scheduleMode?: ScheduleMode;
  contentMode?: "ai" | "manual";
}

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  "trivia": <HelpCircle className="h-4 w-4" />,
  "word-puzzle": <Puzzle className="h-4 w-4" />,
  "two-truths": <MessageSquare className="h-4 w-4" />,
  "this-or-that": <Zap className="h-4 w-4" />,
};

const gameTypeLabels: Record<GameType, string> = {
  "trivia": "Trivia",
  "word-puzzle": "Word Puzzle",
  "two-truths": "2 Truths & 1 Lie",
  "this-or-that": "This or That",
};

const mockGames: Game[] = [
  { id: "1", name: "Birthday Trivia", type: "trivia", phase: "pre-event", rounds: 3, status: "live", players: 42, scheduleMode: "concurrent", contentMode: "ai" },
  { id: "2", name: "Party Word Hunt", type: "word-puzzle", phase: "main-event", rounds: 1, status: "draft", players: 0, scheduleMode: "daily", contentMode: "manual" },
  { id: "3", name: "Know the Host", type: "two-truths", phase: "both", rounds: 5, status: "live", players: 28, scheduleMode: "weekly", contentMode: "ai" },
];

export function GamificationHubContent() {
  const [games, setGames] = useState<Game[]>(mockGames);
  const [activePhase, setActivePhase] = useState<"all" | "pre-event" | "main-event">("all");
  const [isAddingGame, setIsAddingGame] = useState(false);

  const filteredGames = activePhase === "all" 
    ? games 
    : games.filter(g => g.phase === activePhase || g.phase === "both");

  const handleGameCreated = (gameData: {
    name: string;
    type: GameType;
    phase: EventPhase;
    rounds: number;
    scheduleMode: ScheduleMode;
    contentMode: "ai" | "manual";
  }) => {
    const newGame: Game = {
      id: `game-${Date.now()}`,
      name: gameData.name,
      type: gameData.type,
      phase: gameData.phase,
      rounds: gameData.rounds,
      status: "draft",
      players: 0,
      scheduleMode: gameData.scheduleMode,
      contentMode: gameData.contentMode,
    };
    setGames(prev => [...prev, newGame]);
    setIsAddingGame(false);
  };

  const getStatusBadge = (status: Game["status"]) => {
    switch (status) {
      case "live":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Live</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
    }
  };

  const getPhaseBadge = (phase: EventPhase) => {
    switch (phase) {
      case "pre-event":
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600">Pre-Event</Badge>;
      case "main-event":
        return <Badge variant="outline" className="border-primary/50 text-primary">Main Event</Badge>;
      case "both":
        return <Badge variant="outline" className="border-accent/50 text-accent-foreground">Both</Badge>;
    }
  };

  const getScheduleBadge = (mode?: ScheduleMode) => {
    if (!mode) return null;
    const config = {
      daily: { icon: <Calendar className="h-3 w-3" />, label: "Daily" },
      weekly: { icon: <Calendar className="h-3 w-3" />, label: "Weekly" },
      concurrent: { icon: <Play className="h-3 w-3" />, label: "Always On" },
    };
    return (
      <Badge variant="outline" className="text-xs gap-1">
        {config[mode].icon}
        {config[mode].label}
      </Badge>
    );
  };

  return (
    <div>
      {/* Add Game Button */}
      <div className="mb-4">
        <Button 
          size="sm" 
          className="w-full gap-1.5 rounded-xl"
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
              onComplete={handleGameCreated}
              onCancel={() => setIsAddingGame(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Phase Filter */}
      <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as any)} className="mb-4">
        <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2">
          <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All Games
          </TabsTrigger>
          <TabsTrigger value="pre-event" className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            Pre-Event
          </TabsTrigger>
          <TabsTrigger value="main-event" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Main Event
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Games List */}
      {filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No games yet</p>
          <p className="text-xs text-muted-foreground">Add your first game to engage attendees</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGames.map((game) => (
            <div 
              key={game.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-all",
                game.status === "live" ? "border-green-500/30 bg-green-500/5" : "border-border"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                game.status === "live" ? "bg-green-500/10" : "bg-muted"
              )}>
                {gameTypeIcons[game.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm truncate">{game.name}</h4>
                  {getStatusBadge(game.status)}
                  {getPhaseBadge(game.phase)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {game.rounds} round{game.rounds > 1 ? "s" : ""}
                  </span>
                  {game.status === "live" && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {game.players} playing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {game.status === "live" ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : game.status === "draft" ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-green-600">
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Preview */}
      {games.some(g => g.status === "live") && (
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
              <p className="font-semibold text-sm mt-1">@chioma_vibes</p>
              <p className="text-lg font-bold text-amber-600">2,450 pts</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Main Event Top</p>
              <p className="font-semibold text-sm mt-1">@tunde_party</p>
              <p className="text-lg font-bold text-primary">1,890 pts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
