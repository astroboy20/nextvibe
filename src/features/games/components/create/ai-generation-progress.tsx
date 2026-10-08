"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * What the organizer sees while a game generates (10-40s, sometimes more).
 *
 * The backend answers in one response, so there is no real progress signal to
 * show. These stages are timed to roughly match what the server is doing —
 * searching, writing, then checking and possibly retrying — so the wait reads
 * as work happening rather than a spinner that might be stuck. The elapsed
 * counter is the honest part: it proves the request is still alive.
 */
const STAGES: { from: number; label: string }[] = [
  { from: 0, label: "Reading your topic…" },
  { from: 4, label: "Researching facts…" },
  { from: 12, label: "Writing questions…" },
  { from: 24, label: "Checking quality…" },
  { from: 38, label: "Taking longer than usual. Still working…" },
];

/**
 * Seconds since mount. Resetting happens by unmounting: the progress line is
 * only rendered while a generation runs, so each run starts from zero
 * without resetting state inside an effect.
 */
function useElapsedSeconds(): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(
      () => setSeconds(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  return seconds;
}

function stageLabel(seconds: number): string {
  let label = STAGES[0].label;
  for (const stage of STAGES) if (seconds >= stage.from) label = stage.label;
  return label;
}

function ProgressLine() {
  const seconds = useElapsedSeconds();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 rounded-lg border border-[#531342]/20 bg-[#531342]/5 px-3 py-2 text-sm text-[#531342]"
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      <span className="flex-1">{stageLabel(seconds)}</span>
      <span className="tabular-nums text-xs text-muted-foreground">
        {seconds}s
      </span>
    </div>
  );
}

export function AiGenerationProgress({ active }: { active: boolean }) {
  return active ? <ProgressLine /> : null;
}
