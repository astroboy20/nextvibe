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
  Gamepad2, Plus, Play, Trophy, HelpCircle, Puzzle,
  MessageSquare, Clock, Users, Zap, Coins, StopCircle,
  Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameCreationWizard } from "./game-creation-wizard";
import {
  useGetGamesQuery,
  useUpdateGameStatusMutation,
  useUpdateRoundStatusMutation,
  useGetSessionLeaderboardQuery,
} from "@/app/provider/api/eventApi";
import { toast } from "sonner";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
type EventPhase = "pre-event" | "main-event" | "post-event" | "both";

interface GameProps {
  eventId: string;
  eventName: string;
  roundId?: string;
  eventStartsAt?: string;
}

const mapGameType = (t: string): GameType => ({
  TRIVIA: "trivia", WORD_PUZZLE: "word-puzzle",
  TWO_TRUTHS: "two-truths", THIS_OR_THAT: "this-or-that",
}[t] ?? "trivia") as GameType;

const mapPhase = (t: string): EventPhase => ({
  PRE_EVENT: "pre-event", DURING_EVENT: "main-event",
  POST_EVENT: "post-event", BOTH: "both",
}[t] ?? "main-event") as EventPhase;

const mapStatus = (s: string) => ({ PENDING: "pending", ACTIVE: "live", ENDED: "ended" }[s] ?? "pending") as "pending" | "live" | "ended";

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-4 w-4" />,
  "word-puzzle": <Puzzle className="h-4 w-4" />,
  "two-truths": <MessageSquare className="h-4 w-4" />,
  "this-or-that": <Zap className="h-4 w-4" />,
};

function StatusBadge({ status }: { status: "pending" | "live" | "ended" }) {
  if (status === "live") return <Badge className="bg-green-500/10 text-green-600">Live</Badge>;
  if (status === "ended") return <Badge variant="outline">Ended</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function PhaseBadge({ phase }: { phase: EventPhase }) {
  const map: Record<EventPhase, { label: string; className: string }> = {
    "pre-event":  { label: "Pre-Event",  className: "border-amber-500/50 text-amber-600" },
    "main-event": { label: "Main Event", className: "border-primary/50 text-primary" },
    "post-event": { label: "Post-Event", className: "border-blue-500/50 text-blue-600" },
    both:         { label: "Both",       className: "border-accent/50 text-accent-foreground" },
  };
  const { label, className } = map[phase];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

/** Leaderboard panel for a single session */
function SessionLeaderboard({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = useGetSessionLeaderboardQuery(sessionId);

  // API shape: { data: { sessionId, status, entries: [], myEntry } }
  const entries: any[] = data?.data?.entries ?? data?.data ?? [];
  const myEntry: any = data?.data?.myEntry ?? null;

  if (isLoading) return (
    <div className="py-4 text-center">
      <Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" />
    </div>
  );

  if (!entries.length) return (
    <div className="flex flex-col items-center justify-center py-5 gap-1.5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Trophy className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">No entries yet</p>
      <p className="text-xs text-muted-foreground/60">Scores will appear here once players submit answers</p>
    </div>
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-1.5 mt-2">
      {entries.slice(0, 5).map((e: any, i: number) => {
        const isMe = myEntry && e.user?.id === myEntry.user?.id;
        return (
          <div
            key={e.user?.id ?? i}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs",
              isMe
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/50"
            )}
          >
            <span className="w-5 text-center shrink-0 text-sm">
              {medals[i] ?? <span className="text-muted-foreground font-medium">#{i + 1}</span>}
            </span>
            <span className="flex-1 font-medium truncate">
              {e.user?.displayName ?? e.user?.username ?? "Player"}
              {isMe && <span className="ml-1 text-primary text-[10px]">(you)</span>}
            </span>
            <span className="font-bold text-primary shrink-0">{e.totalScore ?? 0} pts</span>
          </div>
        );
      })}
    </div>
  );
}

export function GamificationHubContent({ eventId, eventName, eventStartsAt }: GameProps) {
  const [activePhase, setActivePhase] = useState<"all" | "pre-event" | "main-event" | "post-event">("all");
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const { data: gamesDetails, isLoading, isError } = useGetGamesQuery(eventId);
  const [updateSessionStatus, { isLoading: isUpdatingSession }] = useUpdateGameStatusMutation();
  const [updateRoundStatus, { isLoading: isUpdatingRound }] = useUpdateRoundStatusMutation();

  const games = (gamesDetails?.data ?? []).map((game: any) => ({
    ...game,
    mappedType: mapGameType(game.rounds?.[0]?.gameType ?? "TRIVIA"),
    mappedPhase: mapPhase(game.activityTiming),
    mappedStatus: mapStatus(game.status),
  }));

  const filteredGames = activePhase === "all"
    ? games
    : games.filter((g: any) => g.mappedPhase === activePhase || g.mappedPhase === "both");

  const handleSessionAction = async (sessionId: string, action: "ACTIVE" | "ENDED") => {
    try {
      await updateSessionStatus({ roundId: sessionId, status: action }).unwrap();
      toast.success(action === "ACTIVE" ? "Session started — players can now join!" : "Session ended.");
    } catch {
      toast.error("Failed to update session status.");
    }
  };

  const handleRoundAction = async (roundId: string, action: "ACTIVE" | "ENDED") => {
    try {
      await updateRoundStatus({ roundId, status: action }).unwrap();
      toast.success(action === "ACTIVE" ? "Round started — players can now submit!" : "Round ended.");
    } catch {
      toast.error("Failed to update round status.");
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const n = parseFloat(price);
    return n === 0 ? "Free" : `${currency} ${n.toLocaleString()}`;
  };

  return (
    <div>
      {/* Add Game */}
      <div className="mb-4">
        <Button
          size="sm"
          className="w-full gap-1.5 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => setIsAddingGame(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Game Session
        </Button>

        <Dialog open={isAddingGame} onOpenChange={setIsAddingGame}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Game Session</DialogTitle>
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

      {/* Phase filter */}
      <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as any)} className="mb-4">
        <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2 flex-wrap">
          {(["all", "pre-event", "main-event", "post-event"] as const).map((p) => (
            <TabsTrigger
              key={p}
              value={p}
              className="rounded-full data-[state=active]:bg-[#531342] data-[state=active]:text-white capitalize"
            >
              {p === "all" ? "All" : p.replace("-", " ")}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading sessions...
        </div>
      )}

      {isError && (
        <p className="text-center py-8 text-sm text-destructive">Failed to load games.</p>
      )}

      {!isLoading && !isError && filteredGames.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No game sessions yet</p>
          <p className="text-xs text-muted-foreground">Add a session to engage attendees</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredGames.map((game: any) => {
          const isExpanded = expandedSession === game.id;
          const topReward = game.rewardTiers?.find((r: any) => r.rank === 1);

          return (
            <div
              key={game.id}
              className={cn(
                "rounded-xl border overflow-hidden transition-all",
                game.mappedStatus === "live" ? "border-green-500/30 bg-green-500/5" : "border-border"
              )}
            >
              {/* Session header row */}
              <div className="flex items-start gap-3 p-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5",
                  game.mappedStatus === "live" ? "bg-green-500/10" : "bg-muted"
                )}>
                  {gameTypeIcons[game.mappedType as GameType]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h4 className="font-semibold text-sm truncate">{game.title}</h4>
                    <StatusBadge status={game.mappedStatus} />
                  </div>
                  <PhaseBadge phase={game.mappedPhase} />
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {game.rounds?.length ?? 0} round{game.rounds?.length !== 1 ? "s" : ""}
                    </span>
                    {game._count?.sessionEntries > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {game._count.sessionEntries} joined
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {formatPrice(game.basePrice, game.priceCurrency)}
                    </span>
                    {topReward && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Trophy className="h-3 w-3" />
                        {formatPrice(topReward.value, game.priceCurrency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Session-level controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {game.mappedStatus === "pending" && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs"
                      disabled={isUpdatingSession}
                      onClick={() => handleSessionAction(game.id, "ACTIVE")}
                    >
                      {isUpdatingSession ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      Start
                    </Button>
                  )}
                  {game.mappedStatus === "live" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 rounded-full border-red-500/50 text-red-500 text-xs"
                      disabled={isUpdatingSession}
                      onClick={() => handleSessionAction(game.id, "ENDED")}
                    >
                      {isUpdatingSession ? <Loader2 className="h-3 w-3 animate-spin" /> : <StopCircle className="h-3 w-3" />}
                      End
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setExpandedSession(isExpanded ? null : game.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded: rounds + leaderboard */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">

                  {/* Rounds */}
                  {game.rounds?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rounds</p>
                      {game.rounds.map((round: any, idx: number) => {
                        const roundStatus = mapStatus(round.status ?? "PENDING");
                        return (
                          <div key={round.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                            <div>
                              <p className="text-sm font-medium">Round {idx + 1}: {round.title}</p>
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">{round.gameType?.toLowerCase().replace("_", " ")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={roundStatus} />
                              {roundStatus === "pending" && game.mappedStatus === "live" && (
                                <Button
                                  size="sm"
                                  className="h-7 gap-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs"
                                  disabled={isUpdatingRound}
                                  onClick={() => handleRoundAction(round.id, "ACTIVE")}
                                >
                                  <Play className="h-3 w-3" /> Start
                                </Button>
                              )}
                              {roundStatus === "live" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 gap-1 rounded-full border-red-500/50 text-red-500 text-xs"
                                  disabled={isUpdatingRound}
                                  onClick={() => handleRoundAction(round.id, "ENDED")}
                                >
                                  <StopCircle className="h-3 w-3" /> End
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Leaderboard */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Trophy className="h-3 w-3 text-amber-500" /> Leaderboard
                    </p>
                    <SessionLeaderboard sessionId={game.id} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
