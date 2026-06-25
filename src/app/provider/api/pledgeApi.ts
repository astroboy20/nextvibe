import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Tier IDs from the API spec
export type PledgeTierId =
  | "vibewatcher"
  | "vibesupporter"
  | "vibefan"
  | "vibeenthusiast"
  | "vibechampion"
  | "vibepatron"
  | "vibemaestro"
  | "vibeking";

export interface PledgeStatus {
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED";
  pledge: {
    tierName: string;
    quantity: number;
    totalUsd: string;
    totalNgn: string;
    paidAt: string | null;
  } | null;
}

export const pledgeApi = createApi({
  reducerPath: "pledgeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Pledges"],

  endpoints: (builder) => ({
    /**
     * POST /v1/pledges/initiate
     * Public — works for guests and logged-in users.
     * Returns checkoutUrl — redirect user there.
     */
    initiatePledge: builder.mutation<
      {
        pledgeId: string;
        checkoutUrl: string;
        totalNgn: number;
        totalUsd: number;
        expiresAt: string;
      },
      {
        tierId: PledgeTierId;
        quantity: number;
        /** Required for guests */
        email?: string;
        /** Required for guests */
        name?: string;
      }
    >({
      query: (body) => ({
        url: "/v1/pledges/initiate",
        method: "POST",
        body,
      }),
    }),

    /**
     * GET /v1/pledges/verify/:pledgeId
     * Public — poll after Ercaspay redirects back.
     */
    verifyPledge: builder.query<PledgeStatus, string>({
      query: (pledgeId) => `/v1/pledges/verify/${pledgeId}`,
    }),

    /**
     * GET /v1/pledges/my
     * Auth required — all pledges for the authenticated user.
     */
    getMyPledges: builder.query<any, void>({
      query: () => "/v1/pledges/my",
      providesTags: ["Pledges"],
    }),
  }),
});

export const {
  useInitiatePledgeMutation,
  useVerifyPledgeQuery,
  useLazyVerifyPledgeQuery,
  useGetMyPledgesQuery,
} = pledgeApi;
