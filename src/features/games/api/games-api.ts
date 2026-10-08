import { baseApi } from "@/store/api/baseApi";
import { getAnonymousId } from "@/features/games/lib/anonymous-game";

/**
 * Game endpoints — sessions, rounds, answers, leaderboards, reward tiers, and
 * the anonymous-play path.
 *
 * Injected into `baseApi` rather than declared as its own createApi instance,
 * because tags are scoped per instance. These endpoints make five tag
 * references into the event domain — createGame invalidates `Event` and
 * `PublishPreview`, getActiveGameStatus provides `Event` — and a separate
 * slice would make those different tags entirely, so the event page would
 * quietly serve stale data after a game changed.
 */
export const gameEndpoints = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    playGame: builder.mutation<
      any,
      {
        eventId: string;
        gameData: { timeSpent: number; score: number };
        gameType: "word-puzzle" | "trivia";
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/games/play`,
        method: "POST",
        body,
      }),
    }),

    //Games
    /**
     * POST /v1/games/ai/generate-draft — asks the backend to draft a game with
     * AI. Nothing is persisted; /save-draft does that.
     *
     * Was a raw `fetch` in game-creation-wizard.tsx with a hand-built
     * Authorization header, built from a token read once at component render.
     * That meant no refresh on a 401 *and* a stale token if baseQuery had
     * refreshed it elsewhere — on the slowest call in the app, where an access
     * token is most likely to expire mid-flight.
     *
     * The 60s timeout overrides baseQuery's 15s default: this waits on an LLM,
     * and 15s is comfortably within the range a real generation takes. The raw
     * fetch had no timeout at all, so without this override, moving it here
     * would have traded a token bug for a truncation bug.
     */
    generateGameDraft: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/v1/games/ai/generate-draft",
        method: "POST",
        body,
        timeout: 60000,
      }),
    }),

    /**
     * POST /v1/games/ai/regenerate-question — one replacement question that
     * differs from everything in `avoid`. For WORD_PUZZLE, send the remaining
     * words as `keepWords`; the reply carries a new grid for all of them
     * (`{ question, grid, hiddenWords }`), because a word's start and end
     * cells only mean anything inside the grid it was placed in.
     */
    regenerateAiQuestion: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/v1/games/ai/regenerate-question",
        method: "POST",
        body,
        timeout: 60000,
      }),
    }),

    createGame: builder.mutation<any, any>({
      query: ({ body, eventId }: { body: any; eventId: string }) => ({
        url: `/v1/events/${eventId}/game-sessions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        "Games",
        { type: "Event", id: eventId },
        { type: "PublishPreview", id: eventId },
      ],
    }),

    updateGameStatus: builder.mutation<
      any,
      { roundId: string; status: "ACTIVE" | "ENDED" }
    >({
      query: ({ roundId, status }) => ({
        url: `/v1/game-sessions/${roundId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Games"],
    }),

    updateRoundStatus: builder.mutation<
      any,
      { roundId: string; status: "ACTIVE" | "ENDED" }
    >({
      query: ({ roundId, status }) => ({
        url: `/v1/game-rounds/${roundId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Games"],
    }),

    getGames: builder.query<any, string>({
      query: (eventId) => ({
        url: `/v1/events/${eventId}/game-sessions`,
      }),
      providesTags: ["Games"],
    }),

    /** POST /v1/game-sessions/:sessionId/join */
    joinGameSession: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/v1/game-sessions/${sessionId}/join`,
        method: "POST",
      }),
      invalidatesTags: ["Games"],
    }),

    /** POST /v1/game-rounds/:roundId/submit */
    submitRoundAnswers: builder.mutation<
      any,
      { roundId: string; answers: (number | string)[]; timeTakenMs?: number }
    >({
      query: ({ roundId, answers, timeTakenMs }) => ({
        url: `/v1/game-rounds/${roundId}/submit`,
        method: "POST",
        body: {
          answers,
          metadata: { timeTakenMs: timeTakenMs ?? 0 },
        },
      }),
    }),

    /** GET /v1/game-sessions/:sessionId — get session details including isJoined */
    getGameSession: builder.query<any, string>({
      query: (sessionId) => `/v1/game-sessions/${sessionId}`,
      providesTags: ["Games"],
    }),

    /** GET /v1/game-rounds/:gameId/participation — check participation status for a game session */
    getGameRoundParticipation: builder.query<any, string>({
      query: (gameId) => `/v1/game-rounds/${gameId}/participation`,
      providesTags: ["Games"],
    }),

    /** GET /v1/game-sessions/:sessionId/leaderboard */
    getSessionLeaderboard: builder.query<any, string>({
      query: (sessionId) => `/v1/game-sessions/${sessionId}/leaderboard`,
      providesTags: ["Games"],
    }),

    /** GET /v1/game-rounds/:roundId/responses — organizer only: free-text responses for a FEEDBACK round */
    getRoundResponses: builder.query<any, string>({
      query: (roundId) => `/v1/game-rounds/${roundId}/responses`,
      providesTags: ["Games"],
    }),

    /**
     * POST /v1/game-rounds/:roundId/answer — the server checks one answer.
     * Round configs no longer include answers for players, so this is the only
     * way to know whether a choice was right. The first answer to a question is
     * final; sending another returns the first one's result. Word puzzles send
     * the drag (`startCell`, `endCell`) instead.
     *
     * Signed-in players are identified by their token; guests by the same
     * X-Anonymous-Id header as getGameSessionByToken.
     */
    answerQuestion: builder.mutation<
      any,
      {
        roundId: string;
        questionIndex?: number;
        answer?: number;
        startCell?: [number, number];
        endCell?: [number, number];
      }
    >({
      query: ({ roundId, ...body }) => {
        const anonymousId = getAnonymousId();
        return {
          url: `/v1/game-rounds/${roundId}/answer`,
          method: "POST",
          body,
          headers: anonymousId ? { "X-Anonymous-Id": anonymousId } : undefined,
        };
      },
    }),

    /** GET /v1/games/t/:token — public: get game session by viral share token */
    // Guests send their anonymous id so the server can mark which rounds they
    // have played (it lives in Redis, not the database). A header rather than a
    // query param: the id is the guest's credential, and request URLs get logged.
    // Signed-in users are resolved from the bearer token and the header is ignored.
    getGameSessionByToken: builder.query<any, string>({
      query: (token) => {
        const anonymousId = getAnonymousId();
        return {
          url: `/v1/games/t/${token}`,
          headers: anonymousId ? { "X-Anonymous-Id": anonymousId } : undefined,
        };
      },
    }),

    /** POST /v1/games/join/:token — public: join a game session via viral share token */
    joinGameSessionByToken: builder.mutation<any, string>({
      query: (token) => ({
        url: `/v1/games/join/${token}`,
        method: "POST",
      }),
    }),

    /** POST /v1/games/anonymous/join/:token — no auth required */
    anonymousJoinGame: builder.mutation<
      any,
      { token: string; anonymousId?: string }
    >({
      query: ({ token, anonymousId }) => ({
        url: `/v1/games/anonymous/join/${token}`,
        method: "POST",
        body: { anonymousId },
      }),
    }),

    /** POST /v1/games/anonymous/rounds/:roundId/submit — no auth required */
    anonymousSubmitRound: builder.mutation<
      any,
      {
        roundId: string;
        anonymousId: string;
        answers?: any[];
        metadata?: Record<string, any>;
      }
    >({
      query: ({ roundId, ...body }) => ({
        url: `/v1/games/anonymous/rounds/${roundId}/submit`,
        method: "POST",
        body,
      }),
    }),

    /** POST /v1/games/anonymous/merge — requires auth */
    mergeAnonymousSessions: builder.mutation<
      any,
      { anonymousId: string; confirmedEventIds: string[] }
    >({
      query: (body) => ({
        url: `/v1/games/anonymous/merge`,
        method: "POST",
        body,
      }),
    }),

    /** GET /v1/events/:eventId/active-game-status — check if user is checked in and get active game info */
    getActiveGameStatus: builder.query<any, string>({
      query: (eventId) => `/v1/events/${eventId}/active-game-status`,
      providesTags: (_, __, eventId) => [
        { type: "Event", id: `game-status-${eventId}` },
      ],
    }),

    /** GET /v1/game-sessions/:id/edit-policy — check if game content is still editable */
    getGameSessionEditPolicy: builder.query<
      { editable: boolean; reason?: string },
      string
    >({
      query: (sessionId) => `/v1/game-sessions/${sessionId}/edit-policy`,
      providesTags: (_, __, id) => [{ type: "Games", id: `policy-${id}` }],
    }),

    /** PATCH /v1/game-sessions/:id — update session-level fields */
    updateGameSession: builder.mutation<
      any,
      {
        sessionId: string;
        data: { title?: string; maxWinners?: number; gameDuration?: number };
      }
    >({
      query: ({ sessionId, data }) => ({
        url: `/v1/game-sessions/${sessionId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Games"],
    }),

    // ── Round management ──────────────────────────────────────────────────────
    /** POST /v1/game-sessions/:id/rounds — add a new round */
    addGameRound: builder.mutation<any, { sessionId: string; data: any }>({
      query: ({ sessionId, data }) => ({
        url: `/v1/game-sessions/${sessionId}/rounds`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Games"],
    }),

    /** PATCH /v1/game-rounds/:id — update a round */
    updateGameRound: builder.mutation<
      any,
      {
        roundId: string;
        data: {
          title?: string;
          gameType?: string;
          config?: any;
          orderIndex?: number;
        };
      }
    >({
      query: ({ roundId, data }) => ({
        url: `/v1/game-rounds/${roundId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Games"],
    }),

    /** DELETE /v1/game-rounds/:id — delete a round */
    deleteGameRound: builder.mutation<any, string>({
      query: (roundId) => ({
        url: `/v1/game-rounds/${roundId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Games"],
    }),

    // ── Reward Tier management ────────────────────────────────────────────────
    /** POST /v1/game-sessions/:id/reward-tiers — add a reward tier */
    addGameRewardTier: builder.mutation<any, { sessionId: string; data: any }>({
      query: ({ sessionId, data }) => ({
        url: `/v1/game-sessions/${sessionId}/reward-tiers`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Games"],
    }),

    /** PATCH /v1/game-reward-tiers/:id — update a reward tier */
    updateGameRewardTier: builder.mutation<any, { tierId: string; data: any }>({
      query: ({ tierId, data }) => ({
        url: `/v1/game-reward-tiers/${tierId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Games"],
    }),

    /** DELETE /v1/game-reward-tiers/:id — delete a reward tier */
    deleteGameRewardTier: builder.mutation<any, string>({
      query: (tierId) => ({
        url: `/v1/game-reward-tiers/${tierId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Games"],
    }),
  }),
});

export const {
  usePlayGameMutation,
  useCreateGameMutation,
  useGetGamesQuery,
  useUpdateGameStatusMutation,
  useUpdateRoundStatusMutation,
  useJoinGameSessionMutation,
  useSubmitRoundAnswersMutation,
  useGetSessionLeaderboardQuery,
  useGetRoundResponsesQuery,
  useGetGameSessionQuery,
  useGetGameRoundParticipationQuery,
  useGetGameSessionByTokenQuery,
  useJoinGameSessionByTokenMutation,
  useGenerateGameDraftMutation,
  useRegenerateAiQuestionMutation,
  useAnswerQuestionMutation,
  useGetActiveGameStatusQuery,
  useAnonymousJoinGameMutation,
  useAnonymousSubmitRoundMutation,
  useMergeAnonymousSessionsMutation,
  useGetGameSessionEditPolicyQuery,
  useUpdateGameSessionMutation,
  useAddGameRoundMutation,
  useUpdateGameRoundMutation,
  useDeleteGameRoundMutation,
  useAddGameRewardTierMutation,
  useUpdateGameRewardTierMutation,
  useDeleteGameRewardTierMutation,
} = gameEndpoints;
