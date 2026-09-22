"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

/**
 * Rewards — prize tiers, attendee claims, and the organizer's approval flow.
 *
 * Extracted from the old `gameApi`, which had become a legacy slice: 15 of its
 * 21 hooks had no callers, its game CRUD endpoints pointed at `/games` (no
 * `/v1` prefix) rather than the `/v1/events/:id/game-sessions` routes the app
 * actually uses, and its five per-game-type AI `generate*` mutations targeted
 * endpoints the backend replaced with a single `POST /v1/games/ai/generate-draft`.
 * Rewards was the only live part, so it keeps the slice and the dead half goes.
 */

export type RewardType =
    | "CASH" | "COUPON" | "MERCHANDISE" | "FREE_TICKET" | "BADGE" | "POINTS" | "OTHER";

export interface RewardTier {
    id: string;
    rank: number;
    type: RewardType;
    title: string | null;
    description: string | null;
    value: string | null;
}

/**
 * Where a prize has got to. Replaced the `isClaimed` boolean, which couldn't
 * tell a claim the organizer still has to action from one already handed over.
 * WON → CLAIMED → APPROVED → FULFILLED, with REJECTED terminal off CLAIMED.
 */
export type RewardStatus =
    | "WON" | "CLAIMED" | "APPROVED" | "FULFILLED" | "REJECTED";

/**
 * Ordered stages for the attendee's progress bar. REJECTED is deliberately not
 * here — it ends the run rather than sitting on it, so it has no position.
 *
 * `as const` so RewardStage is the four stages and not the whole status union;
 * that way a label map over it is checked for exhaustiveness against exactly
 * the stages the bar renders.
 */
export const REWARD_STAGES = ["WON", "CLAIMED", "APPROVED", "FULFILLED"] as const;
export type RewardStage = (typeof REWARD_STAGES)[number];

export interface Reward {
    id: string;
    gameSessionId: string;
    gameRoundId: string | null;
    userId: string;
    rewardTierId: string;
    status: RewardStatus;
    claimedAt: string | null;
    approvedAt: string | null;
    fulfilledAt: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    fulfilmentNote: string | null;
    createdAt: string;
    rewardTier: RewardTier;
    gameSession: {
        id: string;
        title: string | null;
        event: { id: string; name: string } | null;
    };
}

interface RewardUser {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    email?: string | null;
}

/** One call powering the whole organizer view. */
export interface EventRewardsOverview {
    event: { id: string; name: string };
    sessions: { id: string; title: string | null; status: string }[];
    availableRewards: (RewardTier & {
        gameSessionId: string | null;
        gameRoundId: string | null;
        quantity: number;
        isAwarded: boolean;
    })[];
    qualifiers: {
        userId: string;
        user: RewardUser;
        gameSessionId: string;
        totalScore: number;
        sessionRank: number | null;
        completedAt: string | null;
    }[];
    winners: {
        rewardId: string;
        user: RewardUser;
        session: { id: string; title: string | null };
        reward: RewardTier;
        status: RewardStatus;
        awardedAt: string;
        claimedAt: string | null;
        approvedAt: string | null;
        fulfilledAt: string | null;
        rejectedAt: string | null;
        rejectionReason: string | null;
        fulfilmentNote: string | null;
    }[];
    counts: {
        awaitingReview: number;
        awaitingHandover: number;
        fulfilled: number;
        unclaimed: number;
    };
}

export interface RewardsResponse {
    success: boolean;
    data: Reward[];
}

export interface ClaimRewardResponse {
    success: boolean;
    data: Reward;
}

export const rewardsApi = createApi({
    reducerPath: "rewardsApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Rewards"],
    endpoints: (build) => ({
        // =======================
        // Rewards (redemption)
        // =======================
        getMyRewards: build.query<RewardsResponse, void>({
            query: () => "/v1/my/rewards",
            providesTags: ["Rewards"],
        }),

        claimReward: build.mutation<ClaimRewardResponse, string>({
            query: (rewardId) => ({
                url: `/v1/rewards/${rewardId}/claim`,
                method: "POST",
            }),
            invalidatesTags: ["Rewards"],
        }),

        // =======================
        // Rewards (organizer)
        // =======================
        getEventRewardsOverview: build.query<
            { success: boolean; data: EventRewardsOverview },
            string
        >({
            query: (eventId) => `/v1/events/${eventId}/rewards/overview`,
            providesTags: ["Rewards"],
        }),

        approveReward: build.mutation<ClaimRewardResponse, string>({
            query: (rewardId) => ({
                url: `/v1/rewards/${rewardId}/approve`,
                method: "PATCH",
            }),
            invalidatesTags: ["Rewards"],
        }),

        fulfilReward: build.mutation<
            ClaimRewardResponse,
            { rewardId: string; fulfilmentNote?: string }
        >({
            query: ({ rewardId, fulfilmentNote }) => ({
                url: `/v1/rewards/${rewardId}/fulfil`,
                method: "PATCH",
                body: { fulfilmentNote },
            }),
            invalidatesTags: ["Rewards"],
        }),

        rejectReward: build.mutation<
            ClaimRewardResponse,
            { rewardId: string; rejectionReason: string }
        >({
            query: ({ rewardId, rejectionReason }) => ({
                url: `/v1/rewards/${rewardId}/reject`,
                method: "PATCH",
                body: { rejectionReason },
            }),
            invalidatesTags: ["Rewards"],
        }),
    }),
});

export const {
    useGetMyRewardsQuery,
    useClaimRewardMutation,
    useGetEventRewardsOverviewQuery,
    useApproveRewardMutation,
    useFulfilRewardMutation,
    useRejectRewardMutation,
} = rewardsApi;
