// ─── Event Tiers (auto-determined from capacity) ────────────────────────────

export type EventTier = "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

export const EVENT_TIER_RANGES: Record<EventTier, { min: number; max: number | null }> = {
  MICRO: { min: 1, max: 50 },
  SMALL: { min: 51, max: 200 },
  MEDIUM: { min: 201, max: 500 },
  LARGE: { min: 501, max: 2000 },
  ENTERPRISE: { min: 2001, max: null },
};

// ─── VibeTags Pricing (NGN) ──────────────────────────────────────────────────

export const VIBETAGS_SINGLE_PRICING: Record<EventTier, number> = {
  MICRO: 5000,
  SMALL: 10000,
  MEDIUM: 20000,
  LARGE: 35000,
  ENTERPRISE: 50000,
};

export const VIBETAGS_BUNDLE_PRICING: Record<EventTier, number> = {
  MICRO: 8000,
  SMALL: 15000,
  MEDIUM: 30000,
  LARGE: 50000,
  ENTERPRISE: 75000,
};

// ─── Gamification Pricing (NGN) ──────────────────────────────────────────────

export const GAMIFICATION_SINGLE_PRICING: Record<EventTier, number> = {
  MICRO: 5000,
  SMALL: 10000,
  MEDIUM: 20000,
  LARGE: 35000,
  ENTERPRISE: 50000,
};

export const GAMIFICATION_BUNDLE_PRICING: Record<EventTier, number> = {
  MICRO: 8000,
  SMALL: 15000,
  MEDIUM: 30000,
  LARGE: 50000,
  ENTERPRISE: 75000,
};

// ─── Mega Bundle Pricing (NGN) ───────────────────────────────────────────────

export const MEGA_BUNDLE_SINGLE_PRICING: Record<EventTier, number> = {
  MICRO: 8000,
  SMALL: 15000,
  MEDIUM: 30000,
  LARGE: 55000,
  ENTERPRISE: 85000,
};

export const MEGA_BUNDLE_FULL_PRICING: Record<EventTier, number> = {
  MICRO: 12000,
  SMALL: 25000,
  MEDIUM: 50000,
  LARGE: 85000,
  ENTERPRISE: 135000,
};

// ─── Additional Games (per game, post-publish) ───────────────────────────────

export const ADDITIONAL_GAME_PRICING: Record<EventTier, number> = {
  MICRO: 2000,
  SMALL: 3500,
  MEDIUM: 6000,
  LARGE: 10000,
  ENTERPRISE: 15000,
};

// ─── Volume Discounts ────────────────────────────────────────────────────────

export const VOLUME_DISCOUNTS = [
  { minEvents: 3, maxEvents: 5, discount: 0.10 },    // 10% off
  { minEvents: 6, maxEvents: 11, discount: 0.15 },   // 15% off
  { minEvents: 12, maxEvents: null, discount: 0.20 }, // 20% off
];

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Determine event tier from capacity
 */
export function getEventTier(capacity: number): EventTier {
  if (capacity <= 50) return "MICRO";
  if (capacity <= 200) return "SMALL";
  if (capacity <= 500) return "MEDIUM";
  if (capacity <= 2000) return "LARGE";
  return "ENTERPRISE";
}

/**
 * Calculate volume discount percentage based on events published in last 12 months
 */
export function getVolumeDiscount(eventsInLast12Months: number): number {
  for (const tier of VOLUME_DISCOUNTS) {
    if (eventsInLast12Months >= tier.minEvents && 
        (tier.maxEvents === null || eventsInLast12Months <= tier.maxEvents)) {
      return tier.discount;
    }
  }
  return 0;
}

// ─── Legacy Pricing (deprecated, kept for reference) ─────────────────────────

export const PROMOTION_PRICING: Record<
  string,
  { priceNGN: number; priceUSD: number }
> = {
  "1-100": { priceNGN: 10000, priceUSD: 10 },
  "101-500": { priceNGN: 20000, priceUSD: 20 },
  "501-1000": { priceNGN: 35000, priceUSD: 35 },
  "1001-5000": { priceNGN: 70000, priceUSD: 70 },
  "5000+": { priceNGN: 700000, priceUSD: 700 },
};

export const GAMIFICATION_PRICING: Record<
  string,
  { priceNGN: number; priceUSD: number }
> = {
  "1-100": { priceNGN: 15000, priceUSD: 15 },
  "101-500": { priceNGN: 30000, priceUSD: 30 },
  "501-1000": { priceNGN: 50000, priceUSD: 50 },
  "1001-5000": { priceNGN: 100000, priceUSD: 100 },
  "5000+": { priceNGN: 1000000, priceUSD: 1000 },
};
