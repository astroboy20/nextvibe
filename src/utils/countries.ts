/**
 * Countries offered in the payout form, each with the currency its banks
 * actually settle in.
 *
 * The list is deliberately not "every country": it covers the currencies the
 * ledger supports (see the backend's SUPPORTED_CURRENCIES) plus the eurozone,
 * because offering a country we cannot pay out to is worse than not listing it.
 *
 * `currency` is a hint used to preselect the currency field when the country
 * changes — never a constraint. Someone may genuinely hold a USD account with a
 * bank outside the US, so the currency select stays editable afterwards.
 */
export interface Country {
  /** ISO 3166-1 alpha-2. */
  code: string;
  name: string;
  /** ISO 4217 code this country's banks normally settle in. */
  currency: string;
}

export const COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "CA", name: "Canada", currency: "CAD" },

  // Eurozone — all EUR.
  { code: "AT", name: "Austria", currency: "EUR" },
  { code: "BE", name: "Belgium", currency: "EUR" },
  { code: "CY", name: "Cyprus", currency: "EUR" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "EE", name: "Estonia", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
  { code: "FI", name: "Finland", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "GR", name: "Greece", currency: "EUR" },
  { code: "HR", name: "Croatia", currency: "EUR" },
  { code: "IE", name: "Ireland", currency: "EUR" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "LT", name: "Lithuania", currency: "EUR" },
  { code: "LU", name: "Luxembourg", currency: "EUR" },
  { code: "LV", name: "Latvia", currency: "EUR" },
  { code: "MT", name: "Malta", currency: "EUR" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "PT", name: "Portugal", currency: "EUR" },
  { code: "SI", name: "Slovenia", currency: "EUR" },
  { code: "SK", name: "Slovakia", currency: "EUR" },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function findCountry(code: string | undefined | null): Country | undefined {
  return code ? BY_CODE.get(code.toUpperCase()) : undefined;
}

/**
 * The currency a country's banks settle in, or undefined if we don't list it.
 * Undefined means "leave the current selection alone" — guessing a currency for
 * an unknown country would be worse than showing whatever is already chosen.
 */
export function currencyForCountry(code: string | undefined | null): string | undefined {
  return findCountry(code)?.currency;
}
