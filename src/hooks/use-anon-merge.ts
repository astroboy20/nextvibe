"use client";

import { useState } from "react";
import { getPendingSessions, clearAnonGameData, getAnonymousId, type AnonPendingSession } from "@/lib/anonymous-game";
import { useMergeAnonymousSessionsMutation } from "@/app/provider/api/eventApi";

export function useAnonMerge() {
  const [mergeSessions, { isLoading }] = useMergeAnonymousSessionsMutation();
  const [pendingSessions, setPendingSessions] = useState<AnonPendingSession[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  function checkPending() {
    const sessions = getPendingSessions();
    if (sessions.length === 0) return false;
    setPendingSessions(sessions);
    return true;
  }

  async function mergeAndClear(confirmedEventIds: string[]) {
    const anonymousId = getAnonymousId();
    if (!anonymousId) {
      clearAnonGameData();
      setShowDialog(false);
      return;
    }
    try {
      await mergeSessions({ anonymousId, confirmedEventIds }).unwrap();
    } catch {
      // best-effort — don't block the user if merge fails
    } finally {
      clearAnonGameData();
      setShowDialog(false);
    }
  }

  async function handlePostAuth(onDone: () => void) {
    const hasPending = checkPending();
    if (!hasPending) {
      onDone();
      return;
    }

    const sessions = getPendingSessions();
    const uniqueEventIds = [...new Set(sessions.map((s) => s.eventId))];

    if (uniqueEventIds.length === 1) {
      await mergeAndClear(uniqueEventIds);
      onDone();
    } else {
      setShowDialog(true);
    }
  }

  async function confirmMerge(confirmedEventIds: string[], onDone: () => void) {
    await mergeAndClear(confirmedEventIds);
    onDone();
  }

  function skipMerge(onDone: () => void) {
    clearAnonGameData();
    setShowDialog(false);
    onDone();
  }

  return {
    pendingSessions,
    showDialog,
    isLoading,
    handlePostAuth,
    confirmMerge,
    skipMerge,
  };
}
