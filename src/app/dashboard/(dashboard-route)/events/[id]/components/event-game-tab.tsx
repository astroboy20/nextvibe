"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  useGetGameSessionQuery,
  useGetActiveGameStatusQuery,
} from "@/app/provider/api/eventApi";
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

// ─── Word Puzzle Grid Player ──────────────────────────────────────────────────

type CellState = "idle" | "hovered" | "selected" | "correct" | "wrong-flash";

interface HiddenWord {
  word: string;
  clue: string;
  startCell: [number, number];
  endCell: [number, number];
  direction: string;
}

/**
 * Build a 2-D letter grid from a list of flat question objects.
 * Each question has: word, startCell [row, col], endCell [row, col], direction.
 * We place each word's letters at the correct coordinates, then fill empty
 * cells with random uppercase letters so the grid looks like a real word-search.
 */
function buildGridFromQuestions(questions: any[]): { grid: string[][]; hiddenWords: HiddenWord[] } {
  // Determine grid dimensions from the max row/col used across all words
  let maxRow = 0;
  let maxCol = 0;

  const hiddenWords: HiddenWord[] = questions
    .filter((q) => q.word && q.startCell && q.endCell)
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

  const rows = maxRow + 1;
  const cols = maxCol + 1;

  // Initialise grid with empty strings
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(""));

  // Place each word's letters
  for (const hw of hiddenWords) {
    const [r1, c1] = hw.startCell;
    const [r2, c2] = hw.endCell;
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1, c = c1;
    for (let i = 0; i < hw.word.length; i++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        grid[r][c] = hw.word[i];
      }
      if (r === r2 && c === c2) break;
      r += dr;
      c += dc;
    }
  }

  // Fill remaining empty cells with random letters
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
      }
    }
  }

  return { grid, hiddenWords };
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

  // Cell visual states
  const [cellStates, setCellStates] = useState<CellState[][]>(
    () => Array.from({ length: rows }, () => Array(cols).fill("idle"))
  );

  // Drag state
  const isDrawing = useRef(false);
  const startCell = useRef<[number, number] | null>(null);
  const currentCell = useRef<[number, number] | null>(null);

  // Reset cell states when grid dimensions change
  useEffect(() => {
    setCellStates(Array.from({ length: rows }, () => Array(cols).fill("idle")));
    isDrawing.current = false;
    startCell.current = null;
    currentCell.current = null;
  }, [rows, cols]);

  // Re-apply "correct" highlights for already-found words
  useEffect(() => {
    setCellStates((prev) => {
      const next = prev.map((row) => row.map((c) => (c === "correct" ? "correct" : "idle")));
      for (const hw of hiddenWords) {
        if (foundWords.has(hw.word.toUpperCase())) {
          highlightRange(next, hw.startCell, hw.endCell, "correct");
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords]);

  function highlightRange(
    states: CellState[][],
    start: [number, number],
    end: [number, number],
    state: CellState
  ) {
    const [r1, c1] = start;
    const [r2, c2] = end;
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1, c = c1;
    while (true) {
      if (r >= 0 && r < states.length && c >= 0 && c < (states[0]?.length ?? 0)) {
        states[r][c] = state;
      }
      if (r === r2 && c === c2) break;
      r += dr;
      c += dc;
    }
  }

  const applyDragHighlight = useCallback(
    (start: [number, number], end: [number, number]) => {
      setCellStates((prev) => {
        const next = prev.map((row) =>
          row.map((c) => (c === "correct" ? "correct" : "idle"))
        );
        highlightRange(next, start, end, "hovered");
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePointerDown = (row: number, col: number) => {
    isDrawing.current = true;
    startCell.current = [row, col];
    currentCell.current = [row, col];
    applyDragHighlight([row, col], [row, col]);
  };

  const handlePointerEnter = (row: number, col: number) => {
    if (!isDrawing.current || !startCell.current) return;
    currentCell.current = [row, col];
    applyDragHighlight(startCell.current, [row, col]);
  };

  const handlePointerUp = (row: number, col: number) => {
    if (!isDrawing.current || !startCell.current) return;
    isDrawing.current = false;
    const end: [number, number] = [row, col];
    handleSelectionComplete(startCell.current, end);
    startCell.current = null;
    currentCell.current = null;
  };

  const handleSelectionComplete = (
    selStart: [number, number],
    selEnd: [number, number]
  ) => {
    const matched = hiddenWords.find(
      (hw) =>
        !foundWords.has(hw.word.toUpperCase()) &&
        ((hw.startCell[0] === selStart[0] &&
          hw.startCell[1] === selStart[1] &&
          hw.endCell[0] === selEnd[0] &&
          hw.endCell[1] === selEnd[1]) ||
          // allow reverse selection
          (hw.startCell[0] === selEnd[0] &&
            hw.startCell[1] === selEnd[1] &&
            hw.endCell[0] === selStart[0] &&
            hw.endCell[1] === selStart[1]))
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
        const next = prev.map((row) =>
          row.map((c) => (c === "correct" ? "correct" : "idle"))
        );
        highlightRange(next, selStart, selEnd, "wrong-flash");
        return next;
      });
      setTimeout(() => {
        setCellStates((prev) =>
          prev.map((row) =>
            row.map((c) => (c === "wrong-flash" ? "idle" : c))
          )
        );
      }, 500);
    }
  };

  if (!grid.length) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No grid data for this puzzle.
      </p>
    );
  }

  // Clamp cell size so large grids still fit on mobile
  const cellSize = cols > 12 ? "h-7 w-7 text-xs" : cols > 8 ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className="space-y-3 select-none">
      {/* Grid — scrollable horizontally on small screens */}
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5 mx-auto"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          onPointerLeave={() => {
            if (isDrawing.current && startCell.current && currentCell.current) {
              handlePointerUp(currentCell.current[0], currentCell.current[1]);
            }
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const state = cellStates[rIdx]?.[cIdx] ?? "idle";
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onPointerDown={() => handlePointerDown(rIdx, cIdx)}
                  onPointerEnter={() => handlePointerEnter(rIdx, cIdx)}
                  onPointerUp={() => handlePointerUp(rIdx, cIdx)}
                  className={cn(
                    "flex items-center justify-center rounded-md font-bold cursor-pointer transition-colors touch-none",
                    cellSize,
                    state === "idle" && "bg-muted text-foreground hover:bg-muted/70",
                    state === "hovered" && "bg-[#531342]/30 text-[#531342]",
                    state === "selected" && "bg-[#531342]/50 text-white",
                    state === "correct" && "bg-green-500 text-white",
                    state === "wrong-flash" && "bg-red-400 text-white animate-shake"
                  )}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Words to find list */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Words to Find
        </p>
        <div className="flex flex-wrap gap-1.5">
          {hiddenWords.map((hw) => {
            const found = foundWords.has(hw.word.toUpperCase());
            return (
              <div
                key={hw.word}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-all",
                  found
                    ? "border-green-500/40 bg-green-500/10 text-green-700 line-through"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {found && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                {hw.clue || hw.word}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Word Puzzle Round Player ─────────────────────────────────────────────────
// All questions in a word-puzzle round are treated as a single word-search:
// we build one shared grid from all the flat question objects, then the player
// finds every hidden word on that grid before submitting.

function WordPuzzleRoundPlayer({
  questions,
  onAllComplete,
}: {
  questions: any[];
  onAllComplete: (answers: string[]) => void;
}) {
  // Build the grid once from all questions (stable across re-renders via useMemo)
  const { grid, hiddenWords } = useMemo(
    () => buildGridFromQuestions(questions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions.length]
  );

  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());

  const allFound = hiddenWords.length > 0 && hiddenWords.every((hw) => foundWords.has(hw.word));

  const handleWordFound = (word: string) => {
    setFoundWords((prev) => new Set([...prev, word]));
  };

  const handleSubmit = () => {
    // One answer per original question: the found word if it was found, else empty string
    const answers = questions.map((q) => {
      const w = (q.word as string | undefined)?.toUpperCase() ?? "";
      return foundWords.has(w) ? w : "";
    });
    onAllComplete(answers);
  };

  if (!grid.length) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No grid data for this puzzle.
      </p>
    );
  }

  const remaining = hiddenWords.length - foundWords.size;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{foundWords.size} / {hiddenWords.length} words found</span>
          {allFound && (
            <span className="text-green-600 font-semibold">All found! 🎉</span>
          )}
        </div>
        <Progress
          value={hiddenWords.length > 0 ? (foundWords.size / hiddenWords.length) * 100 : 0}
          className="h-1.5"
        />
      </div>

      <WordPuzzleGrid
        grid={grid}
        hiddenWords={hiddenWords}
        onWordFound={handleWordFound}
        foundWords={foundWords}
      />

      <Button
        className={cn(
          "w-full rounded-xl text-white",
          allFound
            ? "bg-green-600 hover:bg-green-700"
            : "bg-[#531342] hover:bg-[#531342]/90"
        )}
        onClick={handleSubmit}
        disabled={!allFound && hiddenWords.length > 0}
      >
        {allFound
          ? "Submit Answers"
          : `Find ${remaining} more word${remaining !== 1 ? "s" : ""}…`}
      </Button>
    </div>
  );
}



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
  onComplete,
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
  /** Called after score is set so parent can refetch session without unmounting this component */
  onComplete?: () => void;
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
  const [waitingForResult, setWaitingForResult] = useState(false);

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

  // ── Word Puzzle: delegate entirely to the grid player ──────────────────────
  if (gameType === "word-puzzle") {
    if (finalScore !== null) {
      // fall through to score screen below
    } else if (!waitingForResult) {
      return (
        <WordPuzzleRoundPlayer
          questions={questions}
          onAllComplete={async (wordAnswers) => {
            setWaitingForResult(true);
            const result = await onSubmit(
              round.id,
              wordAnswers,
              Date.now() - totalStartTime
            );
            if (result.ok) {
              await refetchLeaderboard();
              setFinalScore(result.score ?? 0);
              onComplete?.();
            } else {
              setWaitingForResult(false);
            }
          }}
        />
      );
    }
  }

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
      setWaitingForResult(true);
      const result = await onSubmit(
        round.id,
        allAnswers,
        Date.now() - totalStartTime
      );
      if (result.ok) {
        await refetchLeaderboard();
        setFinalScore(result.score ?? 0);
        onComplete?.();
      } else {
        setWaitingForResult(false);
      }
    }
  };

  const handleSelectOption = (idx: number) => {
    if (flash) return;
    // correctIndex is the numeric index stored in config.questions
    const correctIdx: number = q?.correctIndex ?? 0;
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
    // correctAnswer is the string stored in config.questions for word-puzzle
    const correctAnswer: string = q?.correctAnswer ?? q?.answer ?? "";
    const isCorrect =
      wordInput.trim().toLowerCase() ===
      correctAnswer.trim().toLowerCase();

    const newAnswers = [...answers];
    newAnswers[currentQ] = wordInput;
    setAnswers(newAnswers);
    setFlash({ selected: wordInput, correct: correctAnswer, isCorrect });

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
      ? `${typeof window !== "undefined" ? window.location.origin : ""
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
                  title: `I scored ${finalScore} in ${session?.title ?? round.title
                    }!`,
                  text: `I played in ${eventName ?? session?.title
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

  if (isSubmitting || waitingForResult) {
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

      {gameType === "word-puzzle" && !q.options?.length && null}
    </div>
  );
}

function SessionCard({
  session,
  isActive,
  isEnded,
  eventHasStarted,
  isJoined: isJoinedProp,
  isJoining,
  sessionData,
  playedRounds,
  showLeaderboard,
  onJoin,
  onPlay,
  onToggleLeaderboard,
}: {
  session: any;
  isActive: boolean;
  isEnded: boolean;
  eventHasStarted: boolean;
  isJoined: boolean;
  isJoining: boolean;
  /** Data from GET /v1/game-sessions/:id, fetched after games load */
  sessionData: any;
  playedRounds: Set<string>;
  showLeaderboard: string | null;
  onJoin: () => void;
  onPlay: (roundId: string) => void;
  onToggleLeaderboard: () => void;
}) {
  // isJoined from /v1/game-sessions/:id response, fall back to local state
  const isJoined = sessionData?.isJoined ?? isJoinedProp;

  // Build submitted rounds from session rounds[].hasPlayed + local fallback
  const apiPlayedRounds = new Set<string>(
    (sessionData?.rounds ?? [])
      .filter((r: any) => r.hasPlayed)
      .map((r: any) => r.id as string)
  );
  const submittedRounds = new Set<string>([...apiPlayedRounds, ...playedRounds]);

  // Leaderboard — only fetched when the leaderboard section is visible
  const { data: lbData } = useGetSessionLeaderboardQuery(session.id, {
    refetchOnMountOrArgChange: true,
  });

  const lbPayload = lbData?.data ?? lbData;
  const entries: any[] = lbPayload?.entries ?? lbPayload?.data?.entries ?? [];
  const myEntry: any = lbPayload?.myEntry ?? lbPayload?.data?.myEntry ?? null;

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
              {isJoined && isActive && (
                <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-600 bg-green-500/5">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  Joined
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
        {isActive && session.mappedPhase === "main-event" && !eventHasStarted && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center space-y-1">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Event hasn&apos;t started yet
            </p>
            <p className="text-xs text-muted-foreground">
              Main event games unlock once the event begins.
            </p>
          </div>
        )}

        {/* ACTIVE state */}
        {isActive && (session.mappedPhase !== "main-event" || eventHasStarted) && (
          <div className="space-y-3">

            {/* Step 1 — Join button (disabled once joined) */}
            <Button
              className={cn(
                "w-full gap-2 rounded-xl text-white",
                isJoined
                  ? "bg-green-600/60 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              )}
              onClick={async () => { await onJoin(); }}
              disabled={isJoined || isJoining}
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isJoined ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isJoining ? "Joining..." : isJoined ? "Joined" : "Join Game"}
            </Button>

            {/* Step 2 — Rounds list (only visible after joining) */}
            {isJoined && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Rounds
                </p>
                {session.rounds?.length > 0 ? (
                  session.rounds.map((round: any) => {
                    const isRoundLive = round.status === "ACTIVE";
                    const isRoundEnded = round.status === "ENDED";
                    // Check API hasSubmitted first, fall back to local playedRounds
                    const alreadyPlayed = submittedRounds.has(round.id) || playedRounds.has(round.id);

                    return (
                      <div
                        key={round.id}
                        className={cn(
                          "rounded-xl border p-3 flex items-center justify-between gap-3",
                          alreadyPlayed
                            ? "border-primary/20 bg-primary/5"
                            : isRoundLive
                              ? "border-[#531342]/30 bg-[#531342]/5"
                              : "border-border bg-muted/30"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{round.title}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">
                            {round.gameType?.toLowerCase().replace(/_/g, " ")}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {alreadyPlayed ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-primary/40 text-primary bg-primary/5 gap-1"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Submitted
                            </Badge>
                          ) : isRoundLive ? (
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 rounded-full bg-[#531342] hover:bg-[#531342]/90 text-white text-xs"
                              onClick={() => onPlay(round.id)}
                            >
                              <Play className="h-3 w-3" />
                              Play
                            </Button>
                          ) : isRoundEnded ? (
                            <Badge variant="outline" className="text-[10px]">
                              Ended
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Waiting
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Waiting for the organizer to start a round.
                    </p>
                  </div>
                )}
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

/**
 * Fetches GET /v1/game-sessions/:id for a single session and reports the
 * result + refetch fn back to the parent via callbacks.
 * Rendered only after games have loaded (controlled by parent skip logic).
 */
function SessionFetcher({
  sessionId,
  onData,
  onRefetch,
}: {
  sessionId: string;
  onData: (sessionId: string, data: any) => void;
  onRefetch: (sessionId: string, refetch: () => void) => void;
}) {
  const { data, refetch } = useGetGameSessionQuery(sessionId, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data?.data) onData(sessionId, data.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    onRefetch(sessionId, refetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  return null;
}
export function EventGamesTab({ event: eventProp }: EventGamesTabProps) {
  const { data: eventDetails } = useGetEventDetailsQuery(
    eventProp?.id,
    { skip: !eventProp?.id, refetchOnMountOrArgChange: true }
  );
  const event = eventDetails?.data ?? eventProp;

  // Use the dedicated endpoint to check if the user has joined the active game
  const {
    data: gameStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchGameStatus,
  } = useGetActiveGameStatusQuery(event?.id, {
    skip: !event?.id,
    refetchOnMountOrArgChange: true,
  });

  const hasActiveGame: boolean = gameStatusData?.data?.hasActiveGame ?? false;
  // isJoined from the status endpoint — true once the user has called /join
  const isJoinedFromStatus: boolean = gameStatusData?.data?.isJoined ?? false;
  // The active session id from the status response — use to pre-select the session
  const activeSessionIdFromStatus: string | undefined = gameStatusData?.data?.session?.id;

  const { data: gamesData, isLoading } = useGetGamesQuery(event?.id, {
    skip: !event?.id,
    refetchOnMountOrArgChange: true,
  });
  const [joinSession, { isLoading: isJoining }] = useJoinGameSessionMutation();
  const [submitAnswers, { isLoading: isSubmitting }] =
    useSubmitRoundAnswersMutation();

  const [activePhase, setActivePhase] = useState<PhaseTab>("pre-event");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [playingRoundId, setPlayingRoundId] = useState<string | null>(null);

  // Holds GET /v1/game-sessions/:id data keyed by session id — populated after games load
  const [sessionDataMap, setSessionDataMap] = useState<Record<string, any>>({});
  // Holds refetch fns keyed by session id so we can invalidate on join/submit
  const sessionRefetchMap = useState<Record<string, () => void>>({})[0];
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(`joinedSessions:${eventProp?.id}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const markSessionJoined = (sessionId: string) => {
    setJoinedSessions((prev) => {
      const next = new Set(prev).add(sessionId);
      try { localStorage.setItem(`joinedSessions:${eventProp?.id}`, JSON.stringify([...next])); } catch { }
      return next;
    });
  };

  // Persist played rounds in localStorage so "hasPlayed" survives page refresh.
  // Key is scoped to the event so different events don't collide.
  const playedRoundsKey = `playedRounds:${eventProp?.id}`;
  const [playedRounds, setPlayedRounds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(playedRoundsKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markRoundPlayed = (roundId: string) => {
    setPlayedRounds((prev) => {
      const next = new Set(prev).add(roundId);
      try { localStorage.setItem(playedRoundsKey, JSON.stringify([...next])); } catch { }
      return next;
    });
  };

  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);

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

  // Seed joinedSessions from the status endpoint on load — covers the case
  // where the user joined in a previous session and localStorage was cleared.
  useEffect(() => {
    if (isJoinedFromStatus && activeSessionIdFromStatus) {
      markSessionJoined(activeSessionIdFromStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJoinedFromStatus, activeSessionIdFromStatus]);

  const handleJoin = async (sessionId: string) => {
    try {
      await joinSession(sessionId).unwrap();
      markSessionJoined(sessionId);
      setActiveSessionId(sessionId);
      // Refetch this session so isJoined + hasPlayed are up to date
      sessionRefetchMap[sessionId]?.();
      refetchGameStatus();
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
      markRoundPlayed(roundId);
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

  // While we're fetching check-in status, show a spinner — avoids flashing
  // the sessions list before we know the user's state.
  if (isLoadingStatus || isLoading) {
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
            onComplete={() => {
              if (activeSessionId) sessionRefetchMap[activeSessionId]?.();
            }}
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
      {/* Fetch session details for each session after games have loaded */}
      {allSessions.map((s: any) => (
        <SessionFetcher
          key={s.id}
          sessionId={s.id}
          onData={(id, data) =>
            setSessionDataMap((prev) =>
              prev[id] === data ? prev : { ...prev, [id]: data }
            )
          }
          onRefetch={(id, refetch) => {
            sessionRefetchMap[id] = refetch;
          }}
        />
      ))}
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
        const isActive = session.mappedStatus === "live";
        const isEnded = session.mappedStatus === "ended";
        // Check local joined set OR the status endpoint (covers page-refresh case)
        const isJoined =
          joinedSessions.has(session.id) ||
          (isJoinedFromStatus && session.id === activeSessionIdFromStatus);

        return (
          <SessionCard
            key={session.id}
            session={session}
            isActive={isActive}
            isEnded={isEnded}
            isJoined={isJoined}
            isJoining={isJoining}
            eventHasStarted={eventHasStarted}
            sessionData={sessionDataMap[session.id] ?? null}
            playedRounds={playedRounds}
            showLeaderboard={showLeaderboard}
            onJoin={() => handleJoin(session.id)}
            onPlay={(roundId) => {
              setActiveSessionId(session.id);
              setPlayingRoundId(roundId);
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
