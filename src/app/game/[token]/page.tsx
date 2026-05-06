"use client";
import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Play, Loader2, CheckCircle2, XCircle,
  Timer, Share2, HelpCircle, Puzzle, MessageSquare, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetGameSessionByTokenQuery,
  useJoinGameSessionByTokenMutation,
  useSubmitRoundAnswersMutation,
  useGetSessionLeaderboardQuery,
} from "@/app/provider/api/eventApi";
import { useGetUserQuery } from "@/app/provider/api/userApi";
import { GameScoreShare } from "@/app/dashboard/(dashboard-route)/events/[id]/components/game-share";
import { toast } from "sonner";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";

const mapType = (t: string): GameType =>
  ({ TRIVIA: "trivia", WORD_PUZZLE: "word-puzzle", TWO_TRUTHS: "two-truths", THIS_OR_THAT: "this-or-that" }[t] ?? "trivia") as GameType;

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-5 w-5" />,
  "word-puzzle": <Puzzle className="h-5 w-5" />,
  "two-truths": <MessageSquare className="h-5 w-5" />,
  "this-or-that": <Zap className="h-5 w-5" />,
};

// ── Round Player ─────────────────────────────────────────────────────────────
function PublicRoundPlayer({
  round,
  session,
  onSubmit,
  isSubmitting,
}: {
  round: any;
  session: any;
  onSubmit: (roundId: string, answers: (number | string)[], timeTakenMs: number) => Promise<{ ok: boolean; score?: number }>;
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

  // flash: null = waiting for answer; set = show green/red for 800ms then advance
  const [flash, setFlash] = useState<{
    selected: number | string;
    correct: number | string;
    isCorrect: boolean;
  } | null>(null);

  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);

  const { data: leaderboardData, refetch: refetchLeaderboard } = useGetSessionLeaderboardQuery(
    session?.id,
    { skip: !session?.id }
  );

  // Live per-question timer
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
  const progress = questions.length > 0 ? (currentQ / questions.length) * 100 : 0;
  const isLast = currentQ === questions.length - 1;

  const advance = async (selectedAnswer: number | string, allAnswers: (number | string)[]) => {
    if (!isLast) {
      setCurrentQ((c) => c + 1);
      setQStartTime(Date.now());
      setFlash(null);
      setWordInput("");
    } else {
      setFlash(null);
      const result = await onSubmit(round.id, allAnswers, Date.now() - totalStartTime);
      if (result.ok) {
        await refetchLeaderboard();
        setFinalScore(result.score ?? 0);
      }
    }
  };

  const handleSelectOption = (idx: number) => {
    if (flash) return;
    const correctIdx: number | string = q?.correctAnswer ?? q?.correct ?? q?.answer ?? 0;
    const isCorrect = idx === correctIdx;
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setFlash({ selected: idx, correct: correctIdx, isCorrect });
    setTimeout(() => advance(idx, newAnswers), 800);
  };

  const handleWordSubmit = () => {
    if (flash || !wordInput.trim()) return;
    const correctIdx: number | string = q?.correctAnswer ?? q?.correct ?? q?.answer ?? "";
    const isCorrect = wordInput.trim().toLowerCase() === String(correctIdx).trim().toLowerCase();
    const newAnswers = [...answers];
    newAnswers[currentQ] = wordInput;
    setAnswers(newAnswers);
    setFlash({ selected: wordInput, correct: correctIdx, isCorrect });
    setTimeout(() => advance(wordInput, newAnswers), 800);
  };

  // ── Final score screen ────────────────────────────────────────────────────
  if (finalScore !== null) {
    const entries: any[] = leaderboardData?.data?.entries ?? [];
    const myEntry: any = leaderboardData?.data?.myEntry ?? null;
    const _rankFromIndex = entries.findIndex((e: any) => e.user?.id === myEntry?.user?.id) + 1;
    const myRank = myEntry?.rank || _rankFromIndex || 1;
    const shareToken: string | undefined = session?.shareToken;
    const shareUrl = shareToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/game/${shareToken}`
      : typeof window !== "undefined" ? window.location.href : "";
    const eventName = session?.event?.name ?? session?.eventName;

    if (showShare) {
      return (
        <div className="space-y-4 animate-fade-in">
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setShowShare(false)}>
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
          <p className="text-sm text-muted-foreground font-medium">Your Score</p>
          <p className="font-display text-5xl font-bold text-foreground">{finalScore.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">points</p>
        </div>
        {myRank > 0 && (
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            {myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : "🏆"} Rank #{myRank} of {entries.length || 1}
          </Badge>
        )}
        <Card className="w-full bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-left">
            <p className="text-sm text-foreground font-medium leading-relaxed">
              I played in <span className="font-bold">{eventName ?? session?.title}</span>&apos;s game, I scored{" "}
              <span className="font-bold text-primary">{finalScore.toLocaleString()}</span>. Play and see if you can beat mine.
            </p>
          </CardContent>
        </Card>
        <Button
          className="w-full gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => {
            if (shareToken && navigator.share) {
              navigator.share({
                title: `I scored ${finalScore} in ${session?.title ?? round.title}!`,
                text: `I played in ${eventName ?? session?.title}'s game, I scored ${finalScore}. Play and see if you can beat mine.`,
                url: shareUrl,
              }).catch(() => setShowShare(true));
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

  if (!q) return <p className="text-sm text-muted-foreground text-center py-4">No questions in this round.</p>;

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Submitting your answers…</p>
      </div>
    );
  }

  // ── Active question ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Progress + timer */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span className="flex items-center gap-1 font-mono font-semibold text-foreground">
            <Timer className="h-3 w-3" />
            {elapsed}s
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        ⚡ Answer fast — speed breaks ties on the leaderboard
      </p>

      <p className="font-semibold text-foreground text-base">{q.text}</p>

      {/* Options */}
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
                  flash && isCorrectOpt && "border-green-500 bg-green-500/15 text-green-700",
                  flash && isWrongSelected && "border-red-500 bg-red-500/15 text-red-700",
                  flash && !isSelected && !isCorrectOpt && "border-border opacity-40"
                )}
              >
                <span className="mr-2 font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                {opt}
                {flash && isCorrectOpt && <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />}
                {flash && isWrongSelected && <XCircle className="inline ml-2 h-4 w-4 text-red-500" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Word puzzle */}
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

// ── Public Game Page ─────────────────────────────────────────────────────────
export default function PublicGamePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data, isLoading, error } = useGetGameSessionByTokenQuery(token);
  const [joinByToken, { isLoading: isJoining }] = useJoinGameSessionByTokenMutation();
  const [submitAnswers, { isLoading: isSubmitting }] = useSubmitRoundAnswersMutation();

  const [joined, setJoined] = useState(false);
  const [playingRoundId, setPlayingRoundId] = useState<string | null>(null);
  const [playedRounds, setPlayedRounds] = useState<Set<string>>(new Set());

  const session = data?.data;
  const activeRound = session?.rounds?.find((r: any) => r.status === "ACTIVE");
  const gameType = mapType(session?.rounds?.[0]?.gameType ?? "TRIVIA");
  const eventName = session?.event?.name ?? session?.eventName;

  // Check leaderboard to see if user has already played
  const { data: lbData } = useGetSessionLeaderboardQuery(session?.id, {
    skip: !session?.id,
    refetchOnMountOrArgChange: true,
  });
  const { data: meData } = useGetUserQuery();
  const myUserId: string | undefined = meData?.data?.id;

  const lbPayload = lbData?.data ?? lbData;
  const lbEntries: any[] = lbPayload?.entries ?? lbPayload?.data?.entries ?? [];
  const myEntry: any = lbPayload?.myEntry ?? lbPayload?.data?.myEntry ?? null;

  const isInEntries = !!myUserId && lbEntries.some(
    (e: any) => e.user?.id === myUserId || e.userId === myUserId
  );
  const hasPlayed =
    !!myEntry ||
    isInEntries ||
    (activeRound && playedRounds.has(activeRound?.id));

  const handleJoin = async () => {
    try {
      await joinByToken(token).unwrap();
      setJoined(true);
      toast.success("Joined! Get ready to play.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Could not join. Try again.");
    }
  };

  const handleSubmit = async (
    roundId: string,
    answers: (number | string)[],
    timeTakenMs: number
  ): Promise<{ ok: boolean; score?: number }> => {
    try {
      const res = await submitAnswers({ roundId, answers, timeTakenMs }).unwrap();
      toast.success("Answers submitted!");
      setPlayedRounds((prev) => new Set(prev).add(roundId));
      const score = res?.data?.score ?? res?.data?.totalScore ?? res?.score ?? 0;
      return { ok: true, score };
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? err?.data?.message ?? "Submission failed.");
      return { ok: false };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Zap className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-bold text-xl text-foreground">Game not found</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This game link may have expired or the session has ended.
        </p>
      </div>
    );
  }

  // Playing a round
  if (playingRoundId) {
    const round = session.rounds?.find((r: any) => r.id === playingRoundId);
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setPlayingRoundId(null)}
          >
            ← Back
          </button>
          <p className="text-xs text-muted-foreground font-medium">{session.title}</p>
          {round ? (
            <PublicRoundPlayer
              round={round}
              session={session}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Round not found.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            {gameTypeIcons[gameType]}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{session.title}</h1>
          {eventName && <p className="text-sm text-muted-foreground">{eventName}</p>}
          <Badge
            variant={session.status === "ACTIVE" ? "default" : "secondary"}
            className={cn(session.status === "ACTIVE" && "bg-green-500 text-white animate-pulse")}
          >
            {session.status === "ACTIVE" ? "🟢 Live" : session.status === "ENDED" ? "Ended" : "Coming Soon"}
          </Badge>
        </div>

        {/* Session info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rounds</span>
              <span className="font-medium">{session.rounds?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Players joined</span>
              <span className="font-medium">{session._count?.sessionEntries ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Ended */}
        {session.status === "ENDED" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center rounded-xl border border-dashed border-border">
            <Trophy className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">This game has ended</p>
            <p className="text-xs text-muted-foreground">Check back for future games at this event.</p>
          </div>
        )}

        {/* Pending */}
        {session.status === "PENDING" && (
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">This game hasn&apos;t started yet. Check back soon!</p>
          </div>
        )}

        {/* Active */}
        {session.status === "ACTIVE" && (
          <div className="space-y-3">
            {hasPlayed ? (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-primary font-medium">You&apos;ve already played this round</p>
                <p className="text-xs text-muted-foreground">Check the leaderboard to see your rank.</p>
              </div>
            ) : !joined ? (
              <Button
                className="w-full gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Join &amp; Play
              </Button>
            ) : activeRound ? (
              <Button
                className="w-full gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
                onClick={() => setPlayingRoundId(activeRound.id)}
              >
                <Play className="h-4 w-4" />
                Play Round: {activeRound.title}
              </Button>
            ) : (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-700 font-medium">You&apos;re in the lobby!</p>
                <p className="text-xs text-muted-foreground">Waiting for the organizer to start a round.</p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Powered by <span className="font-semibold text-foreground">NextVibe</span>
        </p>
      </div>
    </div>
  );
}
