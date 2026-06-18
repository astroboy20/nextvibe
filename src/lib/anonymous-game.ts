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
