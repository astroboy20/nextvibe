"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  StopCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  Edit2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameCreationWizard } from "./game-creation-wizard";
import {
  useGetGamesQuery,
  useUpdateGameStatusMutation,
  useUpdateRoundStatusMutation,
  useGetSessionLeaderboardQuery,
  useGetGameSessionEditPolicyQuery,
  useUpdateGameSessionMutation,
} from "@/app/provider/api/eventApi";
import { useInitiateAdditionalGamePaymentMutation } from "@/app/provider/api/organizerPaymentApi";
import { toast } from "sonner";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
type EventPhase = "pre-event" | "main-event" | "post-event" | "both";

interface GameProps {
  eventId: string;
  eventName: string;
  roundId?: string;
  eventStartsAt?: string;
  eventStatus?: string;
  hasPayment?: boolean;
  eventPlan?: {
    gamesIncluded: number;
    gamesUsed: number;
    vibetagsEnabled: boolean;
    vibetagPhases: string[];
    slotsRemaining: number;
    isQuotaExhausted: boolean;
  } | null;
}

const mapGameType = (t: string): GameType =>
  (({
    TRIVIA: "trivia",
    WORD_PUZZLE: "word-puzzle",
    TWO_TRUTHS: "two-truths",
    THIS_OR_THAT: "this-or-that",
  }[t] ?? "trivia") as GameType);

const mapPhase = (t: string): EventPhase =>
  (({
    PRE_EVENT: "pre-event",
    DURING_EVENT: "main-event",
    POST_EVENT: "post-event",
    BOTH: "both",
  }[t] ?? "main-event") as EventPhase);

const mapStatus = (s: string) =>
  (({ PENDING: "pending", ACTIVE: "live", ENDED: "ended" }[s] ?? "pending") as
    | "pending"
    | "live"
    | "ended");

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-4 w-4" />,
  "word-puzzle": <Puzzle className="h-4 w-4" />,
  "two-truths": <MessageSquare className="h-4 w-4" />,
  "this-or-that": <Zap className="h-4 w-4" />,
};

function StatusBadge({ status }: { status: "pending" | "live" | "ended" }) {
  if (status === "live")
    return <Badge className="bg-green-500/10 text-green-600">Live</Badge>;
  if (status === "ended") return <Badge variant="outline">Ended</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function PhaseBadge({ phase }: { phase: EventPhase }) {
  const map: Record<EventPhase, { label: string; className: string }> = {
    "pre-event": {
      label: "Pre-Event",
      className: "border-amber-500/50 text-amber-600",
    },
    "main-event": {
      label: "Main Event",
      className: "border-primary/50 text-primary",
    },
    "post-event": {
      label: "Post-Event",
      className: "border-blue-500/50 text-blue-600",
    },
    both: {
      label: "Both",
      className: "border-accent/50 text-accent-foreground",
    },
  };
  const { label, className } = map[phase];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

/**
 * Edit-policy-aware dialog for editing a game session's title/settings.
 * Fetches GET /game-sessions/:id/edit-policy on mount.
 * If editable: false — shows read-only banner. Always shows the disclaimer.
 */
function EditGameSessionDialog({
  session,
  open,
  onOpenChange,
  isPaymentLocked,
}: {
  session: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPaymentLocked: boolean;
}) {
  const { data: policyData, isLoading: isPolicyLoading } =
    useGetGameSessionEditPolicyQuery(session.id, { skip: !open });
  const [updateGameSession, { isLoading: isSaving }] =
    useUpdateGameSessionMutation();

  const policy = policyData as { editable: boolean; reason?: string } | undefined;
  // Locked if payment has been made (client-side) OR backend says not editable
  const isEditable =
    !isPaymentLocked &&
    !isPolicyLoading &&
    (policy?.editable !== false);

  const [title, setTitle] = useState(session.title ?? "");
  const [maxWinners, setMaxWinners] = useState<string>(
    String(session.maxWinners ?? "")
  );
  const [gameDuration, setGameDuration] = useState<string>(
    String(session.gameDuration ?? "")
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(session.title ?? "");
      setMaxWinners(String(session.maxWinners ?? ""));
      setGameDuration(String(session.gameDuration ?? ""));
    }
  }, [open, session]);

  const handleSave = async () => {
    try {
      const data: Record<string, any> = {};
      if (title.trim()) data.title = title.trim();
      if (maxWinners) data.maxWinners = Number(maxWinners);
      if (gameDuration) data.gameDuration = Number(gameDuration);

      await updateGameSession({ sessionId: session.id, data }).unwrap();
      toast.success("Game session updated.");
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.data?.message ?? "Failed to update game session.";
      // Show the lock message defensively (could have become locked between load and save)
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Game Session
          </DialogTitle>
        </DialogHeader>

        {isPolicyLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Always-visible disclaimer */}
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
              <p>Games cannot be edited after payment has been made.</p>
            </div>

            {/* Lock banner — payment lock takes priority, then API policy */}
            {isPaymentLocked ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-700">
                <LockKeyhole className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <p>Games cannot be edited after payment has been made.</p>
              </div>
            ) : !isEditable && policy?.reason ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-700">
                <LockKeyhole className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <p>{policy.reason}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="gs-title">Title</Label>
              <Input
                id="gs-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isEditable}
                placeholder="Session title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gs-max-winners">Max Winners</Label>
                <Input
                  id="gs-max-winners"
                  type="number"
                  min={1}
                  value={maxWinners}
                  onChange={(e) => setMaxWinners(e.target.value)}
                  disabled={!isEditable}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gs-duration">Duration (min)</Label>
                <Input
                  id="gs-duration"
                  type="number"
                  min={1}
                  value={gameDuration}
                  onChange={(e) => setGameDuration(e.target.value)}
                  disabled={!isEditable}
                  placeholder="e.g. 45"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#531342] hover:bg-[#531342]/90 text-white"
                disabled={!isEditable || isSaving}
                onClick={handleSave}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Leaderboard panel for a single session */
function SessionLeaderboard({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = useGetSessionLeaderboardQuery(sessionId);

  // API shape: { data: { sessionId, status, entries: [], myEntry } }
  const entries: any[] = data?.data?.entries ?? data?.data ?? [];
  const myEntry: any = data?.data?.myEntry ?? null;

  if (isLoading)
    return (
      <div className="py-4 text-center">
        <Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" />
      </div>
    );

  if (!entries.length)
    return (
      <div className="flex flex-col items-center justify-center py-5 gap-1.5 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Trophy className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No entries yet
        </p>
        <p className="text-xs text-muted-foreground/60">
          Scores will appear here once players submit answers
        </p>
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
              isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
            )}
          >
            <span className="w-5 text-center shrink-0 text-sm">
              {medals[i] ?? (
                <span className="text-muted-foreground font-medium">
                  #{i + 1}
                </span>
              )}
            </span>
            <span className="flex-1 font-medium truncate">
              {e.user?.displayName ?? e.user?.username ?? "Player"}
              {isMe && (
                <span className="ml-1 text-primary text-[10px]">(you)</span>
              )}
            </span>
            <span className="font-bold text-primary shrink-0">
              {e.totalScore ?? 0} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function GamificationHubContent({
  eventId,
  eventName,
  eventStartsAt,
  eventStatus,
  eventPlan,
  hasPayment = false,
}: GameProps) {
  const [activePhase, setActivePhase] = useState<
    "all" | "pre-event" | "main-event" | "post-event"
  >("all");
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [unlockingGameId, setUnlockingGameId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const dispatch = useDispatch();

  const openDialog = () => {
    dispatch(setHideHeader(true));
    setIsAddingGame(true);
  };
  const closeDialog = () => {
    dispatch(setHideHeader(false));
    setIsAddingGame(false);
  };

  const { data: gamesDetails, isLoading, isError } = useGetGamesQuery(eventId);
  const [updateSessionStatus, { isLoading: isUpdatingSession }] =
    useUpdateGameStatusMutation();
  const [updateRoundStatus, { isLoading: isUpdatingRound }] =
    useUpdateRoundStatusMutation();
  const [initiateAdditionalGamePayment, { isLoading: isUnlocking }] =
    useInitiateAdditionalGamePaymentMutation();

  const games = (gamesDetails?.data ?? []).map((game: any, index: number) => ({
    ...game,
    mappedType: mapGameType(game.rounds?.[0]?.gameType ?? "TRIVIA"),
    mappedPhase: mapPhase(game.activityTiming),
    mappedStatus: mapStatus(game.status),
    // A game is locked when the event has a plan and this game's position
    // exceeds the included quota. Games are ordered by creation (index).
    isLocked:
      eventPlan != null &&
      index >= (eventPlan.gamesIncluded ?? Infinity) &&
      game.status === "PENDING",
  }));

  const filteredGames =
    activePhase === "all"
      ? games
      : games.filter(
          (g: any) => g.mappedPhase === activePhase || g.mappedPhase === "both"
        );

  const handleSessionAction = async (
    sessionId: string,
    action: "ACTIVE" | "ENDED"
  ) => {
    try {
      await updateSessionStatus({
        roundId: sessionId,
        status: action,
      }).unwrap();
      toast.success(
        action === "ACTIVE"
          ? "Session started — players can now join!"
          : "Session ended."
      );
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.data?.error?.message ?? "Failed to update session status."
      );
    }
  };

  const handleRoundAction = async (
    roundId: string,
    action: "ACTIVE" | "ENDED"
  ) => {
    try {
      await updateRoundStatus({ roundId, status: action }).unwrap();
      toast.success(
        action === "ACTIVE"
          ? "Round started — players can now submit!"
          : "Round ended."
      );
    } catch {
      toast.error("Failed to update round status.");
    }
  };

  const handleUnlockGame = async (
    gameSessionId: string,
    withCoupon?: string
  ) => {
    try {
      const res = await initiateAdditionalGamePayment({
        eventId,
        gameSessionId,
        ...(withCoupon ? { couponCode: withCoupon } : {}),
      }).unwrap();

      const { status, checkoutUrl } = res.data;

      if (status === "COMPLETED" || !checkoutUrl) {
        toast.success("Game unlocked! Activating session…");
        setShowUnlockDialog(false);
        const unlockedId = unlockingGameId;
        setUnlockingGameId(null);
        setCouponCode("");
        // Automatically set the session to ACTIVE now that it's unlocked
        if (unlockedId) await handleSessionAction(unlockedId, "ACTIVE");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to initiate unlock payment.");
    }
  };

  const openUnlockDialog = (gameId: string) => {
    setUnlockingGameId(gameId);
    setShowUnlockDialog(true);
  };

  const formatPrice = (price: string, currency: string) => {
    const n = parseFloat(price);
    return n === 0 ? "Free" : `${currency} ${n.toLocaleString()}`;
  };

  return (
    <div>
      {/* Permanent disclaimer — always visible */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 mb-4 text-xs text-amber-700">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p>Games cannot be edited after payment has been made.</p>
      </div>

      {/* Add Game */}
      <div className="mb-4">
        <Button
          size="sm"
          className="w-full gap-1.5 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => openDialog()}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Game Session
        </Button>

        <Dialog
          open={isAddingGame}
          onOpenChange={(open) => {
            if (!open) {
              if (typeof window !== "undefined")
                sessionStorage.removeItem("gameWizardState");
              closeDialog();
            } else {
              openDialog();
            }
          }}
        >
          <DialogContent className="w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Game Session</DialogTitle>
            </DialogHeader>
            {/* key forces full remount every time dialog opens — no stale state */}
            {isAddingGame && (
              <GameCreationWizard
                key={String(isAddingGame)}
                onComplete={() => closeDialog()}
                onCancel={() => closeDialog()}
                eventId={eventId}
                eventName={eventName}
                eventStartsAt={eventStartsAt}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan quota info */}
      {eventPlan != null && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-2 mb-4 text-xs flex-wrap",
          eventPlan.isQuotaExhausted
            ? "border-amber-500/40 bg-amber-500/5 text-amber-700"
            : "border-border bg-muted/40 text-muted-foreground"
        )}>
          <Gamepad2 className="h-3 w-3 shrink-0" />
          <span>
            Plan:{" "}
            <span className="font-semibold text-foreground">
              {eventPlan.gamesUsed}/{eventPlan.gamesIncluded}
            </span>{" "}
            game slots used
          </span>
          <span className="text-border">·</span>
          {eventPlan.isQuotaExhausted ? (
            <span className="flex items-center gap-1 font-medium">
              <LockKeyhole className="h-3 w-3 shrink-0" />
              Quota full — new sessions need payment
            </span>
          ) : (
            <span className="font-medium text-green-600">
              {eventPlan.slotsRemaining} slot{eventPlan.slotsRemaining !== 1 ? "s" : ""} remaining
            </span>
          )}
        </div>
      )}

      {/* Phase filter */}
      <Tabs
        value={activePhase}
        onValueChange={(v) => setActivePhase(v as any)}
        className="mb-4"
      >
        <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2 flex-wrap">
          {(["all", "pre-event", "main-event", "post-event"] as const).map(
            (p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="rounded-full data-[state=active]:bg-[#531342] data-[state=active]:text-white capitalize"
              >
                {p === "all" ? "All" : p.replace("-", " ")}
              </TabsTrigger>
            )
          )}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading sessions...
        </div>
      )}

      {isError && (
        <p className="text-center py-8 text-sm text-destructive">
          Failed to load games.
        </p>
      )}

      {!isLoading && !isError && filteredGames.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No game sessions yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add a session to engage attendees
          </p>
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
                game.mappedStatus === "live"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border"
              )}
            >
              {/* Session header row */}
              <div className="flex items-start gap-3 p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5",
                    game.mappedStatus === "live"
                      ? "bg-green-500/10"
                      : "bg-muted"
                  )}
                >
                  {gameTypeIcons[game.mappedType as GameType]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h4 className="font-semibold text-sm truncate">
                      {game.title}
                    </h4>
                    <StatusBadge status={game.mappedStatus} />
                    {game.isLocked && (
                      <Badge variant="outline" className="border-amber-500/50 text-amber-600 gap-1 text-[10px]">
                        <LockKeyhole className="h-2.5 w-2.5" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <PhaseBadge phase={game.mappedPhase} />
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {game.rounds?.length ?? 0} round
                      {game.rounds?.length !== 1 ? "s" : ""}
                    </span>
                    {game._count?.sessionEntries > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {game._count.sessionEntries} joined
                      </span>
                    )}

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
                  {/* Edit button — only for pending sessions with no payment yet */}
                  {game.mappedStatus === "pending" && !hasPayment && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      title="Edit session"
                      onClick={() => setEditingSession(game)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {game.mappedStatus === "pending" && (
                    <>
                      {game.isLocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 rounded-full border-amber-500/50 text-amber-600 text-xs"
                          disabled={isUnlocking}
                          onClick={() => openUnlockDialog(game.id)}
                        >
                          {isUnlocking ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <LockKeyhole className="h-3 w-3" />
                          )}
                          Unlock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 gap-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs"
                          disabled={isUpdatingSession}
                          onClick={() => handleSessionAction(game.id, "ACTIVE")}
                        >
                          {isUpdatingSession ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          Start
                        </Button>
                      )}
                    </>
                  )}
                  {game.mappedStatus === "live" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 rounded-full border-red-500/50 text-red-500 text-xs"
                      disabled={isUpdatingSession}
                      onClick={() => handleSessionAction(game.id, "ENDED")}
                    >
                      {isUpdatingSession ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <StopCircle className="h-3 w-3" />
                      )}
                      End
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      setExpandedSession(isExpanded ? null : game.id)
                    }
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded: rounds + leaderboard */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                  {/* Rounds */}
                  {game.rounds?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Rounds
                      </p>
                      {game.rounds.map((round: any, idx: number) => {
                        const roundStatus = mapStatus(
                          round.status ?? "PENDING"
                        );
                        return (
                          <div
                            key={round.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                Round {idx + 1}: {round.title}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                {round.gameType
                                  ?.toLowerCase()
                                  .replace("_", " ")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={roundStatus} />
                              {roundStatus === "pending" &&
                                game.mappedStatus === "live" && (
                                  <Button
                                    size="sm"
                                    className="h-7 gap-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs"
                                    disabled={isUpdatingRound}
                                    onClick={() =>
                                      handleRoundAction(round.id, "ACTIVE")
                                    }
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
                                  onClick={() =>
                                    handleRoundAction(round.id, "ENDED")
                                  }
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

      {/* Edit Game Session Dialog */}
      {editingSession && (
        <EditGameSessionDialog
          session={editingSession}
          open={!!editingSession}
          isPaymentLocked={hasPayment}
          onOpenChange={(open) => { if (!open) setEditingSession(null); }}
        />
      )}

      {/* Unlock Game Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="max-w-md w-[95%]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-amber-500" />
              Unlock Game Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This game session is over your plan quota. Pay to unlock it for
              players.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Coupon Code (optional)
              </label>
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowUnlockDialog(false);
                  setUnlockingGameId(null);
                  setCouponCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#531342] hover:bg-[#531342]/90"
                disabled={isUnlocking || !unlockingGameId}
                onClick={() =>
                  unlockingGameId &&
                  handleUnlockGame(
                    unlockingGameId,
                    couponCode.trim() || undefined
                  )
                }
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Pay & Unlock"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Pricing is based on your event tier. Payment opens inline.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
