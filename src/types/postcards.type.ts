/**
 * Postcard phase filtering — the two vocabularies, and the only bridge between
 * them.
 *
 * There are deliberately TWO types here because the app speaks two dialects:
 *
 *  - `PostcardTiming` is the **wire** dialect: exactly the four values the API
 *    accepts, mirroring Prisma's `GameActivityTiming`.
 *  - `PostcardPhase` is the **UI** dialect: the tab labels and URL slugs the
 *    user actually sees, plus `all` for "no filter".
 *
 * Keeping them apart is what stops `MAIN_EVENT` — a UI nickname for
 * `DURING_EVENT` that the backend rejects — from being sendable. If both lived
 * in one union, TypeScript could not tell a valid request from a 400.
 */

/** The four values `?timing=` accepts. Mirrors Prisma's `GameActivityTiming`. */
export const PostcardTiming = {
  PRE_EVENT: "PRE_EVENT",
  DURING_EVENT: "DURING_EVENT",
  POST_EVENT: "POST_EVENT",
  BOTH: "BOTH",
} as const;

export type PostcardTiming =
  (typeof PostcardTiming)[keyof typeof PostcardTiming];

/** Tab values and URL slugs. `all` means "send no filter at all". */
export const POSTCARD_PHASES = [
  "all",
  "pre-event",
  "main-event",
  "post-event",
] as const;

export type PostcardPhase = (typeof POSTCARD_PHASES)[number];

/** A phase that maps to a real wire value — i.e. anything but `all`. */
export type FilterablePostcardPhase = Exclude<PostcardPhase, "all">;

/**
 * slug → wire value.
 *
 * Note `main-event` maps to `DURING_EVENT`: the UI says "Main", the database
 * says "during". `all` is absent on purpose — it has no wire value, and
 * including it would let callers send `?timing=ALL` and earn a 400.
 */
export const PHASE_TO_TIMING = {
  "pre-event": PostcardTiming.PRE_EVENT,
  "main-event": PostcardTiming.DURING_EVENT,
  "post-event": PostcardTiming.POST_EVENT,
} as const satisfies Record<FilterablePostcardPhase, PostcardTiming>;

/**
 * wire value → slug, for labelling a postcard from an API response.
 *
 * Lossy for `BOTH`: a BOTH-tagged vibe tag genuinely spans pre-event *and*
 * during-event, so there is no single correct slug. "main-event" is a display
 * choice, not a fact — never round-trip a BOTH value through this map and
 * expect BOTH back.
 */
export const TIMING_TO_PHASE = {
  PRE_EVENT: "pre-event",
  DURING_EVENT: "main-event",
  POST_EVENT: "post-event",
  BOTH: "main-event",
} as const satisfies Record<PostcardTiming, FilterablePostcardPhase>;

/**
 * The one conversion the API layer should call. Returns `undefined` for `all`,
 * which callers pass straight to the query string builder as "omit this param".
 */
export function phaseToTiming(
  phase?: PostcardPhase,
): PostcardTiming | undefined {
  if (!phase || phase === "all") return undefined;
  return PHASE_TO_TIMING[phase];
}

/** Narrowing guard for untrusted input — a `?phase=` search param, say. */
export function isPostcardPhase(value: unknown): value is PostcardPhase {
  return (
    typeof value === "string" &&
    (POSTCARD_PHASES as readonly string[]).includes(value)
  );
}
