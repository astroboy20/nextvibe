import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/api/baseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AffiliateProfile {
  id: string;
  userId: string;
  affiliateCode: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  referralCode?: string;
}

export interface AffiliateMetrics {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  paidOutBalance: number;
  totalReferrals: number;
  convertedReferrals: number;
}

export type AffiliateEarningStatus =
  | "PENDING"
  | "AVAILABLE"
  | "PAID_OUT"
  | "CANCELLED";

export interface AffiliateEarningItem {
  id: string;
  amount: number;
  baseAmount: number;
  rateApplied: number;
  currency: string;
  status: AffiliateEarningStatus;
  createdAt: string;
  eventName: string | null;
  planType: string | null;
  paymentType: string | null;
}

export interface AffiliateReferralItem {
  id: string;
  referredUserId: string;
  createdAt: string;
  organizer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    joinedAt: string;
  };
  completedPurchasesCount: number;
}

export interface AffiliateDashboardResponse {
  profile: AffiliateProfile;
  metrics: AffiliateMetrics;
  recentEarnings: AffiliateEarningItem[];
  recentReferrals: AffiliateReferralItem[];
}

export interface AffiliateStatusResponse {
  isAffiliate: boolean;
  profile: AffiliateProfile | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedReferralsResponse {
  data: AffiliateReferralItem[];
  meta: PaginationMeta;
}

export interface PaginatedEarningsResponse {
  data: AffiliateEarningItem[];
  meta: PaginationMeta;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const affiliateApi = createApi({
  reducerPath: "affiliateApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AffiliateStatus", "AffiliateDashboard", "AffiliateReferrals", "AffiliateEarnings"],
  keepUnusedDataFor: 300,

  endpoints: (builder) => ({
    /**
     * GET /v1/affiliates/me
     * Check whether the logged-in user is a registered affiliate.
     */
    getAffiliateStatus: builder.query<AffiliateStatusResponse, void>({
      query: () => "/v1/affiliates/me",
      providesTags: ["AffiliateStatus"],
    }),

    /**
     * POST /v1/affiliates/register
     * Register the current user as an affiliate. No body required.
     */
    registerAffiliate: builder.mutation<AffiliateStatusResponse, void>({
      query: () => ({
        url: "/v1/affiliates/register",
        method: "POST",
      }),
      invalidatesTags: ["AffiliateStatus", "AffiliateDashboard"],
    }),

    /**
     * GET /v1/affiliates/dashboard
     * Full dashboard in a single request — profile, metrics, recent activity.
     */
    getAffiliateDashboard: builder.query<AffiliateDashboardResponse, void>({
      query: () => "/v1/affiliates/dashboard",
      providesTags: ["AffiliateDashboard"],
    }),

    /**
     * GET /v1/affiliates/referrals?page=1&limit=20
     * Paginated list of referred organizers.
     */
    getAffiliateReferrals: builder.query<
      PaginatedReferralsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.page) p.set("page", String(params.page));
        if (params?.limit) p.set("limit", String(params.limit));
        const qs = p.toString();
        return `/v1/affiliates/referrals${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AffiliateReferrals"],
    }),

    /**
     * GET /v1/affiliates/earnings?page=1&limit=20&status=AVAILABLE
     * Paginated commission earnings ledger.
     */
    getAffiliateEarnings: builder.query<
      PaginatedEarningsResponse,
      { page?: number; limit?: number; status?: AffiliateEarningStatus } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.page) p.set("page", String(params.page));
        if (params?.limit) p.set("limit", String(params.limit));
        if (params?.status) p.set("status", params.status);
        const qs = p.toString();
        return `/v1/affiliates/earnings${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AffiliateEarnings"],
    }),
  }),
});

export const {
  useGetAffiliateStatusQuery,
  useRegisterAffiliateMutation,
  useGetAffiliateDashboardQuery,
  useGetAffiliateReferralsQuery,
  useGetAffiliateEarningsQuery,
} = affiliateApi;
