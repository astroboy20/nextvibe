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
