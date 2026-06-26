import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PurchaseSummary {
  purchaseId: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paidAt: string | null;
  totalAmount: number;
  currency: string;
  customerName: string;
  event: {
    id: string;
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
    locationName: string;
    flierUrl: string | null;
    mode: string;
  };
  tickets: Array<{
    ticketNumber: string;
    tierName: string;
    tierPrice: number;
    status: "VALID" | "USED" | "CANCELLED";
    qrCode: string;
  }>;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Purchases"],
  keepUnusedDataFor: 300,

  endpoints: (builder) => ({
    /** POST /v1/payments/purchase — initiate ticket purchase → checkoutUrl + purchaseId */
    initiatePurchase: builder.mutation<
      {
        success: boolean;
        data: {
          purchaseId: string;
          paymentReference: string;
          totalAmount: number;
          checkoutUrl: string;
          expiresAt: string;
        };
      },
      {
        eventId: string;
        ticketTiers: { tierId: string; quantity: number }[];
      }
    >({
      query: (body) => ({
        url: "/v1/payments/purchase",
        method: "POST",
        body,
      }),
    }),

    /** GET /v1/payments/purchases/:purchaseId/summary — public, for confirmation page */
    getPurchaseSummary: builder.query<
      { success: boolean; data: PurchaseSummary },
      string
    >({
      query: (purchaseId) => `/v1/payments/purchases/${purchaseId}/summary`,
    }),

    /** GET /v1/payments/purchases?limit=20&page=1 — user's purchase history */
    getUserPurchases: builder.query<any, { limit?: number; page?: number } | void>({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.limit) p.set("limit", String(params.limit));
        if (params?.page) p.set("page", String(params.page));
        const qs = p.toString();
        return `/v1/payments/purchases${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Purchases"],
    }),

    /** GET /v1/payments/purchases/:id — full purchase detail (auth-gated) */
    getPurchaseById: builder.query<any, string>({
      query: (id) => `/v1/payments/purchases/${id}`,
    }),
  }),
});

export const {
  useInitiatePurchaseMutation,
  useGetPurchaseSummaryQuery,
  useGetUserPurchasesQuery,
  useGetPurchaseByIdQuery,
} = paymentApi;
