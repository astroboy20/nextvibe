"use client";

import { GenerateTriviaResponse, GenerateTriviaRequest, GenerateWordPuzzleResponse, GenerateWordPuzzleRequest, GenerateThisOrThatResponse, GenerateThisOrThatRequest, GenerateTwoTruthsOneLieResponse, GenerateTwoTruthsOneLieRequest, IGameData, PlayGameRequest } from "@/types/game.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

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

export interface Reward {
    id: string;
    gameSessionId: string;
    gameRoundId: string | null;
    userId: string;
    rewardTierId: string;
    isClaimed: boolean;
    claimedAt: string | null;
    createdAt: string;
    rewardTier: RewardTier;
    gameSession: {
        id: string;
        title: string | null;
        event: { id: string; name: string } | null;
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

export const gamesApi = createApi({
    reducerPath: "gamesApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Game", "LeaderBoard", "Rewards"],
    keepUnusedDataFor: 300,
    endpoints: (build) => ({

        generateTrivia: build.mutation<GenerateTriviaResponse, GenerateTriviaRequest>({
            query: (body) => ({
                url: "/v1/games/trivia/generate",
                method: "POST",
                body,
            }),
        }),

        generateWordPuzzle: build.mutation<GenerateWordPuzzleResponse, GenerateWordPuzzleRequest>({
            query: (body) => ({
                url: "/v1/games/word-puzzle/generate",
                method: "POST",
                body,
            }),
        }),

        generateWordPuzzleFromWords: build.mutation<GenerateWordPuzzleResponse, string[]>({
            query: (words) => ({
                url: "/v1/games/word-puzzle/generate-from-words",
                method: "POST",
                body: { words },
            }),
        }),

        generateThisOrThat: build.mutation<GenerateThisOrThatResponse, GenerateThisOrThatRequest>({
            query: (body) => ({
                url: "/v1/games/this-or-that/generate",
                method: "POST",
                body,
            }),
        }),

        generateTwoTruthsOneLie: build.mutation<GenerateTwoTruthsOneLieResponse, GenerateTwoTruthsOneLieRequest>({
            query: (body) => ({
                url: "/v1/games/two-truths-one-lie/generate",
                method: "POST",
                body,
            }),
        }),


        createGame: build.mutation<IGameData, Partial<IGameData>>({
            query: (body) => ({
                url: "/games",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Game"],
        }),

        updateGame: build.mutation<IGameData, { gameId: string; data: Partial<IGameData> }>({
            query: ({ gameId, data }) => ({
                url: `/games/${gameId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Game"],
        }),

        deleteGame: build.mutation<{ message: string }, string>({
            query: (gameId) => ({
                url: `/games/${gameId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Game"],
        }),

        getGameById: build.query<IGameData, string>({
            query: (gameId) => `/games/${gameId}`,
            providesTags: ["Game"],
        }),

        getGamesByEventId: build.query<IGameData[], { eventId: string; params?: Record<string, string> }>({
            query: ({ eventId, params }) => {
                const queryString = params ? new URLSearchParams(params).toString() : "";
                return `/events/${eventId}/games${queryString ? `?${queryString}` : ""}`;
            },
            providesTags: ["Game"],
        }),

        getCurrentActiveGameForEvent: build.query<IGameData, string>({
            query: (eventId) => `/events/${eventId}/active-game`,
            providesTags: ["Game"],
        }),

        getEventDetailsFromGameId: build.query<any, string>({
            query: (gameId) => `/games/${gameId}/event-details`,
        }),

        // =======================
        // Play & Leaderboard
        // =======================
        playGame: build.mutation<any, { gameId: string; data: PlayGameRequest }>({
            query: ({ gameId, data }) => ({
                url: `/games/${gameId}/play`,
                method: "POST",
                body: data,
            }),
        }),

        shareGame: build.mutation<any, string>({
            query: (gameId) => ({
                url: `/games/${gameId}/share`,
                method: "POST",
            }),
        }),

        getLeaderBoard: build.query<any, string>({
            query: (gameId) => `/games/${gameId}/leaderboard`,
            providesTags: ["LeaderBoard"],
        }),

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
    }),
});

export const {
    useGenerateTriviaMutation,
    useGenerateWordPuzzleMutation,
    useGenerateWordPuzzleFromWordsMutation,
    useGenerateThisOrThatMutation,
    useGenerateTwoTruthsOneLieMutation,
    useCreateGameMutation,
    useUpdateGameMutation,
    useDeleteGameMutation,
    useGetGameByIdQuery,
    useGetGamesByEventIdQuery,
    useGetCurrentActiveGameForEventQuery,
    useGetEventDetailsFromGameIdQuery,
    usePlayGameMutation,
    useShareGameMutation,
    useGetLeaderBoardQuery,
    useGetMyRewardsQuery,
    useClaimRewardMutation,
} = gamesApi;