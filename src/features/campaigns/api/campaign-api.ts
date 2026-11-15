import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignTier = "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
export type CampaignCurrency = "USD" | "NGN";

export interface CampaignStats {
  signedUp: number;
  spotsRemaining: number;
  total: number;
  isFull: boolean;
}

export interface TierQuote {
  tier: CampaignTier;
  baseAmount: number;
  amountDue: number;
  depositPercent: number;
}

export interface SignupPayload {
  email: string;
  tier: CampaignTier;
  eventDate: string;
}

export interface SignupResponse {
  paymentId: string;
  paymentReference: string;
  tier: CampaignTier;
  baseAmount: number;
  amountDue: number;
  checkoutUrl: string;
  expiresAt: string;
  status: string;
}

export interface VerifyResponse {
  status: "completed" | "pending" | "failed";
  paymentId: string;
  redemptionCode?: string;
}

// ─── Christmas campaign types ─────────────────────────────────────────────────

export interface ChristmasQuoteResponse {
  prices: Record<CampaignCurrency, Partial<Record<CampaignTier, number>>>;
}

export interface ChristmasSignupPayload {
  email: string;
  tier: CampaignTier;
  eventDate: string; // YYYY-MM-DD, as picked — never use toISOString()
  currency?: CampaignCurrency; // defaults to USD on the server
}

export interface ChristmasSignupResponse {
  paymentId: string;
  paymentReference: string;
  tier: CampaignTier;
  amountDue: number;
  currency: CampaignCurrency;
  checkoutUrl: string;
  expiresAt: string;
  status: "PENDING";
}

export interface ChristmasVerifyResponse {
  status: "completed" | "failed" | "pending";
  paymentId: string;
}

// ─── API slice ────────────────────────────────────────────────────────────────
// Campaign endpoints are fully public — no auth token needed.
// We intentionally use a plain fetchBaseQuery (no reauth wrapper) since these
// are pre-signup landing-page endpoints for users who may not have an account.

export const campaignApi = createApi({
  reducerPath: "campaignApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["CampaignStats"],
  keepUnusedDataFor: 30,

  endpoints: (build) => ({
    /** GET /v1/campaigns/birthday/stats — live spots count */
    getBirthdayStats: build.query<CampaignStats, void>({
      query: () => "/v1/campaigns/birthday/stats",
      transformResponse: (res: { data?: CampaignStats } & CampaignStats) =>
        res.data ?? res,
      providesTags: ["CampaignStats"],
    }),

    /** GET /v1/campaigns/birthday/quote?tier=SMALL — deposit price for a tier */
    getBirthdayQuote: build.query<TierQuote, CampaignTier>({
      query: (tier) => `/v1/campaigns/birthday/quote?tier=${tier}`,
      transformResponse: (res: { data?: TierQuote } & TierQuote) =>
        res.data ?? res,
    }),

    /** POST /v1/campaigns/birthday/signup — claim a spot, returns checkoutUrl */
    signupBirthday: build.mutation<SignupResponse, SignupPayload>({
      query: (body) => ({
        url: "/v1/campaigns/birthday/signup",
        method: "POST",
        body,
      }),
      transformResponse: (res: { data?: SignupResponse } & SignupResponse) =>
        res.data ?? res,
      invalidatesTags: ["CampaignStats"],
    }),

    /** GET /v1/campaigns/birthday/verify/:paymentId — verify after Ercaspay redirect */
    verifyBirthdayPayment: build.query<VerifyResponse, string>({
      query: (paymentId) => `/v1/campaigns/birthday/verify/${paymentId}`,
      transformResponse: (res: { data?: VerifyResponse } & VerifyResponse) =>
        res.data ?? res,
    }),

    // ── Christmas campaign ───────────────────────────────────────────────────

    /** GET /v1/campaigns/christmas/quote — prices for every tier in USD and NGN */
    getChristmasQuote: build.query<ChristmasQuoteResponse, void>({
      query: () => "/v1/campaigns/christmas/quote",
      transformResponse: (
        res: { data?: ChristmasQuoteResponse } & ChristmasQuoteResponse
      ) => res.data ?? res,
    }),

    /** GET /v1/campaigns/christmas/stats — live spots count */
    getChristmasStats: build.query<CampaignStats, void>({
      query: () => "/v1/campaigns/christmas/stats",
      transformResponse: (res: { data?: CampaignStats } & CampaignStats) =>
        res.data ?? res,
      providesTags: ["CampaignStats"],
    }),

    /** POST /v1/campaigns/christmas/signup — claim a spot, returns checkoutUrl */
    signupChristmas: build.mutation<
      ChristmasSignupResponse,
      ChristmasSignupPayload
    >({
      query: (body) => ({
        url: "/v1/campaigns/christmas/signup",
        method: "POST",
        body,
        // Keep the full Referer URL so Bachs can redirect back to the campaign page
        // (fetch referrerPolicy is set in the component layer for cross-origin cases)
      }),
      transformResponse: (
        res: { data?: ChristmasSignupResponse } & ChristmasSignupResponse
      ) => res.data ?? res,
      invalidatesTags: ["CampaignStats"],
    }),

    /** GET /v1/campaigns/christmas/verify/:paymentId — poll after Bachs redirect */
    verifyChristmasPayment: build.query<ChristmasVerifyResponse, string>({
      query: (paymentId) => `/v1/campaigns/christmas/verify/${paymentId}`,
      transformResponse: (
        res: { data?: ChristmasVerifyResponse } & ChristmasVerifyResponse
      ) => res.data ?? res,
    }),
  }),
});

export const {
  useGetBirthdayStatsQuery,
  useLazyGetBirthdayQuoteQuery,
  useSignupBirthdayMutation,
  useLazyVerifyBirthdayPaymentQuery,
  useGetChristmasQuoteQuery,
  useGetChristmasStatsQuery,
  useSignupChristmasMutation,
  useLazyVerifyChristmasPaymentQuery,
} = campaignApi;
