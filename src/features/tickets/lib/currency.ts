/**
 * Currencies a ticket can be priced in. Mirrors the backend's EVENT_CURRENCIES
 * (`events/event-currency.ts`): an event sells in one of these, set by its
 * first paid tier.
 */
export const TICKET_CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "Naira (₦)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
] as const;

export type TicketCurrency = (typeof TICKET_CURRENCIES)[number]["code"];

export function currencySymbol(code?: string | null): string {
  return TICKET_CURRENCIES.find((c) => c.code === code)?.symbol ?? "₦";
}

export function formatTicketPrice(price: number, currency?: string | null): string {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/** The currency an event's tiers are locked to: its first paid tier's, if any. */
export function lockedTicketCurrency(
  tiers: { price: number | string; currency?: string }[] | undefined,
): TicketCurrency | null {
  const paid = tiers?.find((t) => Number(t.price) > 0);
  return (paid?.currency as TicketCurrency | undefined) ?? null;
}
