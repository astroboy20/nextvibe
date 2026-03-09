"use client";

import { GenerateTriviaResponse, GenerateTriviaRequest, GenerateWordPuzzleResponse, GenerateWordPuzzleRequest, GenerateThisOrThatResponse, GenerateThisOrThatRequest, GenerateTwoTruthsOneLieResponse, GenerateTwoTruthsOneLieRequest, IGameData, PlayGameRequest } from "@/types/game.type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const gamesApi = createApi({
    reducerPath: "gamesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        // Uncomment and add auth header if needed
        // prepareHeaders: (headers) => {
        //   const token = localStorage.getItem("token");
        //   if (token) headers.set("Authorization", `Bearer ${token}`);
        //   return headers;
        // }
    }),
    tagTypes: ["Game", "LeaderBoard"],
    endpoints: (build) => ({

        generateTrivia: build.mutation<GenerateTriviaResponse, GenerateTriviaRequest>({
            query: (body) => ({
                url: "/games/trivia/generate",
                method: "POST",
                body,
            }),
        }),

        generateWordPuzzle: build.mutation<GenerateWordPuzzleResponse, GenerateWordPuzzleRequest>({
            query: (body) => ({
                url: "/games/word-puzzle/generate",
                method: "POST",
                body,
            }),
        }),

        generateWordPuzzleFromWords: build.mutation<GenerateWordPuzzleResponse, string[]>({
            query: (words) => ({
                url: "/games/word-puzzle/generate-from-words",
                method: "POST",
                body: { words },
            }),
        }),

        generateThisOrThat: build.mutation<GenerateThisOrThatResponse, GenerateThisOrThatRequest>({
            query: (body) => ({
                url: "/games/this-or-that/generate",
                method: "POST",
                body,
            }),
        }),

        generateTwoTruthsOneLie: build.mutation<GenerateTwoTruthsOneLieResponse, GenerateTwoTruthsOneLieRequest>({
            query: (body) => ({
                url: "/games/two-truths-one-lie/generate",
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
} = gamesApi;