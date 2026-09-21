"use client";

import { useEffect, useState } from "react";
import { AuthBottomSheet } from "@/components/auth-bottom-sheet";
import { AnonymousMergeDialog } from "@/components/anonymous-merge-dialog";
import { useAnonMerge } from "@/hooks/use-anon-merge";
import {
  dismissScorePrompt,
  isScorePromptDismissed,
} from "@/lib/anonymous-game";

/**
 * How long the score sits alone before the sheet slides up.
 *
 * The pitch is "claim your #3 spot", which only lands if they have already
 * *read* the #3. Firing on the same frame as the score covers the reward
 * before it registers and throws away the number the argument rests on.
 */
const BEAT_MS = 1800;

/**
 * Leaderboard size the API returns. Beyond this the board is truncated, so a
 * score behind every visible entry has an unknowable true rank.
 */
const LEADERBOARD_CAP = 50;

/**
 * Where this score *would* place if the guest signed in.
 *
 * Computed client-side because the anonymous submit endpoint returns only
 * `{ score, roundId, shareToken }` — guests have no `GameSessionEntry`, so
 * there is no server-side rank for them to read. The session leaderboard is
 * `@Public()`, though, so the entries needed to work it out are already
 * fetched and on screen.
 *
 * Returns null when the answer would be a guess rather than a fact: an empty
 * board, or a score behind every entry on a board that is already at the cap.
 * A wrong number here is worse than no number — it is the entire pitch.
 */
export function wouldBeRank(
  entries: unknown,
  score: number,
): number | null {
  if (!Array.isArray(entries)) return null;
  if (entries.length === 0) return 1;

  const scores = entries.map(
    (e: { totalScore?: number; score?: number }) => e?.totalScore ?? e?.score ?? 0,
  );
  const ahead = scores.filter((s) => s > score).length;

  if (ahead === entries.length && entries.length >= LEADERBOARD_CAP) return null;

  return ahead + 1;
}

interface AnonScorePromptProps {
  /** Dismissal is remembered per event, so this is the key. */
  eventId?: string;
  /** The score just earned, used to work out the would-be rank. */
  score: number;
  /** Raw `leaderboardData.data.entries`; safe to pass undefined. */
  entries?: unknown;
  /** Fired after a successful login *and* merge — refetch the leaderboard here. */
  onAuthSuccess?: () => void;
}

/**
 * Post-score login prompt for players who are not signed in.
 *
 * Guests are already scored server-side against their anonymous id, so nothing
 * is lost by not signing in *yet* — but the score never reaches the leaderboard
 * until it is merged onto a real account, and people forget. This escalates the
 * existing passive banner into something that asks once, at the moment the
 * score means the most.
 *
 * Auth happens in-place via `AuthBottomSheet` rather than redirecting to
 * `/auth/login?from=` — the score stays on screen, and there is no round trip
 * to survive. `useAnonMerge` then folds the guest's Redis-cached rounds onto
 * the new account: silently when only one event is pending, via the existing
 * confirmation dialog when several are.
 */
export function AnonScorePrompt({
  eventId,
  score,
  entries,
  onAuthSuccess,
}: AnonScorePromptProps) {
  const [open, setOpen] = useState(false);
  const {
    pendingSessions,
    showDialog,
    isLoading: isMerging,
    handlePostAuth,
    confirmMerge,
    skipMerge,
  } = useAnonMerge();

  useEffect(() => {
    if (eventId && isScorePromptDismissed(eventId)) return;

    const timer = setTimeout(() => setOpen(true), BEAT_MS);
    // Clearing matters: without it, leaving the score screen inside the beat
    // pops the sheet over whatever the player navigated to next.
    return () => clearTimeout(timer);
  }, [eventId]);

  const finish = () => {
    setOpen(false);
    onAuthSuccess?.();
  };

  const rank = wouldBeRank(entries, score);

  return (
    <>
      <AuthBottomSheet
        open={open}
        prompt={
          rank
            ? `You'd be #${rank} — sign in to claim your spot on the leaderboard.`
            : "Sign in to save your score to the leaderboard."
        }
        onClose={() => {
          // Only a deliberate dismissal is remembered. Signing in takes the
          // other branch, so a successful login never writes a suppression that
          // would outlive the account it was made under.
          if (eventId) dismissScorePrompt(eventId);
          setOpen(false);
        }}
        onSuccess={() => {
          // Close before merging. `handlePostAuth` shows the merge dialog when
          // several events are pending, and leaving an auth form stacked under
          // it — for a user who is already signed in by that point — reads as a
          // broken screen.
          setOpen(false);
          void handlePostAuth(finish);
        }}
      />

      {showDialog && (
        <AnonymousMergeDialog
          sessions={pendingSessions}
          isLoading={isMerging}
          onConfirm={(ids) => confirmMerge(ids, finish)}
          onSkip={() => skipMerge(finish)}
        />
      )}
    </>
  );
}
