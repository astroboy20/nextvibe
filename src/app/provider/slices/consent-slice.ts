import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * NDPC Compliance — Consent Slice
 *
 * Tracks user consent preferences for location, notifications, and marketing.
 * State is persisted to localStorage so it survives page reloads.
 * The `locationConsent` field gates geolocation access in the app.
 *
 * Possible values:
 *   null    — not yet asked (show consent dialog on next visit to events page)
 *   true    — user granted consent
 *   false   — user declined (never trigger browser geolocation)
 */

export interface ConsentState {
  /** Whether the user has been shown the location consent dialog */
  locationConsentAsked: boolean;
  /** null = not yet decided, true = granted, false = declined */
  locationConsent: boolean | null;
  /** null = not yet decided, true = opted in, false = opted out */
  marketingConsent: boolean | null;
}

const STORAGE_KEY = "nextvibe_consent";

function loadFromStorage(): Partial<ConsentState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<ConsentState>;
  } catch {
    return {};
  }
}

function saveToStorage(state: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked — silently ignore
  }
}

const persisted = loadFromStorage();

const initialState: ConsentState = {
  locationConsentAsked: persisted.locationConsentAsked ?? false,
  locationConsent: persisted.locationConsent ?? null,
  marketingConsent: persisted.marketingConsent ?? null,
};

const consentSlice = createSlice({
  name: "consent",
  initialState,
  reducers: {
    setLocationConsent(state, action: PayloadAction<boolean>) {
      state.locationConsent = action.payload;
      state.locationConsentAsked = true;
      saveToStorage(state as ConsentState);
    },
    setLocationConsentAsked(state, action: PayloadAction<boolean>) {
      state.locationConsentAsked = action.payload;
      saveToStorage(state as ConsentState);
    },
    setMarketingConsent(state, action: PayloadAction<boolean>) {
      state.marketingConsent = action.payload;
      saveToStorage(state as ConsentState);
    },
    /** Called when the user deletes their account — wipes all consent state */
    clearConsent(state) {
      state.locationConsent = null;
      state.locationConsentAsked = false;
      state.marketingConsent = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});

export const {
  setLocationConsent,
  setLocationConsentAsked,
  setMarketingConsent,
  clearConsent,
} = consentSlice.actions;

export default consentSlice.reducer;
