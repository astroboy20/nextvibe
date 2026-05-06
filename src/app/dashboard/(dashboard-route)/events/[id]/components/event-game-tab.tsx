"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Play,
  Clock,
  Users,
  HelpCircle,
  Puzzle,
  MessageSquare,
  Zap,
  ChevronRight,
  Loader2,
  QrCode,
  CheckCircle2,
  Timer,
  XCircle,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetGamesQuery,
  useGetEventDetailsQuery,
  useJoinGameSessionMutation,
  useSubmitRoundAnswersMutation,
  useGetSessionLeaderboardQuery,
  useCheckinEventMutation,
} from "@/app/provider/api/eventApi";
import { useGetUserQuery } from "@/app/provider/api/userApi";
import { GameScoreShare } from "./game-share";
import { toast } from "sonner";
import Image from "next/image";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-5 w-5" />,
  "word-puzzle": <Puzzle className="h-5 w-5" />,
  "two-truths": <MessageSquare className="h-5 w-5" />,
  "this-or-that": <Zap className="h-5 w-5" />,
};

const mapType = (t: string): GameType =>
  (({
    TRIVIA: "trivia",
    WORD_PUZZLE: "word-puzzle",
    TWO_TRUTHS: "two-truths",
    THIS_OR_THAT: "this-or-that",
  }[t] ?? "trivia") as GameType);

const mapStatus = (s: string): "pending" | "live" | "ended" =>
  (({ PENDING: "pending", ACTIVE: "live", ENDED: "ended" }[s] ?? "pending") as
    | "pending"
    | "live"
    | "ended");

function SessionLeaderboard({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = useGetSessionLeaderboardQuery(sessionId);
  const entries: any[] = data?.data?.entries ?? [];
  const myEntry: any = data?.data?.myEntry ?? null;

  if (isLoading)
    return (
      <div className="py-4 text-center">
        <Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" />
      </div>
    );

  if (!entries.length)
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Trophy className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No scores yet
        </p>
        <p className="text-xs text-muted-foreground/60">
          Scores will appear once players submit answers
        </p>
      </div>
    );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2 pt-1">
      {entries.map((e: any, i: number) => {
        const isMe = myEntry && e.user?.id === myEntry.user?.id;
        const rank = e.rank ?? i + 1;
        return (
          <div
            key={e.user?.id ?? i}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              isMe ? "border-primary/30 bg-primary/5" : "border-border"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0 text-sm">
              {rank <= 3 ? (
                medals[rank - 1]
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  #{rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {e.user?.avatarUrl ? (
                <Image
                  width={100}
                  height={100}
                  src={e.user.avatarUrl}
                  alt="avatar"
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {(e.user?.displayName ??
                      e.user?.username ??
                      "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {e.user?.displayName ?? e.user?.username ?? "Player"}
                  {isMe && (
                    <span className="ml-1 text-[10px] text-primary">(you)</span>
                  )}
                </p>
                {e.user?.username && e.user?.displayName && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    @{e.user.username}
                  </p>
                )}
              </div>
            </div>
            <span className="font-bold text-primary text-sm shrink-0">
              {e.totalScore ?? 0} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RoundPlayer({
  round,
  session,
  eventName,
  onSubmit,
  isSubmitting,
}: {
  round: any;
  session: any;
  eventName?: string;
  onSubmit: (
    roundId: string,
    answers: (number | string)[],
    timeTakenMs: number
  ) => Promise<{ ok: boolean; score?: number; correctAnswers?: any[] }>;
  isSubmitting: boolean;
}) {
  const questions: any[] = round.config?.questions ?? [];
  const gameType = mapType(round.gameType ?? "TRIVIA");

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [wordInput, setWordInput] = useState("");

  const [totalStartTime] = useState(Date.now());
  const [qStartTime, setQStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const [flash, setFlash] = useState<{
    selected: number | string;
    correct: number | string;
    isCorrect: boolean;
  } | null>(null);

  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);

  const { data: leaderboardData, refetch: refetchLeaderboard } =
    useGetSessionLeaderboardQuery(session?.id, { skip: !session?.id });

  useEffect(() => {
    if (flash || finalScore !== null) return;
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - qStartTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, flash, finalScore]);

  const q = questions[currentQ];
  const progress =
    questions.length > 0 ? (currentQ / questions.length) * 100 : 0;
  const isLast = currentQ === questions.length - 1;

  const advance = async (
    selectedAnswer: number | string,
    allAnswers: (number | string)[]
  ) => {
    if (!isLast) {
      setCurrentQ((c) => c + 1);
      setQStartTime(Date.now());
      setFlash(null);
      setWordInput("");
    } else {
      setFlash(null);
      const result = await onSubmit(
        round.id,
        allAnswers,
        Date.now() - totalStartTime
      );
      if (result.ok) {
        await refetchLeaderboard();
        setFinalScore(result.score ?? 0);
      }
    }
  };

  const handleSelectOption = (idx: number) => {
    if (flash) return;
    const correctIdx: number | string =
      q?.correctAnswer ?? q?.correct ?? q?.answer ?? 0;
    const isCorrect = idx === correctIdx;

    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setFlash({ selected: idx, correct: correctIdx, isCorrect });

    // Auto-advance after 800 ms
    setTimeout(() => advance(idx, newAnswers), 800);
  };

  const handleWordSubmit = () => {
    if (flash || !wordInput.trim()) return;
    const correctIdx: number | string =
      q?.correctAnswer ?? q?.correct ?? q?.answer ?? "";
    const isCorrect =
      wordInput.trim().toLowerCase() ===
      String(correctIdx).trim().toLowerCase();

    const newAnswers = [...answers];
    newAnswers[currentQ] = wordInput;
    setAnswers(newAnswers);
    setFlash({ selected: wordInput, correct: correctIdx, isCorrect });

    setTimeout(() => advance(wordInput, newAnswers), 800);
  };

  if (finalScore !== null) {
    const entries: any[] = leaderboardData?.data?.entries ?? [];
    const myEntry: any = leaderboardData?.data?.myEntry ?? null;
    const _rankFromIndex =
      entries.findIndex((e: any) => e.user?.id === myEntry?.user?.id) + 1;
    const myRank = myEntry?.rank || _rankFromIndex || 1;
    const shareToken: string | undefined = session?.shareToken;
    const shareUrl = shareToken
      ? `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/game/${shareToken}`
      : typeof window !== "undefined"
      ? window.location.href
      : "";

    if (showShare) {
      return (
        <div className="space-y-4 animate-fade-in">
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowShare(false)}
          >
            ← Back to score
          </button>
          <GameScoreShare
            gameName={session?.title ?? round.title}
            score={finalScore}
            rank={myRank}
            totalPlayers={entries.length || 1}
            eventName={eventName}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center animate-fade-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-accent/20">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">
            Your Score
          </p>
          <p className="font-display text-5xl font-bold text-foreground">
            {finalScore.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">points</p>
        </div>
        {myRank > 0 && (
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            {myRank === 1
              ? "🥇"
              : myRank === 2
              ? "🥈"
              : myRank === 3
              ? "🥉"
              : "🏆"}{" "}
            Rank #{myRank} of {entries.length || 1}
          </Badge>
        )}
        <Card className="w-full bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-left">
            <p className="text-sm text-foreground font-medium leading-relaxed">
              I played in{" "}
              <span className="font-bold">{eventName ?? session?.title}</span>
              &apos;s game, I scored{" "}
              <span className="font-bold text-primary">
                {finalScore.toLocaleString()}
              </span>
              . Play and see if you can beat mine.
            </p>
          </CardContent>
        </Card>
        <Button
          className="w-full gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => {
            if (shareToken && navigator.share) {
              navigator
                .share({
                  title: `I scored ${finalScore} in ${
                    session?.title ?? round.title
                  }!`,
                  text: `I played in ${
                    eventName ?? session?.title
                  }'s game, I scored ${finalScore}. Play and see if you can beat mine.`,
                  url: shareUrl,
                })
                .catch(() => setShowShare(true));
            } else {
              setShowShare(true);
            }
          }}
        >
          <Share2 className="h-4 w-4" />
          Share Score
        </Button>
      </div>
    );
  }

  if (!q)
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No questions in this round.
      </p>
    );

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Submitting your answers…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-1 font-mono font-semibold text-foreground">
            <Timer className="h-3 w-3" />
            {elapsed}s
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* <p className="text-[11px] text-muted-foreground text-center">
        ⚡ Answer fast — speed breaks ties on the leaderboard
      </p> */}

      <p className="font-semibold text-foreground text-base">{q.text}</p>

      {q.options && (
        <div className="space-y-2">
          {q.options.map((opt: string, idx: number) => {
            const isSelected = flash?.selected === idx;
            const isCorrectOpt = flash ? flash.correct === idx : false;
            const isWrongSelected = isSelected && !isCorrectOpt;

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={!!flash}
                className={cn(
                  "w-full rounded-xl border-2 p-3 text-left text-sm transition-all duration-150",
                  !flash && "border-border hover:border-primary/50",
                  flash &&
                    isCorrectOpt &&
                    "border-green-500 bg-green-500/15 text-green-700",
                  flash &&
                    isWrongSelected &&
                    "border-red-500 bg-red-500/15 text-red-700",
                  flash &&
                    !isSelected &&
                    !isCorrectOpt &&
                    "border-border opacity-40"
                )}
              >
                <span className="mr-2 font-bold text-muted-foreground">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
                {flash && isCorrectOpt && (
                  <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />
                )}
                {flash && isWrongSelected && (
                  <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {gameType === "word-puzzle" && !q.options?.length && (
        <div className="space-y-2">
          <input
            className="w-full rounded-xl border-2 border-border p-3 text-sm focus:border-primary outline-none"
            placeholder="Type your answer..."
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWordSubmit()}
            disabled={!!flash}
          />
          <Button
            className="w-full rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
            disabled={!wordInput.trim() || !!flash}
            onClick={handleWordSubmit}
          >
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  isJoined,
  isActive,
  isEnded,
  activeRound,
  eventHasStarted,
  isJoining,
  playedRounds,
  showLeaderboard,
  onJoin,
  onPlay,
  onToggleLeaderboard,
}: {
  session: any;
  isJoined: boolean;
  isActive: boolean;
  isEnded: boolean;
  activeRound: any;
  eventHasStarted: boolean;
  isJoining: boolean;
  playedRounds: Set<string>;
  showLeaderboard: string | null;
  onJoin: () => void;
  onPlay: () => void;
  onToggleLeaderboard: () => void;
}) {
  // Always fetch leaderboard — no skip — so we know if user has played on mount
  const { data: lbData } = useGetSessionLeaderboardQuery(session.id, {
    refetchOnMountOrArgChange: true,
  });

  const { data: meData } = useGetUserQuery();
  const myUserId: string | undefined = meData?.data?.id;

  // Normalise response shape — backend may return data.data.* or data.*
  const lbPayload = lbData?.data ?? lbData;
  const entries: any[] = lbPayload?.entries ?? lbPayload?.data?.entries ?? [];
  const myEntry: any = lbPayload?.myEntry ?? lbPayload?.data?.myEntry ?? null;

  // User has played if:
  // 1. myEntry is explicitly returned by the backend, OR
  // 2. their userId appears anywhere in the entries list, OR
  // 3. locally tracked (covers the instant after submit before refetch)
  const isInEntries =
    !!myUserId &&
    entries.some((e: any) => e.user?.id === myUserId || e.userId === myUserId);
  const hasPlayed =
    !!myEntry ||
    isInEntries ||
    (activeRound && playedRounds.has(activeRound?.id));

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        isActive && "border-green-500/30 bg-green-500/5"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
              isActive
                ? "bg-green-500/10 text-green-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            {gameTypeIcons[session.mappedType as GameType]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-foreground">{session.title}</h4>
              {isActive && (
                <Badge className="bg-green-500 text-white text-[10px] animate-pulse">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white inline-block" />
                  Live
                </Badge>
              )}
              {!isActive && !isEnded && (
                <Badge variant="secondary" className="text-[10px]">
                  Coming Soon
                </Badge>
              )}
              {isEnded && (
                <Badge variant="outline" className="text-[10px]">
                  Ended
                </Badge>
              )}
              {hasPlayed && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/40 text-primary bg-primary/5"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  Played
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.rounds?.length ?? 0} round
                {session.rounds?.length !== 1 ? "s" : ""}
              </span>
              {session._count?.sessionEntries > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {session._count.sessionEntries} joined
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PENDING state */}
        {!isActive && !isEnded && (
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Waiting for the organizer to start this session.
            </p>
          </div>
        )}

        {/* Main-event gate */}
        {isActive &&
          session.mappedPhase === "main-event" &&
          !eventHasStarted && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center space-y-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Event hasn&apos;t started yet
              </p>
              <p className="text-xs text-muted-foreground">
                Main event games unlock once the event begins.
              </p>
            </div>
          )}

        {/* ACTIVE state — join or play */}
        {isActive &&
          (session.mappedPhase !== "main-event" || eventHasStarted) && (
            <div className="space-y-2">
              {hasPlayed ? (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-primary font-medium">
                    You&apos;ve already played this round
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check the leaderboard to see your rank.
                  </p>
                </div>
              ) : !isJoined ? (
                <Button
                  className="w-full gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                  onClick={onJoin}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Join Game
                </Button>
              ) : activeRound ? (
                <Button
                  className="w-full gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
                  onClick={onPlay}
                >
                  <Play className="h-4 w-4" />
                  Play Round: {activeRound.title}
                </Button>
              ) : (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-700 font-medium">
                    You&apos;re in the lobby!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Waiting for the organizer to start a round.
                  </p>
                </div>
              )}
            </div>
          )}

        {/* Leaderboard */}
        {(isActive || isEnded) && (
          <div className="space-y-2">
            <button
              className="w-full flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
              onClick={onToggleLeaderboard}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Trophy className="h-4 w-4 text-amber-500" />
                {isActive ? "Live Leaderboard" : "Final Leaderboard"}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  showLeaderboard === session.id && "rotate-90"
                )}
              />
            </button>
            {showLeaderboard === session.id && (
              <SessionLeaderboard sessionId={session.id} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EventGamesTabProps {
  event: any;
}

type PhaseTab = "pre-event" | "main-event" | "post-event" | "both";

const PHASE_TABS: { value: PhaseTab; label: string }[] = [
  { value: "pre-event", label: "Pre-Event" },
  { value: "main-event", label: "Main Event" },
  { value: "post-event", label: "Post-Event" },
  { value: "both", label: "Both" },
];

const mapPhase = (t: string): PhaseTab =>
  (({
    PRE_EVENT: "pre-event",
    DURING_EVENT: "main-event",
    POST_EVENT: "post-event",
    BOTH: "both",
  }[t] ?? "main-event") as PhaseTab);
export function EventGamesTab({ event: eventProp }: EventGamesTabProps) {
  const { data: eventDetails, refetch: refetchEvent } = useGetEventDetailsQuery(
    eventProp?.id,
    { skip: !eventProp?.id, refetchOnMountOrArgChange: true }
  );
  const event = eventDetails?.data ?? eventProp;

  const { data: gamesData, isLoading } = useGetGamesQuery(event?.id, {
    skip: !event?.id,
    refetchOnMountOrArgChange: true,
  });
  const [joinSession, { isLoading: isJoining }] = useJoinGameSessionMutation();
  const [submitAnswers, { isLoading: isSubmitting }] =
    useSubmitRoundAnswersMutation();
  const [checkinEvent, { isLoading: isCheckingIn }] = useCheckinEventMutation();

  const [activePhase, setActivePhase] = useState<PhaseTab>("pre-event");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [playingRoundId, setPlayingRoundId] = useState<string | null>(null);
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set());
  const [playedRounds, setPlayedRounds] = useState<Set<string>>(new Set());
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);
  const [localCheckedIn, setLocalCheckedIn] = useState(false);

  const isCheckedIn =
    localCheckedIn ||
    (event?.isCheckedIn ?? false) ||
    (event?.checkedInCount ?? 0) > 1;

  const eventHasStarted = event?.startsAt
    ? new Date() >= new Date(event.startsAt)
    : false;

  const allSessions = (gamesData?.data ?? []).map((g: any) => ({
    ...g,
    mappedType: mapType(g.rounds?.[0]?.gameType ?? "TRIVIA"),
    mappedStatus: mapStatus(g.status),
    mappedPhase: mapPhase(g.activityTiming ?? "DURING_EVENT"),
  }));

  const tabsWithSessions = PHASE_TABS.filter((tab) =>
    allSessions.some((s: any) => s.mappedPhase === tab.value)
  );

  useEffect(() => {
    if (
      tabsWithSessions.length > 0 &&
      !tabsWithSessions.find((t) => t.value === activePhase)
    ) {
      setActivePhase(tabsWithSessions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesData]);

  const sessions = allSessions.filter(
    (s: any) => s.mappedPhase === activePhase
  );

  const handleCheckin = async () => {
    try {
      await checkinEvent({
        qrCode: event?.qrCode ?? event?.id,
        eventId: event?.id,
      }).unwrap();
      setLocalCheckedIn(true);
      refetchEvent();
      toast.success("Checked in! You can now join games.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Check-in failed. Try again.");
    }
  };

  const handleJoin = async (sessionId: string) => {
    try {
      await joinSession(sessionId).unwrap();
      setJoinedSessions((prev) => new Set(prev).add(sessionId));
      setActiveSessionId(sessionId);
      toast.success("Joined! Wait for the organizer to start a round.");
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ??
          err?.data?.message ??
          "Could not join session."
      );
    }
  };

  const handleSubmit = async (
    roundId: string,
    answers: (number | string)[],
    timeTakenMs: number
  ): Promise<{ ok: boolean; score?: number; correctAnswers?: any[] }> => {
    try {
      const res = await submitAnswers({
        roundId,
        answers,
        timeTakenMs,
      }).unwrap();
      toast.success("Answers submitted!");
      setPlayedRounds((prev) => new Set(prev).add(roundId));
      const score =
        res?.data?.score ?? res?.data?.totalScore ?? res?.score ?? 0;
      return { ok: true, score };
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ?? err?.data?.message ?? "Submission failed."
      );
      return { ok: false };
    }
  };

  if (!isCheckedIn) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Check In First</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            You need to check in to this event before you can join any games.
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={handleCheckin}
          disabled={isCheckingIn}
        >
          {isCheckingIn ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <QrCode className="h-4 w-4" />
          )}
          Check In to Event
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!allSessions.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Zap className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground">No games yet</p>
        <p className="text-xs text-muted-foreground">
          The organizer hasn&apos;t added any games.
        </p>
      </div>
    );
  }

  if (playingRoundId) {
    const session = allSessions.find((s: any) => s.id === activeSessionId);
    const round = session?.rounds?.find((r: any) => r.id === playingRoundId);

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setPlayingRoundId(null)}
          >
            ← Back
          </button>
          <span className="text-sm font-medium">{session?.title}</span>
        </div>
        {round ? (
          <RoundPlayer
            round={round}
            session={session}
            eventName={event?.name}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Round not found.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {tabsWithSessions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabsWithSessions.map((tab) => {
            const count = allSessions.filter(
              (s: any) => s.mappedPhase === tab.value
            ).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActivePhase(tab.value)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                  activePhase === tab.value
                    ? "bg-[#531342] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                    activePhase === tab.value
                      ? "bg-white/20 text-white"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tabsWithSessions.length === 1 &&
        activePhase !== tabsWithSessions[0].value && <></>}

      {sessions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Zap className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">
            No games for this phase
          </p>
          <p className="text-xs text-muted-foreground">
            Switch to another phase to see games.
          </p>
        </div>
      )}

      {sessions.map((session: any) => {
        const isJoined = joinedSessions.has(session.id);
        const isActive = session.mappedStatus === "live";
        const isEnded = session.mappedStatus === "ended";
        const activeRound = session.rounds?.find(
          (r: any) => r.status === "ACTIVE"
        );

        return (
          <SessionCard
            key={session.id}
            session={session}
            isJoined={isJoined}
            isActive={isActive}
            isEnded={isEnded}
            activeRound={activeRound}
            eventHasStarted={eventHasStarted}
            isJoining={isJoining}
            playedRounds={playedRounds}
            showLeaderboard={showLeaderboard}
            onJoin={() => handleJoin(session.id)}
            onPlay={() => {
              setActiveSessionId(session.id);
              setPlayingRoundId(activeRound?.id ?? null);
            }}
            onToggleLeaderboard={() =>
              setShowLeaderboard(
                showLeaderboard === session.id ? null : session.id
              )
            }
          />
        );
      })}
    </div>
  );
}
