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
  useAnonymousJoinGameMutation,
  useAnonymousSubmitRoundMutation,
} from "@/app/provider/api/eventApi";
import { GameScoreShare } from "./game-share";
import { toast } from "sonner";
import Image from "next/image";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Cookies from "js-cookie";
import { getAnonymousId, saveAnonSession } from "@/lib/anonymous-game";

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
 *
 * Supports two API shapes:
 *  - Old format: { word, startCell, endCell, direction, text }
 *  - New format: { text, correctAnswer, timeLimitSecs } — word = correctAnswer ?? text,
 *    no coordinates provided; we auto-place the words in the grid.
 */
function buildGridFromQuestions(questions: any[]): { grid: string[][]; hiddenWords: HiddenWord[]; timeLimitSecs: number } {
  const timeLimitSecs = questions.reduce((acc: number, q: any) => {
    return q.timeLimitSecs && q.timeLimitSecs > 0 ? Math.max(acc, q.timeLimitSecs) : acc;
  }, 60);

  // Extract canonical word from whichever field the API provides
  const extractWord = (q: any): string =>
    ((q.word ?? q.correctAnswer ?? q.text ?? "") as string).toUpperCase().replace(/\s+/g, "");

  // Deduplicate
  const seenWords = new Set<string>();
  const rawWords: { word: string; clue: string; q: any }[] = questions
    .map((q) => ({ word: extractWord(q), clue: q.text ?? q.clue ?? q.word ?? q.correctAnswer ?? "", q }))
    .filter(({ word }) => {
      if (!word) return false;
      if (seenWords.has(word)) return false;
      seenWords.add(word);
      return true;
    });

  // ── Case 1: backend provided coordinates ─────────────────────────────────
  const hasCoords = rawWords.every(({ q }) => q.startCell && q.endCell);
  if (hasCoords) {
    let maxRow = 0, maxCol = 0;
    const hiddenWords: HiddenWord[] = rawWords.map(({ word, clue, q }) => {
      const start: [number, number] = [q.startCell[0], q.startCell[1]];
      const end: [number, number] = [q.endCell[0], q.endCell[1]];
      maxRow = Math.max(maxRow, start[0], end[0]);
      maxCol = Math.max(maxCol, start[1], end[1]);
      return { word, clue, startCell: start, endCell: end, direction: q.direction ?? "HORIZONTAL" };
    });
    const rows = maxRow + 1, cols = maxCol + 1;
    const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(""));
    for (const hw of hiddenWords) {
      const [r1, c1] = hw.startCell, [r2, c2] = hw.endCell;
      const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
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

  // ── Case 2: auto-place words in a generated grid ─────────────────────────
  const longestWord = rawWords.reduce((max, { word }) => Math.max(max, word.length), 0);
  const wordCount = rawWords.length;
  // Grid size: generous enough to fit all words with some padding
  const SIZE = Math.max(longestWord + 2, Math.ceil(Math.sqrt(wordCount * longestWord * 2.5)) + 2, 8);

  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  const hiddenWords: HiddenWord[] = [];

  // Directions: 0=horizontal, 1=vertical (keep it simple for auto-placement)
  const DIRECTIONS: Array<{ dr: number; dc: number; name: string }> = [
    { dr: 0, dc: 1, name: "HORIZONTAL" },
    { dr: 1, dc: 0, name: "VERTICAL" },
  ];

  const canPlace = (word: string, r: number, c: number, dr: number, dc: number): boolean => {
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return false;
      if (grid[nr][nc] !== "" && grid[nr][nc] !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (word: string, r: number, c: number, dr: number, dc: number) => {
    for (let i = 0; i < word.length; i++) {
      grid[r + dr * i][c + dc * i] = word[i];
    }
  };

  // Seeded-style shuffle to keep placement deterministic per question set
  const shuffle = <T,>(arr: T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  for (const { word, clue } of rawWords) {
    let placed = false;
    const dirs = shuffle(DIRECTIONS);
    // Try many random positions per direction
    for (const { dr, dc, name } of dirs) {
      const positions = shuffle(
        Array.from({ length: SIZE * SIZE }, (_, idx) => [Math.floor(idx / SIZE), idx % SIZE] as [number, number])
      );
      for (const [r, c] of positions) {
        if (canPlace(word, r, c, dr, dc)) {
          placeWord(word, r, c, dr, dc);
          const endR = r + dr * (word.length - 1);
          const endC = c + dc * (word.length - 1);
          hiddenWords.push({
            word,
            clue,
            startCell: [r, c],
            endCell: [endR, endC],
            direction: name,
          });
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    // If still not placed (extremely unlikely), skip silently
  }

  // Fill empty cells with random letters
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
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

  // Cell visual states
  const [cellStates, setCellStates] = useState<CellState[][]>(
    () => Array.from({ length: rows }, () => Array(cols).fill("idle"))
  );

  // Drag state — all stored in refs to avoid stale closures in pointer handlers
  const isDrawing = useRef(false);
  const startCell = useRef<[number, number] | null>(null);
  const currentCell = useRef<[number, number] | null>(null);
  // Ref to the grid container so we can read cell positions during pointermove
  const gridRef = useRef<HTMLDivElement>(null);
  // Stable ref to hiddenWords so pointer handlers always see the latest value
  const hiddenWordsRef = useRef(hiddenWords);
  hiddenWordsRef.current = hiddenWords;
  // Stable ref to foundWords
  const foundWordsRef = useRef(foundWords);
  foundWordsRef.current = foundWords;

  // Reset cell states when grid dimensions change
  useEffect(() => {
    setCellStates(Array.from({ length: rows }, () => Array(cols).fill("idle")));
    isDrawing.current = false;
    startCell.current = null;
    currentCell.current = null;
  }, [rows, cols]);

  // Re-apply "correct" highlights for already-found words
  const foundWordsKey = [...foundWords].sort().join(",");
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
  }, [foundWordsKey]);

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
    // Guard: if direction is (0,0) the start===end — just mark that one cell
    if (dr === 0 && dc === 0) {
      if (r1 >= 0 && r1 < states.length && c1 >= 0 && c1 < (states[0]?.length ?? 0)) {
        states[r1][c1] = state;
      }
      return;
    }
    let r = r1, c = c1;
    // Cap iterations to the max possible steps across the grid to prevent runaway loops
    const maxSteps = Math.max(states.length, states[0]?.length ?? 0) + 1;
    let steps = 0;
    while (steps <= maxSteps) {
      if (r >= 0 && r < states.length && c >= 0 && c < (states[0]?.length ?? 0)) {
        states[r][c] = state;
      }
      if (r === r2 && c === c2) break;
      r += dr;
      c += dc;
      steps++;
    }
  }

  /**
   * Given a clientX/clientY, find which grid cell [row, col] is under the pointer.
   * Uses elementFromPoint so it works correctly on touch devices where
   * onPointerEnter on child elements never fires during a drag.
   */
  const cellFromPoint = useCallback((clientX: number, clientY: number): [number, number] | null => {
    // Temporarily hide pointer-events on the grid so elementFromPoint can
    // pierce through to the cell divs (they have touch-none so this is safe)
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!el) return null;
    const rStr = el.dataset.row;
    const cStr = el.dataset.col;
    if (rStr === undefined || cStr === undefined) return null;
    return [parseInt(rStr, 10), parseInt(cStr, 10)];
  }, []);

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

  const handleSelectionComplete = useCallback(
    (selStart: [number, number], selEnd: [number, number]) => {
      const hw = hiddenWordsRef.current;
      const fw = foundWordsRef.current;
      const matched = hw.find(
        (h) =>
          !fw.has(h.word.toUpperCase()) &&
          ((h.startCell[0] === selStart[0] &&
            h.startCell[1] === selStart[1] &&
            h.endCell[0] === selEnd[0] &&
            h.endCell[1] === selEnd[1]) ||
            (h.startCell[0] === selEnd[0] &&
              h.startCell[1] === selEnd[1] &&
              h.endCell[0] === selStart[0] &&
              h.endCell[1] === selStart[1]))
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
            prev.map((row) => row.map((c) => (c === "wrong-flash" ? "idle" : c)))
          );
        }, 500);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onWordFound]
  );

  // ── Container-level pointer handlers ──────────────────────────────────────
  // All three are attached to the grid wrapper, not individual cells.
  // This is the only reliable way to track drags on touch devices.

  const onGridPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      // Capture the pointer so pointermove keeps firing even outside the element
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      isDrawing.current = true;
      startCell.current = cell;
      currentCell.current = cell;
      applyDragHighlight(cell, cell);
    },
    [cellFromPoint, applyDragHighlight]
  );

  const onGridPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDrawing.current || !startCell.current) return;
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      // Only re-render if the cell actually changed
      if (
        currentCell.current &&
        currentCell.current[0] === cell[0] &&
        currentCell.current[1] === cell[1]
      )
        return;
      currentCell.current = cell;
      applyDragHighlight(startCell.current, cell);
    },
    [cellFromPoint, applyDragHighlight]
  );

  const onGridPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDrawing.current || !startCell.current) return;
      // Release capture explicitly — iOS Safari doesn't always auto-release on pointerup
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      isDrawing.current = false;
      const cell = cellFromPoint(e.clientX, e.clientY) ?? currentCell.current;
      const end = cell ?? startCell.current;
      handleSelectionComplete(startCell.current, end);
      startCell.current = null;
      currentCell.current = null;
    },
    [cellFromPoint, handleSelectionComplete]
  );

  // OS interrupted the gesture (scroll start, notification, etc.) — reset state
  // so the next drag starts clean instead of seeing stale isDrawing/startCell.
  const onGridPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDrawing.current) return;
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      isDrawing.current = false;
      startCell.current = null;
      currentCell.current = null;
      // Reset hover highlights — leave correct cells intact
      setCellStates((prev) =>
        prev.map((row) => row.map((c) => (c === "correct" ? "correct" : "idle")))
      );
    },
    []
  );

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
      {/* Grid — all pointer events handled on the container */}
      <div className="overflow-x-auto">
        <div
          ref={gridRef}
          className="inline-grid gap-0.5 mx-auto cursor-crosshair touch-none"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          onPointerDown={onGridPointerDown}
          onPointerMove={onGridPointerMove}
          onPointerUp={onGridPointerUp}
          onPointerCancel={onGridPointerCancel}
          // If pointer leaves the grid entirely, commit whatever was selected
          onPointerLeave={(e) => {
            if (isDrawing.current && startCell.current) {
              (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
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
                  // data attributes let cellFromPoint identify the cell via elementFromPoint
                  data-row={rIdx}
                  data-col={cIdx}
                  className={cn(
                    "flex items-center justify-center rounded-md font-bold touch-none",
                    cellSize,
                    state === "idle" && "bg-muted text-foreground",
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
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Words to Find
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {hiddenWords.map((hw, idx) => {
            const found = foundWords.has(hw.word.toUpperCase());
            return (
              <div
                key={`${hw.word}-${idx}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs border transition-all",
                  found
                    ? "border-green-500/40 bg-green-500/10 text-green-700"
                    : "border-border bg-muted/50 text-foreground"
                )}
              >
                {found
                  ? <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600" />
                  : <span className="block h-3 w-3 shrink-0 rounded-full border border-current opacity-40" />
                }
                <p className={cn("font-bold leading-tight", found && "line-through")}>
                  {hw.word}
                </p>
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
  initialFoundWords,
}: {
  questions: any[];
  onAllComplete: (answers: string[]) => void;
  initialFoundWords?: string[];
}) {
  // Build the grid once from all questions (stable across re-renders via useMemo)
  const { grid, hiddenWords, timeLimitSecs } = useMemo(
    () => buildGridFromQuestions(questions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions.length]
  );

  const [foundWords, setFoundWords] = useState<Set<string>>(
    () => new Set(initialFoundWords ?? [])
  );
  const [timeLeft, setTimeLeft] = useState(timeLimitSecs);
  const [expired, setExpired] = useState(false);
  const startTimeRef = useRef(Date.now());

  const allFound = hiddenWords.length > 0 && hiddenWords.every((hw) => foundWords.has(hw.word));

  // Countdown timer
  useEffect(() => {
    if (allFound || expired) return;
    setTimeLeft(timeLimitSecs);
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = timeLimitSecs - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        setExpired(true);
        clearInterval(interval);
        // Auto-submit with whatever was found
        const answers = questions.map((q) => {
          const w = ((q.word ?? q.correctAnswer ?? q.text ?? "") as string).toUpperCase().replace(/\s+/g, "");
          return foundWords.has(w) ? w : "";
        });
        onAllComplete(answers);
      } else {
        setTimeLeft(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimitSecs, allFound]);

  const handleWordFound = (word: string) => {
    setFoundWords((prev) => new Set([...prev, word]));
  };

  const handleSubmit = () => {
    // One answer per original question: the found word if it was found, else empty string
    const answers = questions.map((q) => {
      const w = ((q.word ?? q.correctAnswer ?? q.text ?? "") as string).toUpperCase().replace(/\s+/g, "");
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
  const timerPct = (timeLeft / timeLimitSecs) * 100;
  const timerUrgent = timeLeft <= 10;

  return (
    <div className="space-y-4">
      {/* Timer */}
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
        <Progress
          value={timerPct}
          className={cn("h-1.5", timerUrgent && "[&>div]:bg-red-500")}
        />
      </div>

      {allFound && (
        <p className="text-center text-xs text-green-600 font-semibold">All found! 🎉</p>
      )}

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
      >
        {allFound
          ? "Submit Answers"
          : `Submit (${remaining} word${remaining !== 1 ? "s" : ""} remaining)`}
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

  // ── Restore answers from sessionStorage if user just returned from login ──
  const storageKey = `game_answers:${round.id}`;
  const savedState = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      sessionStorage.removeItem(storageKey); // consume once
      return JSON.parse(raw) as { answers: (number | string)[]; currentQ: number; startTime: number };
    } catch { return null; }
  })();

  const [currentQ, setCurrentQ] = useState(savedState?.currentQ ?? 0);
  const [answers, setAnswers] = useState<(number | string)[]>(savedState?.answers ?? []);

  // If we restored from sessionStorage, adjust start time so elapsed reflects
  // time already spent before the login redirect.
  const [totalStartTime] = useState(savedState?.startTime ?? Date.now());
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

  // ── Auto-submit on mount when returning from login redirect ──────────────
  // savedState means the user already played but was redirected to login before
  // submitting. Now they're authenticated — submit immediately and show score.
  useEffect(() => {
    if (!savedState) return;
    let cancelled = false;

    const autoSubmit = async () => {
      setWaitingForResult(true);
      const timeTakenMs = Date.now() - (savedState.startTime ?? totalStartTime);
      const result = await onSubmit(
        round.id,
        savedState.answers,
        timeTakenMs
      );
      if (cancelled) return;
      if (result.ok) {
        await refetchLeaderboard();
        setFinalScore(result.score ?? 0);
        onComplete?.();
      } else {
        // Auth failed again (shouldn't happen) — let them retry
        setWaitingForResult(false);
      }
    };

    autoSubmit();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } else if (waitingForResult) {
      // auto-submit is in flight — show the submitting spinner below
    } else {
      return (
        <WordPuzzleRoundPlayer
          questions={questions}
          initialFoundWords={
            savedState?.answers
              ? (savedState.answers as string[]).filter(Boolean)
              : undefined
          }
          onAllComplete={async (wordAnswers) => {
            setWaitingForResult(true);
            const timeTakenMs = Date.now() - totalStartTime;
            const result = await onSubmit(
              round.id,
              wordAnswers,
              timeTakenMs
            );
            if (result.ok) {
              await refetchLeaderboard();
              setFinalScore(result.score ?? 0);
              onComplete?.();
            } else {
              // If submit returned false (auth redirect), save word answers
              try {
                sessionStorage.setItem(
                  `game_answers:${round.id}`,
                  JSON.stringify({
                    answers: wordAnswers,
                    currentQ: 0,
                    startTime: Date.now() - timeTakenMs,
                  })
                );
              } catch { /* ignore */ }
              setWaitingForResult(false);
            }
          }}
        />
      );
    }
  }

  const advance = async (
    _selectedAnswer: number | string,
    allAnswers: (number | string)[]
  ) => {
    if (!isLast) {
      setCurrentQ((c) => c + 1);
      setQStartTime(Date.now());
      setFlash(null);
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
    // correctAnswerIndex is the numeric index stored in config.questions
    const correctIdx: number = q?.correctAnswerIndex ?? 0;
    const isCorrect = idx === correctIdx;

    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setFlash({ selected: idx, correct: correctIdx, isCorrect });

    // Auto-advance after 800 ms
    setTimeout(() => advance(idx, newAnswers), 800);
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
  // isJoined from /v1/game-sessions/:id response, fall back to local state.
  // Local state wins if true — covers unauthenticated users who joined locally.
  const isJoined = isJoinedProp || (sessionData?.isJoined ?? false);

  // Build submitted rounds from session rounds[].hasPlayed + local fallback
  const apiPlayedRounds = new Set<string>(
    (sessionData?.rounds ?? [])
      .filter((r: any) => r.hasPlayed)
      .map((r: any) => r.id as string)
  );
  const submittedRounds = new Set<string>([...apiPlayedRounds, ...playedRounds]);

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
              onClick={() => { onJoin(); }}
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
  /** Pre-select a session id (restored from ?session= URL param after login) */
  initialSessionId?: string;
  /** Pre-select a round id to jump straight into playing (restored from ?round= URL param) */
  initialRoundId?: string;
  /** Called whenever active session/round changes so the parent can sync the URL */
  onGameStateChange?: (sessionId: string | null, roundId: string | null) => void;
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
export function EventGamesTab({
  event: eventProp,
  initialSessionId,
  initialRoundId,
  onGameStateChange,
}: EventGamesTabProps) {
  const requireAuth = useRequireAuth();
  const isLoggedIn = !!Cookies.get("accessToken");

  const { data: eventDetails } = useGetEventDetailsQuery(
    eventProp?.id,
    { skip: !eventProp?.id, refetchOnMountOrArgChange: true }
  );
  const event = eventDetails?.data ?? eventProp;

  // Use the dedicated endpoint to check if the user has joined the active game.
  // Skip entirely for unauthenticated users — they join locally only.
  const {
    data: gameStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchGameStatus,
  } = useGetActiveGameStatusQuery(event?.id, {
    skip: !event?.id || !isLoggedIn,
    refetchOnMountOrArgChange: true,
  });

  // isJoined from the status endpoint — true once the user has called /join
  const isJoinedFromStatus: boolean = gameStatusData?.data?.isJoined ?? false;
  // The active session id from the status response — use to pre-select the session
  const activeSessionIdFromStatus: string | undefined = gameStatusData?.data?.session?.id;

  const { data: gamesData, isLoading } = useGetGamesQuery(event?.id, {
    skip: !event?.id,
    refetchOnMountOrArgChange: true,
  });
  const [joinSession, { isLoading: isJoining }] = useJoinGameSessionMutation();
  const [submitAnswers, { isLoading: isSubmitting }] = useSubmitRoundAnswersMutation();
  const [anonymousJoin] = useAnonymousJoinGameMutation();
  const [anonymousSubmit] = useAnonymousSubmitRoundMutation();
  const [anonId, setAnonId] = useState<string | null>(() => getAnonymousId());

  const [activePhase, setActivePhase] = useState<PhaseTab>("pre-event");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessionId ?? null
  );
  const [playingRoundId, setPlayingRoundId] = useState<string | null>(
    initialRoundId ?? null
  );

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
    const isLoggedIn = !!Cookies.get("accessToken");

    if (!isLoggedIn) {
      const sessionData = sessionDataMap[sessionId];
      const shareToken: string | undefined = sessionData?.shareToken;
      if (shareToken) {
        try {
          const existingAnonId = getAnonymousId();
          const res = await anonymousJoin({ token: shareToken, anonymousId: existingAnonId ?? undefined }).unwrap();
          const payload = (res?.data ?? res) as { anonymousId: string; sessionId: string; eventId: string; eventName: string };
          saveAnonSession(payload.anonymousId, {
            sessionId: payload.sessionId,
            eventId: payload.eventId,
            eventName: payload.eventName,
          });
          setAnonId(payload.anonymousId);
        } catch {
          // Fall through to local-only join if the call fails
        }
      }
      markSessionJoined(sessionId);
      setActiveSessionId(sessionId);
      onGameStateChange?.(sessionId, null);
      toast.success("You're in! Sign in after to save your score.");
      return;
    }

    try {
      await joinSession(sessionId).unwrap();
      markSessionJoined(sessionId);
      setActiveSessionId(sessionId);
      onGameStateChange?.(sessionId, null);
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
    const effectiveAnonId = anonId ?? getAnonymousId();
    const isLoggedIn = !!Cookies.get("accessToken");

    if (!isLoggedIn && effectiveAnonId) {
      try {
        const res = await anonymousSubmit({
          roundId,
          anonymousId: effectiveAnonId,
          answers,
          metadata: { timeTakenMs },
        }).unwrap();
        const payload = (res?.data ?? res) as { score: number };
        toast.success("Answers submitted!");
        markRoundPlayed(roundId);
        return { ok: true, score: payload.score ?? 0 };
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Submission failed.");
        return { ok: false };
      }
    }

    if (!isLoggedIn) {
      // No anonymousId — redirect to login so they can authenticate and replay
      if (!requireAuth({
        tab: "games",
        ...(activeSessionId ? { session: activeSessionId } : {}),
        ...(roundId ? { round: roundId } : {}),
      })) {
        try {
          sessionStorage.setItem(
            `game_answers:${roundId}`,
            JSON.stringify({ answers, currentQ: answers.length - 1, startTime: Date.now() - timeTakenMs })
          );
        } catch { /* sessionStorage may be unavailable */ }
        return { ok: false };
      }
    }

    // Ensure the session is joined server-side before submitting.
    // Always attempt this — the server handles duplicates gracefully, and it
    // guarantees the user is joined even if the auto-join effect hasn't resolved yet.
    if (activeSessionId) {
      try {
        await joinSession(activeSessionId).unwrap();
        markSessionJoined(activeSessionId);
      } catch {
        // Ignore — already joined or session ended
      }
    }

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
            onClick={() => {
              setPlayingRoundId(null);
              onGameStateChange?.(activeSessionId, null);
            }}
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
              onGameStateChange?.(session.id, roundId);
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
