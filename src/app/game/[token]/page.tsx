"use client";
import { use, useState, useEffect, useRef, useCallback, useMemo } from "react";
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

// ── Word Puzzle Grid (shared with dashboard) ─────────────────────────────────

type CellState = "idle" | "hovered" | "selected" | "correct" | "wrong-flash";

interface HiddenWord {
  word: string;
  clue: string;
  startCell: [number, number];
  endCell: [number, number];
  direction: string;
}

function buildGridFromQuestions(questions: any[]): { grid: string[][]; hiddenWords: HiddenWord[]; timeLimitSecs: number } {
  let maxRow = 0;
  let maxCol = 0;

  // Deduplicate by word to avoid duplicate React keys and grid conflicts
  const seenWords = new Set<string>();

  const hiddenWords: HiddenWord[] = questions
    .filter((q) => {
      if (!q.word || !q.startCell || !q.endCell) return false;
      const key = (q.word as string).toUpperCase();
      if (seenWords.has(key)) return false;
      seenWords.add(key);
      return true;
    })
    .map((q) => {
      const start: [number, number] = [q.startCell[0], q.startCell[1]];
      const end: [number, number] = [q.endCell[0], q.endCell[1]];
      maxRow = Math.max(maxRow, start[0], end[0]);
      maxCol = Math.max(maxCol, start[1], end[1]);
      return {
        word: (q.word as string).toUpperCase(),
        clue: q.text ?? q.clue ?? q.word,
        startCell: start,
        endCell: end,
        direction: q.direction ?? "HORIZONTAL",
      };
    });

  // Use the max timeLimitSecs across all questions, defaulting to 60s
  const timeLimitSecs = questions.reduce((acc: number, q: any) => {
    return q.timeLimitSecs && q.timeLimitSecs > 0 ? Math.max(acc, q.timeLimitSecs) : acc;
  }, 60);

  const rows = maxRow + 1;
  const cols = maxCol + 1;
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(""));

  for (const hw of hiddenWords) {
    const [r1, c1] = hw.startCell;
    const [r2, c2] = hw.endCell;
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1, c = c1;
    for (let i = 0; i < hw.word.length; i++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = hw.word[i];
      if (r === r2 && c === c2) break;
      r += dr; c += dc;
    }
  }

  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];

  return { grid, hiddenWords, timeLimitSecs };
}

function WordPuzzleGrid({
  grid,
  hiddenWords,
  onWordFound,
  foundWords,
}: {
  grid: string[][];
  hiddenWords: HiddenWord[];
  onWordFound: (word: string) => void;
  foundWords: Set<string>;
}) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const [cellStates, setCellStates] = useState<CellState[][]>(
    () => Array.from({ length: rows }, () => Array(cols).fill("idle"))
  );

  const isDrawing = useRef(false);
  const startCell = useRef<[number, number] | null>(null);
  const currentCell = useRef<[number, number] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hiddenWordsRef = useRef(hiddenWords);
  hiddenWordsRef.current = hiddenWords;
  const foundWordsRef = useRef(foundWords);
  foundWordsRef.current = foundWords;

  useEffect(() => {
    setCellStates(Array.from({ length: rows }, () => Array(cols).fill("idle")));
    isDrawing.current = false;
    startCell.current = null;
    currentCell.current = null;
  }, [rows, cols]);

  useEffect(() => {
    setCellStates((prev) => {
      const next = prev.map((row) => row.map((c) => (c === "correct" ? "correct" : "idle")));
      for (const hw of hiddenWords) {
        if (foundWords.has(hw.word.toUpperCase())) highlightRange(next, hw.startCell, hw.endCell, "correct");
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords]);

  function highlightRange(states: CellState[][], start: [number, number], end: [number, number], state: CellState) {
    const [r1, c1] = start;
    const [r2, c2] = end;
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1, c = c1;
    while (true) {
      if (r >= 0 && r < states.length && c >= 0 && c < (states[0]?.length ?? 0)) states[r][c] = state;
      if (r === r2 && c === c2) break;
      r += dr; c += dc;
    }
  }

  const cellFromPoint = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!el) return null;
    const rStr = el.dataset.row;
    const cStr = el.dataset.col;
    if (rStr === undefined || cStr === undefined) return null;
    return [parseInt(rStr, 10), parseInt(cStr, 10)];
  }, []);

  const applyDragHighlight = useCallback((start: [number, number], end: [number, number]) => {
    setCellStates((prev) => {
      const next = prev.map((row) => row.map((c) => (c === "correct" ? "correct" : "idle")));
      highlightRange(next, start, end, "hovered");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectionComplete = useCallback((selStart: [number, number], selEnd: [number, number]) => {
    const hw = hiddenWordsRef.current;
    const fw = foundWordsRef.current;
    const matched = hw.find(
      (h) =>
        !fw.has(h.word.toUpperCase()) &&
        ((h.startCell[0] === selStart[0] && h.startCell[1] === selStart[1] && h.endCell[0] === selEnd[0] && h.endCell[1] === selEnd[1]) ||
          (h.startCell[0] === selEnd[0] && h.startCell[1] === selEnd[1] && h.endCell[0] === selStart[0] && h.endCell[1] === selStart[1]))
    );

    if (matched) {
      setCellStates((prev) => {
        const next = prev.map((row) => [...row]);
        highlightRange(next, matched.startCell, matched.endCell, "correct");
        return next;
      });
      onWordFound(matched.word.toUpperCase());
    } else {
      setCellStates((prev) => {
        const next = prev.map((row) => row.map((c) => (c === "correct" ? "correct" : "idle")));
        highlightRange(next, selStart, selEnd, "wrong-flash");
        return next;
      });
      setTimeout(() => {
        setCellStates((prev) => prev.map((row) => row.map((c) => (c === "wrong-flash" ? "idle" : c))));
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onWordFound]);

  const onGridPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    isDrawing.current = true;
    startCell.current = cell;
    currentCell.current = cell;
    applyDragHighlight(cell, cell);
  }, [cellFromPoint, applyDragHighlight]);

  const onGridPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing.current || !startCell.current) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    if (currentCell.current && currentCell.current[0] === cell[0] && currentCell.current[1] === cell[1]) return;
    currentCell.current = cell;
    applyDragHighlight(startCell.current, cell);
  }, [cellFromPoint, applyDragHighlight]);

  const onGridPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing.current || !startCell.current) return;
    isDrawing.current = false;
    const cell = cellFromPoint(e.clientX, e.clientY) ?? currentCell.current;
    const end = cell ?? startCell.current;
    handleSelectionComplete(startCell.current, end);
    startCell.current = null;
    currentCell.current = null;
  }, [cellFromPoint, handleSelectionComplete]);

  if (!grid.length) return <p className="text-xs text-muted-foreground text-center py-4">No grid data for this puzzle.</p>;

  const cellSize = cols > 12 ? "h-7 w-7 text-xs" : cols > 8 ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className="space-y-3 select-none">
      <div className="overflow-x-auto">
        <div
          ref={gridRef}
          className="inline-grid gap-0.5 mx-auto cursor-crosshair"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          onPointerDown={onGridPointerDown}
          onPointerMove={onGridPointerMove}
          onPointerUp={onGridPointerUp}
          onPointerLeave={(e) => {
            if (isDrawing.current && startCell.current) {
              isDrawing.current = false;
              const end = currentCell.current ?? startCell.current;
              handleSelectionComplete(startCell.current, end);
              startCell.current = null;
              currentCell.current = null;
            }
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const state = cellStates[rIdx]?.[cIdx] ?? "idle";
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  data-row={rIdx}
                  data-col={cIdx}
                  className={cn(
                    "flex items-center justify-center rounded-md font-bold transition-colors touch-none",
                    cellSize,
                    state === "idle" && "bg-muted text-foreground",
                    state === "hovered" && "bg-[#531342]/30 text-[#531342]",
                    state === "selected" && "bg-[#531342]/50 text-white",
                    state === "correct" && "bg-green-500 text-white",
                    state === "wrong-flash" && "bg-red-400 text-white"
                  )}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Words to find */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Words to Find</p>
        <div className="flex flex-wrap gap-1.5">
          {hiddenWords.map((hw, idx) => {
            const found = foundWords.has(hw.word.toUpperCase());
            return (
              <div
                key={`${hw.word}-${idx}`}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-all",
                  found
                    ? "border-green-500/40 bg-green-500/10 text-green-700 line-through"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {found && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                {hw.word}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PublicWordPuzzlePlayer({
  questions,
  onAllComplete,
}: {
  questions: any[];
  onAllComplete: (answers: string[]) => void;
}) {
  const { grid, hiddenWords, timeLimitSecs } = useMemo(() => buildGridFromQuestions(questions), [questions.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimitSecs);
  const [expired, setExpired] = useState(false);
  const startTimeRef = useRef(Date.now());

  const allFound = hiddenWords.length > 0 && hiddenWords.every((hw) => foundWords.has(hw.word));
  const remaining = hiddenWords.length - foundWords.size;

  // Countdown timer — auto-submit when it hits 0
  useEffect(() => {
    if (allFound || expired) return;
    setTimeLeft(timeLimitSecs);
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = timeLimitSecs - elapsed;
      if (left <= 0) {
        setTimeLeft(0);
        setExpired(true);
        clearInterval(interval);
        const answers = questions.map((q) => {
          const w = (q.word as string | undefined)?.toUpperCase() ?? "";
          return foundWords.has(w) ? w : "";
        });
        onAllComplete(answers);
      } else {
        setTimeLeft(left);
      }
    }, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimitSecs, allFound]);

  const handleWordFound = (word: string) => setFoundWords((prev) => new Set([...prev, word]));

  const handleSubmit = () => {
    const answers = questions.map((q) => {
      const w = (q.word as string | undefined)?.toUpperCase() ?? "";
      return foundWords.has(w) ? w : "";
    });
    onAllComplete(answers);
  };

  if (!grid.length) return <p className="text-xs text-muted-foreground text-center py-4">No grid data for this puzzle.</p>;

  const timerPct = (timeLeft / timeLimitSecs) * 100;
  const timerUrgent = timeLeft <= 10;

  return (
    <div className="space-y-4">
      {/* Timer + progress */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{foundWords.size} / {hiddenWords.length} words found</span>
          <span className={cn(
            "flex items-center gap-1 font-mono font-bold",
            timerUrgent ? "text-red-500 animate-pulse" : "text-foreground"
          )}>
            <Timer className="h-3 w-3" />
            {timeLeft}s
          </span>
        </div>
        <Progress value={timerPct} className={cn("h-1.5", timerUrgent && "[&>div]:bg-red-500")} />
      </div>

      {allFound && <p className="text-center text-xs text-green-600 font-semibold">All found! 🎉</p>}

      <WordPuzzleGrid grid={grid} hiddenWords={hiddenWords} onWordFound={handleWordFound} foundWords={foundWords} />

      <Button
        className={cn("w-full rounded-xl text-white", allFound ? "bg-green-600 hover:bg-green-700" : "bg-[#531342] hover:bg-[#531342]/90")}
        onClick={handleSubmit}
      >
        {allFound ? "Submit Answers" : `Submit (${remaining} word${remaining !== 1 ? "s" : ""} remaining)`}
      </Button>
    </div>
  );
}

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

  // ── Word Puzzle: delegate to grid player ─────────────────────────────────
  if (gameType === "word-puzzle" && finalScore === null) {
    return (
      <PublicWordPuzzlePlayer
        questions={questions}
        onAllComplete={async (wordAnswers) => {
          const result = await onSubmit(round.id, wordAnswers, Date.now() - totalStartTime);
          if (result.ok) {
            await refetchLeaderboard();
            setFinalScore(result.score ?? 0);
          }
        }}
      />
    );
  }

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

      {/* Word puzzle — handled above via early return, nothing to render here */}
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
