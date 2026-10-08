"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Accumulates successive pages of a paginated query into one list.
 *
 * A "Load more" button that only bumps a page number gives you the *next*
 * page, not the list so far — the query re-runs with `page: 2` and the
 * component renders 40 postcards replacing the previous 40. This keeps the
 * earlier pages around.
 *
 * Pages are stored **keyed by page number**, not pushed onto an array. That
 * makes it idempotent: re-receiving page 2 (a refetch, a re-render, a cache
 * invalidation) overwrites slot 2 instead of appending a second copy. Pushing
 * would duplicate every item the moment anything refetched.
 *
 * `resetKey` is whatever changes when the list should start over — a filter, a
 * tab, an id. The comparison happens *inside* the state updater rather than in
 * a separate effect, so a page arriving in the same tick as a filter change
 * can't land in the old list before the reset runs.
 *
 * Pass the raw array straight from the query, not a filtered or defaulted copy:
 * `data?.data?.data` keeps a stable reference between renders while the cache
 * entry is unchanged, but `(... ?? []).filter(...)` is a new array every render
 * and would re-run the effect forever. Filter the result instead.
 */
export function useAccumulatedPages<T>(
  pageItems: T[] | undefined,
  page: number,
  resetKey: unknown = null,
): T[] {
  const [state, setState] = useState<{
    key: unknown;
    pages: Record<number, T[]>;
  }>({ key: resetKey, pages: {} });

  useEffect(() => {
    if (!pageItems) return;
    setState((s) =>
      s.key !== resetKey
        ? { key: resetKey, pages: { [page]: pageItems } }
        : { key: s.key, pages: { ...s.pages, [page]: pageItems } },
    );
  }, [pageItems, page, resetKey]);

  return useMemo(
    () =>
      Object.keys(state.pages)
        .map(Number)
        .sort((a, b) => a - b)
        .flatMap((n) => state.pages[n]),
    [state.pages],
  );
}
