/**
 * Money formatting for a multicurrency world.
 *
 * The backend sends amounts as STRINGS (Postgres DECIMAL serialised), because a
 * JS number can't hold every decimal value exactly. Format them for display;
 * don't do arithmetic on them client-side. If you need a total, ask the server.
 */

/** Minor-unit counts per ISO 4217. Not every currency uses 2. */
const CURRENCY_DECIMALS: Record<string, number> = {
  NGN: 2,
  USD: 2,
  GBP: 2,
  EUR: 2,
  CAD: 2,
  GHS: 2,
  KES: 2,
  ZAR: 2,
  JPY: 0,
};

/**
 * Formats a money string for display.
 *
 * Uses `Intl.NumberFormat` with the currency code so each currency gets its own
 * correct symbol and decimal count — rather than the old approach of hardcoding
 * "₦" and `en-NG`, which mislabels every non-Nigerian amount.
 */
export function formatMoney(
  amount: string | number | null | undefined,
  currency: string,
  opts: { compact?: boolean } = {},
): string {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);

  if (!Number.isFinite(value)) return `${currency} —`;

  const decimals = CURRENCY_DECIMALS[currency] ?? 2;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: opts.compact ? 0 : decimals,
      maximumFractionDigits: decimals,
      notation: opts.compact ? "compact" : "standard",
    }).format(value);
  } catch {
    // Intl throws on an unknown currency code — fall back rather than crash a
    // whole earnings page because one currency isn't in the runtime's list.
    return `${currency} ${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
}

/** True when a money string is greater than zero, without float arithmetic. */
export function isPositive(amount: string | number | null | undefined): boolean {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return Number.isFinite(value) && value > 0;
}

/** Parses a money string to a number, for comparisons only — never for display. */
export function toNumber(amount: string | number | null | undefined): number {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency] ?? 2;
}
