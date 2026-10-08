const STORAGE_KEY = 'nv_anon_game';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AnonPendingSession {
  sessionId: string;
  eventId: string;
  eventName: string;
}

interface AnonGameStore {
  anonymousId: string;
  expiresAt: number;
  pendingSessions: AnonPendingSession[];
  /**
   * Event ids where the guest has already dismissed the post-score login
   * prompt, so it is shown at most once per event rather than after every
   * round. Values are timestamps, kept for debugging only — presence of the
   * key is what suppresses the prompt.
   *
   * Lives in this store rather than its own key so it inherits the same 7-day
   * TTL: a guest who comes back a week later is a new prospect, not a nagged
   * one. It is also wiped by `clearAnonGameData()` after a successful merge,
   * which is correct — once they are signed in the prompt is moot.
   */
  dismissedPrompts?: Record<string, number>;
}

function readStore(): AnonGameStore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store: AnonGameStore = JSON.parse(raw);
    if (Date.now() > store.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return store;
  } catch {
    return null;
  }
}

function writeStore(store: AnonGameStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAnonymousId(): string | null {
  return readStore()?.anonymousId ?? null;
}

export function saveAnonSession(
  anonymousId: string,
  session: AnonPendingSession,
): void {
  const existing = readStore();
  const store: AnonGameStore = existing ?? {
    anonymousId,
    expiresAt: Date.now() + TTL_MS,
    pendingSessions: [],
  };
  store.anonymousId = anonymousId;
  if (!store.pendingSessions.find((s) => s.sessionId === session.sessionId)) {
    store.pendingSessions.push(session);
  }
  writeStore(store);
}

export function getPendingSessions(): AnonPendingSession[] {
  return readStore()?.pendingSessions ?? [];
}

export function clearAnonGameData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Has this guest already waved away the login prompt for this event?
 *
 * Fails open: no store, unreadable store, or a store without the field all
 * return false, so a storage problem shows the prompt rather than silently
 * suppressing it forever.
 */
export function isScorePromptDismissed(eventId: string): boolean {
  if (!eventId) return false;
  return Boolean(readStore()?.dismissedPrompts?.[eventId]);
}

/**
 * Remember that the prompt was dismissed for this event.
 *
 * No-ops when there is no store, which can only happen if the guest never
 * joined a game — in which case there was no score screen to dismiss.
 */
export function dismissScorePrompt(eventId: string): void {
  if (!eventId) return;
  const store = readStore();
  if (!store) return;
  store.dismissedPrompts = { ...store.dismissedPrompts, [eventId]: Date.now() };
  writeStore(store);
}
