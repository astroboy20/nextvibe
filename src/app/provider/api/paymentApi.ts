import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const paymentApi = createApi({
  reducerPath: "paymentApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Purchases"],

  endpoints: (builder) => ({
    /** POST /v1/payments/purchase — initiate ticket purchase, returns paymentUrl + purchaseId */
    initiatePurchase: builder.mutation<
      {
        success: boolean;
        data: {
          purchaseId: string;
          paymentUrl: string;
          reference: string;
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

    /** GET /v1/payments/verify/{purchaseId} — verify payment status */
    verifyPurchase: builder.query<
      {
        success: boolean;
        data: {
          status: "PENDING" | "SUCCESS" | "FAILED";
          purchaseId: string;
        };
      },
      string
    >({
      query: (purchaseId) => `/v1/payments/verify/${purchaseId}`,
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

    /** GET /v1/payments/purchases/{id} — single purchase detail */
    getPurchaseById: builder.query<any, string>({
      query: (id) => `/v1/payments/purchases/${id}`,
    }),
  }),
});

export const {
  useInitiatePurchaseMutation,
  useVerifyPurchaseQuery,
  useLazyVerifyPurchaseQuery,
  useGetUserPurchasesQuery,
  useGetPurchaseByIdQuery,
} = paymentApi;
