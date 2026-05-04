"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Play, Clock, Users, Crown, Medal, HelpCircle,
  Puzzle, MessageSquare, Zap, ChevronRight, Loader2,
  QrCode, CheckCircle2, Timer,
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
import { toast } from "sonner";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  trivia: <HelpCircle className="h-5 w-5" />,
  "word-puzzle": <Puzzle className="h-5 w-5" />,
  "two-truths": <MessageSquare className="h-5 w-5" />,
  "this-or-that": <Zap className="h-5 w-5" />,
};

const mapType = (t: string): GameType =>
  ({ TRIVIA: "trivia", WORD_PUZZLE: "word-puzzle", TWO_TRUTHS: "two-truths", THIS_OR_THAT: "this-or-that" }[t] ?? "trivia") as GameType;

const mapStatus = (s: string): "pending" | "live" | "ended" =>
  ({ PENDING: "pending", ACTIVE: "live", ENDED: "ended" }[s] ?? "pending") as "pending" | "live" | "ended";

function SessionLeaderboard({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = useGetSessionLeaderboardQuery(sessionId);
  // API shape: { data: { entries: [], myEntry } }
  const entries: any[] = data?.data?.entries ?? data?.data ?? [];
  const myEntry: any = data?.data?.myEntry ?? null;

  if (isLoading) return <div className="py-4 text-center"><Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" /></div>;

  if (!entries.length) return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Trophy className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">No scores yet</p>
      <p className="text-xs text-muted-foreground/60">Scores will appear once players submit answers</p>
    </div>
  );

  const icons = [
    <Crown className="h-4 w-4 text-amber-500" key={1} />,
    <Medal className="h-4 w-4 text-gray-400" key={2} />,
    <Medal className="h-4 w-4 text-amber-700" key={3} />,
  ];

  return (
    <div className="space-y-2">
      {entries.map((e: any, i: number) => {
        const isMe = myEntry && e.user?.id === myEntry.user?.id;
        return (
          <div key={e.user?.id ?? i} className={cn(
            "flex items-center gap-3 rounded-xl border p-3",
            isMe ? "border-primary/30 bg-primary/5" : "border-border"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
              {icons[i] ?? <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {e.user?.displayName ?? e.user?.username ?? "Player"}
                {isMe && <span className="ml-1 text-[10px] text-primary">(you)</span>}
              </p>
            </div>
            <span className="font-bold text-primary text-sm">{e.totalScore ?? 0} pts</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Round Player ─────────────────────────────────────────────────────────────
function RoundPlayer({
  round,
  onSubmit,
  isSubmitting,
}: {
  round: any;
  onSubmit: (roundId: string, answers: (number | string)[], timeTakenMs: number) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const questions: any[] = round.config?.questions ?? [];
  const gameType = mapType(round.gameType ?? "TRIVIA");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [wordInput, setWordInput] = useState("");
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);

  const q = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0;

  const handleSelectOption = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    // For word-puzzle without options, save the typed input
    if (gameType === "word-puzzle" && !q?.options?.length) {
      const newAnswers = [...answers];
      newAnswers[currentQ] = wordInput;
      setAnswers(newAnswers);
      setWordInput("");
    }
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      // Build final answers — one entry per question
      const finalAnswers: (number | string)[] = questions.map((_, i) => {
        if (gameType === "word-puzzle" && !q?.options?.length) {
          // last question uses current wordInput, others from answers array
          return i === currentQ ? wordInput : (answers[i] ?? "");
        }
        // trivia / this-or-that / two-truths — index-based
        return typeof answers[i] === "number" ? answers[i] : 0;
      });
      // Only mark submitted after the API confirms success
      const ok = await onSubmit(round.id, finalAnswers, Date.now() - startTime);
      if (ok) setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-lg text-foreground">Answers Submitted!</p>
          <p className="text-sm text-muted-foreground">
            Your answers for <span className="font-medium text-foreground">{round.title}</span> have been recorded.
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground">
          Hang tight — results will appear once the round ends.
        </div>
      </div>
    );
  }

  if (!q) return <p className="text-sm text-muted-foreground text-center py-4">No questions in this round.</p>;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> Round {round.title}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question */}
      <p className="font-semibold text-foreground text-base">{q.text}</p>

      {/* Options — Trivia / This-or-That / Two-Truths */}
      {q.options && (
        <div className="space-y-2">
          {q.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={cn(
                "w-full rounded-xl border-2 p-3 text-left text-sm transition-all",
                answers[currentQ] === idx
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="mr-2 font-bold text-muted-foreground">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Word puzzle input — only when no options */}
      {gameType === "word-puzzle" && !q.options?.length && (
        <input
          className="w-full rounded-xl border-2 border-border p-3 text-sm focus:border-primary outline-none"
          placeholder="Type your answer..."
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
        />
      )}

      <Button
        className="w-full rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
        disabled={
          isSubmitting || (() => {
            // Has options → must have selected one
            if (q.options?.length) return answers[currentQ] === undefined;
            // Word puzzle without options → must have typed something
            return !wordInput.trim();
          })()
        }
        onClick={handleNext}
      >
        {isSubmitting && currentQ === questions.length - 1 ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</>
        ) : currentQ < questions.length - 1 ? (
          "Next Question"
        ) : (
          "Submit Answers"
        )}
      </Button>
    </div>
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────
interface EventGamesTabProps {
  event: any;
}

type PhaseTab = "pre-event" | "main-event" | "post-event" | "both";

const PHASE_TABS: { value: PhaseTab; label: string }[] = [
  { value: "pre-event",  label: "Pre-Event"  },
  { value: "main-event", label: "Main Event" },
  { value: "post-event", label: "Post-Event" },
  { value: "both",       label: "Both"       },
];

const mapPhase = (t: string): PhaseTab =>
  ({ PRE_EVENT: "pre-event", DURING_EVENT: "main-event", POST_EVENT: "post-event", BOTH: "both" }[t] ?? "main-event") as PhaseTab;
export function EventGamesTab({ event: eventProp }: EventGamesTabProps) {
  // Fetch fresh event data so isCheckedIn reflects latest state
  const { data: eventDetails, refetch: refetchEvent } = useGetEventDetailsQuery(
    eventProp?.id,
    { skip: !eventProp?.id, refetchOnMountOrArgChange: true }
  );
  const event = eventDetails?.data ?? eventProp;

  const { data: gamesData, isLoading } = useGetGamesQuery(event?.id, { skip: !event?.id, refetchOnMountOrArgChange: true });
  const [joinSession, { isLoading: isJoining }] = useJoinGameSessionMutation();
  const [submitAnswers, { isLoading: isSubmitting }] = useSubmitRoundAnswersMutation();
  const [checkinEvent, { isLoading: isCheckingIn }] = useCheckinEventMutation();

  const [activePhase, setActivePhase] = useState<PhaseTab>("pre-event");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [playingRoundId, setPlayingRoundId] = useState<string | null>(null);
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set());
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);
  const [localCheckedIn, setLocalCheckedIn] = useState(false);

  const isCheckedIn = localCheckedIn || (event?.isCheckedIn ?? false);

  // Whether the event has officially started (used to gate main-event activities)
  const eventHasStarted = event?.startsAt ? new Date() >= new Date(event.startsAt) : false;

  const allSessions = (gamesData?.data ?? []).map((g: any) => ({
    ...g,
    mappedType: mapType(g.rounds?.[0]?.gameType ?? "TRIVIA"),
    mappedStatus: mapStatus(g.status),
    mappedPhase: mapPhase(g.activityTiming ?? "DURING_EVENT"),
  }));

  // Tabs that actually have sessions
  const tabsWithSessions = PHASE_TABS.filter((tab) =>
    allSessions.some((s: any) => s.mappedPhase === tab.value)
  );

  // Auto-select the first tab that has sessions once data loads
  useEffect(() => {
    if (tabsWithSessions.length > 0 && !tabsWithSessions.find((t) => t.value === activePhase)) {
      setActivePhase(tabsWithSessions[0].value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesData]);

  // Sessions for the active tab
  const sessions = allSessions.filter((s: any) => s.mappedPhase === activePhase);

  // ── Check-in ──────────────────────────────────────────────────────────────
  const handleCheckin = async () => {
    try {
      await checkinEvent({ qrCode: event?.qrCode ?? event?.id, eventId: event?.id }).unwrap();
      setLocalCheckedIn(true);
      refetchEvent();
      toast.success("Checked in! You can now join games.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Check-in failed. Try again.");
    }
  };

  // ── Join session ──────────────────────────────────────────────────────────
  const handleJoin = async (sessionId: string) => {
    try {
      await joinSession(sessionId).unwrap();
      setJoinedSessions((prev) => new Set(prev).add(sessionId));
      setActiveSessionId(sessionId);
      toast.success("Joined! Wait for the organizer to start a round.");
    } catch (err: any) {
      // Any failure — show the server message and do NOT proceed
      toast.error(err?.data?.error?.message ?? err?.data?.message ?? "Could not join session.");
    }
  };

  // ── Submit answers ────────────────────────────────────────────────────────
  const handleSubmit = async (
    roundId: string,
    answers: (number | string)[],
    timeTakenMs: number
  ): Promise<boolean> => {
    try {
      await submitAnswers({ roundId, answers, timeTakenMs }).unwrap();
      toast.success("Answers submitted!");
      return true;
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? err?.data?.message ?? "Submission failed.");
      return false;
    }
  };

  // ── Check-in guard ────────────────────────────────────────────────────────
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
          {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
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
        <p className="text-xs text-muted-foreground">The organizer hasn&apos;t added any games.</p>
      </div>
    );
  }

  // ── Active round play view ────────────────────────────────────────────────
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
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Round not found.</p>
        )}
      </div>
    );
  }

  // ── Session list with phase tabs ──────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Phase tabs — only show tabs that have sessions */}
      {tabsWithSessions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabsWithSessions.map((tab) => {
            const count = allSessions.filter((s: any) => s.mappedPhase === tab.value).length;
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
                <span className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                  activePhase === tab.value ? "bg-white/20 text-white" : "bg-background text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* If only one tab, auto-select it */}
      {tabsWithSessions.length === 1 && activePhase !== tabsWithSessions[0].value && (
        // silently sync — render nothing, effect handled below
        <></>
      )}

      {/* Empty state for this phase */}
      {sessions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Zap className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">No games for this phase</p>
          <p className="text-xs text-muted-foreground">Switch to another phase to see games.</p>
        </div>
      )}

      {sessions.map((session: any) => {
        const isJoined = joinedSessions.has(session.id);
        const isActive = session.mappedStatus === "live";
        const isEnded = session.mappedStatus === "ended";
        const activeRound = session.rounds?.find((r: any) => r.status === "ACTIVE");

        return (
          <Card
            key={session.id}
            className={cn(
              "overflow-hidden transition-all",
              isActive && "border-green-500/30 bg-green-500/5"
            )}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                  isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                )}>
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
                      <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
                    )}
                    {isEnded && (
                      <Badge variant="outline" className="text-[10px]">Ended</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.rounds?.length ?? 0} round{session.rounds?.length !== 1 ? "s" : ""}
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

              {/* Main-event gate: block joining until event has started */}
              {isActive && session.mappedPhase === "main-event" && !eventHasStarted && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center space-y-1">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Event hasn&apos;t started yet</p>
                  <p className="text-xs text-muted-foreground">Main event games unlock once the event begins.</p>
                </div>
              )}

              {/* ACTIVE state — join or play */}
              {isActive && (session.mappedPhase !== "main-event" || eventHasStarted) && (
                <div className="space-y-2">
                  {!isJoined ? (
                    <Button
                      className="w-full gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleJoin(session.id)}
                      disabled={isJoining}
                    >
                      {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Join Game
                    </Button>
                  ) : activeRound ? (
                    <Button
                      className="w-full gap-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setPlayingRoundId(activeRound.id);
                      }}
                    >
                      <Play className="h-4 w-4" />
                      Play Round: {activeRound.title}
                    </Button>
                  ) : (
                    <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-700 font-medium">You&apos;re in the lobby!</p>
                      <p className="text-xs text-muted-foreground">Waiting for the organizer to start a round.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ENDED state — show leaderboard */}
              {isEnded && (
                <div className="space-y-2">
                  <button
                    className="w-full flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setShowLeaderboard(showLeaderboard === session.id ? null : session.id)}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      View Leaderboard
                    </span>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", showLeaderboard === session.id && "rotate-90")} />
                  </button>

                  {showLeaderboard === session.id && (
                    <SessionLeaderboard sessionId={session.id} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
