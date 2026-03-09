import { IEvent } from "./event.type"


// Game Types
export type GameType = 'trivia' | 'wordPuzzle' | 'thisOrThat' | 'twoTruthsOneLie' | 'bingo' | 'spinTheWheel'

export type GameState = 'active' | 'inactive' | 'completed'

export type EventGamificationType = 'pre-event' | 'main-event' | 'post-event'

export type ScheduleType = 'daily' | 'weekly' | 'concurrent'

export type PrizeType = 'coupon' | 'merchandise' | 'cash' | 'other'

// Played Game
export interface PlayedGame {
  gameId: string;
  score: number;
  timeSpent: number;
  _id: string;
}

// Prize Structure
export interface GamePrize {
  position: number;
  prizeType: PrizeType;
  prize: string;
  couponConfig?: {
    discountType: string;
    discountValue: number;
    expiresAt: string;
    usageLimit: number;
  }
}

// Timeline Structure
export interface GameTimeline {
  startDateTime: string | Date;
  endDateTime: string | Date;
}

// Main Gamification Structure (formerly IGameData)
export interface IGameData {
  _id: string;
  eventId: string;
  event: IEvent;
  eventGamificationType: EventGamificationType;
  games: IGame[];
  startDay: Date | string;
  endDay: Date | string;
  startTime: string;
  endTime: string;
  numberOfRepetitions: number;
  schedule: ScheduleType;
  timelines?: GameTimeline[];
  maxNoOfWinners: number;
  shares?: number;
  prizes: GamePrize[];
  createdAt?: string;
  updatedAt?: string;
}

// Individual Game Round
export interface IGame {
  _id?: string;
  gameType: GameType;
  state: GameState;
  duration: number; // Duration in seconds
  startDay: Date | string;
  startTime: string; // HH:mm format
  name: string;
  description: string;
  image?: string;
  data: QuizData[] | WordSearchData | ThisOrThatData[] | TwoTruthsAndALieData[];
}

// Trivia Question Data
export type QuizData = {
  question: string;
  options: string[];
  correctOption: string;
};

// Word Puzzle Data
export type WordSearchData = {
  width: number;
  height: number;
  wordsCount: number;
  grid: string[][];
  words: {
    word: string;
    position: {
      start: [number, number];
      end: [number, number];
    };
  }[];
};

// This or That Question Data
export type ThisOrThatOption = {
  text: string;
  image?: string;
};

export type ThisOrThatData = {
  question: string;
  optionA: ThisOrThatOption;
  optionB: ThisOrThatOption;
};

// Two Truths One Lie Data
export type TwoTruthsAndALieData = {
  prompt: string;
  statements: string[];
  lieIndex: number;
  category: string;
};

// Generate Game Content Requests
export interface GenerateTriviaRequest {
  theme: string;
  numberOfQuestions: number;
}

export interface GenerateWordPuzzleRequest {
  theme: string;
}

export interface GenerateThisOrThatRequest {
  theme: string;
  numberOfQuestions: number;
}

export interface GenerateTwoTruthsOneLieRequest {
  theme: string;
  numberOfQuestions: number;
}

// Generate Responses
export interface GenerateTriviaResponse {
  questions: QuizData[];
}

export interface GenerateWordPuzzleResponse {
  puzzle: WordSearchData;
}

export interface GenerateThisOrThatResponse {
  questions: ThisOrThatData[];
}

export interface GenerateTwoTruthsOneLieResponse {
  questions: TwoTruthsAndALieData[];
}

// Play Game Request
export interface PlayGameRequest {
  individualGameId: string;
  score: number;
  timeSpent: number;
}

// Leaderboard Entry
export interface ILeaderboardEntry {
  _id: string;
  gameId: string;
  user: string;
  score: number;
  timeSpent: number;
  position: number;
  hasShared: boolean;
  playedGames: PlayedGame[] | string[];
  createdAt: string;
  updatedAt: string;
  userData: UserData;
}

export interface UserData {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  avatar: string;
}

export interface IGameWinner {
  userId: string; // Reference to User model
  position: number;
  prize: string;
  isPrizeProcessed: boolean;
  isEmailSent: boolean;
}

export interface IGameWinners {
  gameId: string; // Reference to GameData model
  winners: IGameWinner[];
}
