

import { IOrder } from "./order.type";
import { IUser } from "./user.type";

export type Liker = {
  user: Pick<IUser, "id" | "name" | "avatar">;
};

export interface IGalleryItem {
  _id: string;
  mediaUrl: string;
  uploadedAt: Date;
  uploadedBy: Pick<IUser, "id" | "name" | "avatar">;
  type: "image" | "video";
  likes?: number;
  likers?: Liker[];
  dislikes?: number;
  shares?: number;
  bookmarks?: number;
  eventId?: string;
}

export interface IEventWinner {
  userId: string;
  position: number;
  prize: string;
  prizeProcessed: boolean;
  emailSent: boolean;
}

export interface IBackendEvent {
  _id?: string;
  id: string;
  name: string;
  description: string;
  maxCapacity?: number;
  category: string | string;
  flierUrl?: string;
  backdropUrl: string | null;
  backdropType?: "custom" | "pre-designed";
  isPreDesigned?: boolean;
  sponsorshipRequests?: {
    sponsorId: string;
    backdropUrl: string;
    status: "pending" | "approved" | "rejected";
    requestedAt: Date;
  }[];
  eventMode: "onsite" | "virtual" | "hybrid";
  eventType: "free" | "premium";
  organizerId: string;
  organizer?: IUser;
  qrCodeUrl?: string;
  galleryItemIds?: string[];
  galleryItems?: IGalleryItem[];
  sponsorshipSlots?: {
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  backdropUsage?: { views: number; interactions: number; lastUpdated: Date };
  sponsorshipPackage?: { name: string; price: number; benefits: string[] };
  attendeeCount?: number;
  createdAt: Date;
  updatedAt: Date;
  promotionalVideoUrl?: string;
  isFree?: boolean;
  isPromoted: boolean;
  ticketLink?: string;
  promotionPrice: string | number;
  hasSponsors: boolean;
  sponsors: {
    sponsorId: string;
    bannerUrl: string;
    package: string;
  }[];
  get isEnded(): boolean;
  get isUpcoming(): boolean;
  get isLive(): boolean;
  isPublic: boolean;
  isIncentivized: boolean;
  // Event Visibility Fields
  visibility?: EventVisibility;
  inviteCode?: string;
  requiresApproval?: boolean;
  allowedGuestIds?: string[];
  participantIds: string[];
  participants?: IUser[];
  rsvpIds: string[];
  rsvps?: IUser[];
  checkedInIds: string[];
  checkedInUsers?: IUser[];
  startDateTime: Date;
  endDateTime: Date;
  engagementType?: "word-puzzle" | "trivia" | null;
  gameState?: "active" | "ended";
  gameDuration?: string;
  gameEndDateTime?: Date;
  triviaData?: {
    question: string;
    options: string[];
    correctOption: string;
  }[];
  wordPuzzleData?: {
    width: number;
    height: number;
    wordsCount: number;
    grid: string[][];
    words: { word: string; position: { start: number[]; end: number[] } }[];
  };
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
      _id?: string;
      id?: string;
    };
    name: string;
    _id?: string;
    id?: string;
  };
  geoLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  tags: string[];
  checkins: number;
  likes: { userId: string; _id?: string; id?: string }[];
  bookmarks: { userId: string; _id?: string; id?: string }[];
  allowSponsorship: boolean;
  maxNoOfWinners?: number;
  winners?: IEventWinner[];
  prizes?: {
    position: number;
    prizeType: string;
    prize: string;
  }[];
  leaderboard?: {
    user: string;
    position: number;
    score: number;
    timeSpent: number;
    hasShared: boolean;
  }[];
  userUploadCounts: {
    userId: string;
    uploadCount: number;
  }[];
  orderId?: string;
  order?: Partial<IOrder>;
  gameDataId?: string | string;
  // RSVP Messaging
  customInviteMessage?: string;
  automatedReminders?: AutomatedReminder[];
  messages?: EventMessage[];
}

export interface IPostCard {
  _id: string;
  userId: string;
  eventId: string;
  galleryItemIds: string[];
  likedByIds: string[];
  dislikedByIds: string[];
  engagements: {
    engagementType: "vibe" | "mid" | "hmm";
    userId: string;
  }[];
  user?: {
    name: string;
    id: string;
    avatar: string;
  };
  galleryItems: IGalleryItem[];
  shares: number;
  updatedAt: string;
}

export interface IEvent {
  id: string;
  _id?: string;
  name: string;
  description: string;
  maxCapacity?: number;
  category: string;
  flierUrl?: string;
  backdropUrl: string | null;
  backdropType?: "custom" | "pre-designed";
  isPreDesigned?: boolean;
  sponsorshipRequests?: {
    sponsorId: string;
    backdropUrl: string;
    status: "pending" | "approved" | "rejected";
    requestedAt: Date;
  }[];
  sponsorshipSlots?: {
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  eventMode: "onsite" | "virtual" | "hybrid";
  eventType: "free" | "premium";
  organizerId: string;
  organizer?: IUser;
  qrCodeUrl?: string;
  galleryItems?: IGalleryItem[];
  backdropUsage?: { views: number; interactions: number; lastUpdated: Date };
  sponsorshipPackage?: { name: string; price: number; benefits: string[] };
  attendeeCount?: number;
  createdAt: Date;
  updatedAt: Date;
  promotionalVideoUrl: string;
  isFree: boolean;
  isPromoted: boolean;
  ticketLink?: string;
  promotionPrice: string | number;
  hasSponsors: boolean;
  isEnded?: boolean;
  isUpcoming?: boolean;
  isLive?: boolean;
  isPublic: boolean;
  isIncentivized: boolean;
  // Event Visibility Fields
  visibility?: EventVisibility;
  inviteCode?: string;
  requiresApproval?: boolean;
  allowedGuestIds?: string[];
  participantIds: string[];
  participants: IUser[];
  startDateTime: Date;
  endDateTime: Date;
  engagementType: "word-puzzle" | "trivia" | null;
  gameState: "active" | "ended";
  gameDuration: string;
  gameEndDateTime: Date;
  triviaData: {
    question: string;
    options: string[];
    correctOption: string;
  }[];
  wordPuzzleData: {
    width: number;
    height: number;
    wordsCount: number;
    grid: string[][];
    words: { word: string; position: { start: number[]; end: number[] } }[];
  };
  location: {
    coordinates: { latitude: number; longitude: number };
    name: string;
  };
  tags: string[];
  checkins: number; // New field for sorting
  likes: { userId: string }[]; // Changed to array of user IDs
  bookmarks: { userId: string }[]; // Changed to array of user IDs
  likesCount?: number;
  bookmarksCount?: number;
  allowSponsorship: boolean; // New field
  sponsors: {
    package: "silver" | "gold" | "platinum";
    sponsorId: string;
    bannerUrl: string;
  }[];
  rsvpIds: string[];
  rsvps: IUser[];
  checkedInIds: string[];
  checkedInUsers: IUser[];
  maxNoOfWinners: number;
  winners: IEventWinner[];
  prizes: {
    position: number;
    prizeType: string;
    prize: string;
  }[];
  leaderboard: {
    user: Partial<IUser>;
    position: number;
    score: number;
    timeSpent: number;
    hasShared: boolean;
  }[];
  orderId: string;
  order?: Partial<IOrder>;
  // New fields for enhanced gamification
  gamePricing?: {
    basePrice: number;
    perRoundPrice: number;
    currency: string;
  };
  enablePreEventChallenges?: boolean;
  preEventChallenges?: PreEventChallenge[];
  liveEventGames?: LiveEventGame[];
  credits?: number;
  // RSVP Messaging
  customInviteMessage?: string;
  automatedReminders?: AutomatedReminder[];
  messages?: EventMessage[];
  // Gamification
  gamification?: {
    preEvent?: {
      games?: EventGamificationData;
    };
    mainEvent?: {
      games?: EventGamificationData;
    };
  };
}

export enum ROUNDTYPE {
  TRIVIA = "trivia",
  WORD_PUZZLE = "word-puzzle",
  THIS_OR_THAT = "this-or-that",
  TWO_TRUTHS_AND_A_LIE = "two-truths-and-a-lie",
}

export enum GAMETYPE {
  SINGLE_ROUND = "single_round",
  MULTIPLE_ROUND = "multiple_round",
}

export enum GAMEFREQUENCY {
  CONCURRENT = "concurrent",
  DAILY = "daily",
  WEEKLY = "weekly",
}

export enum CHALLENGE_TYPE {
  THEMED = "themed",
  SOCIAL = "social",
  CREATIVE = "creative",
  EDUCATIONAL = "educational",
}

export interface PreEventChallenge {
  id: string;
  title: string;
  description: string;
  type: CHALLENGE_TYPE;
  theme?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participants: string[];
  rewards: {
    credits: number;
    badges: string[];
  };
  mockData?: any; // For development
}

export interface LiveEventGame {
  id: string;
  title: string;
  description: string;
  type: ROUNDTYPE;
  isActive: boolean;
  startTime?: Date;
  duration: number;
  participants: string[];
  leaderboard: {
    user: Partial<IUser>;
    score: number;
    position: number;
  }[];
}

export interface WordPuzzle {
  width: number;
  height: number;
  wordsCount: number;
  grid: Array<string[]>;
  words: Word[];
}

export interface Word {
  word: string;
  position: Position;
}

export interface Position {
  start: number[];
  end: number[];
}

export interface Trivia {
  question: string;
  options: string[];
  correctOption: string;
}

export interface ThisOrThatOption {
  id: string;
  title: string;
  imageUrl?: string;
  image?: File | null;
  description?: string;
}

export interface ThisOrThatQuestion {
  id: string;
  optionA: ThisOrThatOption;
  optionB: ThisOrThatOption;
  category?: string;
  popularity?: {
    optionA: number;
    optionB: number;
  };
  isGraded?: boolean;
  correctOption?: "A" | "B";
}

export interface TwoTruthsAndALieQuestion {
  id: string;
  statement1: string;
  statement2: string;
  statement3: string;
  lieIndex: 0 | 1 | 2; // Which statement is the lie
  explanation?: string;
  category?: string;
}

export interface PointConfiguration {
  basePoints: number;
  speedBonusEnabled: boolean;
  speedBonusPoints: number;
  accuracyMultiplier: number;
  completionBonus: number;
}

export interface GameRound {
  type: ROUNDTYPE;
  duration: number;
  triviaData?: Trivia[] | null;
  wordPuzzleData?: WordPuzzle | null;
  thisOrThatData?: ThisOrThatQuestion[] | null;
  twoTruthsAndALieData?: TwoTruthsAndALieQuestion[] | null;
  scheduledStartTime?: Date | string | null;
  isScheduled?: boolean;
  manualStart?: boolean;
  pointConfig?: PointConfiguration;
}

export interface GameRewards {
  position: number;
  coupon: string;
  prize: string;
}

export interface ICreateEvent {
  name: string;
  description: string;
  tags: string[];
  isPromoted: boolean;
  category: string;
  flier?: File;
  promotionalVideo?: File;
  backdrop?: File; // Vibe Tag: Used as watermark on postcards and banner in event emails
  startDateTime: string;
  endDateTime?: string;
  location?: {
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
  // second part
  isIncentivized?: boolean;
  ticketLink?: string;
  engagementType?: "trivia" | "word-puzzle";
  allowSponsorship?: boolean;
  activities?: {
    preEvent?: {
      games?: any;
      vibetag?: File | null;
    };
    duringEvent?: {
      games?: any;
      vibetag?: File | null;
    };
  };
  gamification?: (EventGamificationData & {
    eventGamificationType: "pre-event" | "main-event";
  })[];
  prizes?: { position: number; prizeType: string; prize: string }[];
  gameDuration?: "12h" | "1d" | "2d" | "3d";
  maxCapacity?: number;
  eventMode: "onsite" | "virtual" | "hybrid";
  // Event Visibility & Access
  visibility?: EventVisibility;
  // RSVP Messaging
  customInviteMessage?: string;
  automatedReminders?: Omit<
    AutomatedReminder,
    "id" | "eventId" | "sentCount" | "lastSentAt"
  >[];
  // Event Visibility Fields
  isPublic?: boolean;
  requiresApproval?: boolean;
}

// export enum ROUNDTYPE {
// 	TRIVIA = "trivia",
// 	WORD_PUZZLE = "word-puzzle",
// }

// export enum GAMETYPE {
// 	SINGLE_ROUND = "single_round",
// 	MULTIPLE_ROUND = "multiple_round",
// }

// export enum GAMEFREQUENCY {
// 	DAILY = "daily",
// 	WEEKLY = "weekly",
// }

export interface WordPuzzle {
  width: number;
  height: number;
  wordsCount: number;
  grid: Array<string[]>;
  words: Word[];
}

export interface Word {
  word: string;
  position: Position;
}

export interface Position {
  start: number[];
  end: number[];
}

export interface Trivia {
  question: string;
  options: string[];
  correctOption: string;
}

export interface GameRound {
  type: ROUNDTYPE;
  duration: number;
  triviaData?: Trivia[] | null;
  wordPuzzleData?: WordPuzzle | null;
  thisOrThatData?: ThisOrThatQuestion[] | null;
  twoTruthsAndALieData?: TwoTruthsAndALieQuestion[] | null;
  scheduledStartTime?: Date | string | null;
  isScheduled?: boolean;
  manualStart?: boolean;
}

export interface GameRewards {
  position: number;
  coupon: string;
  prize: string;
}

export interface EventGamificationData {
  engagementType?: GAMETYPE;
  startDateTime: string;
  endDateTime: string;
  gameFrequency?: GAMEFREQUENCY;
  rounds: GameRound[];
  rewards: GameRewards[];
}

export interface Postcard {
  _id: string;
  post_id: string;
  __v: number;
  allowDownload?: boolean;
  createdAt: string;
  event_id: string;
  gallery_items: GalleryItem[];
  tags: any[];
  updatedAt: string;
  user: {
    name: string;
    avatar: string;
    id: string;
  };
}

export interface GalleryItem {
  url: string;
  type: string;
  _id: string;
}

export interface PaginatedPostcardResponse {
  postcards: Postcard[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadCount {
  count: Count;
}

export interface Count {
  totalGalleryItems: number;
  totalPosts: number;
}

// Event Visibility Types
export type EventVisibility = "public" | "private";

export interface EventAccessRequest {
  id: string;
  eventId: string;
  userId: string;
  user?: Pick<IUser, "id" | "name" | "email" | "avatar">;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  respondedAt?: string;
}

// RSVP Messaging Types
export type ReminderType =
  | "custom"
  | "event_day"
  | "one_hour_before"
  | "one_day_before";
export type ReminderTrigger = "manual" | "rsvp_confirmed" | "scheduled";

export interface EventMessage {
  id: string;
  eventId: string;
  type: "invite" | "reminder" | "update";
  subject: string;
  message: string;
  recipientFilter?: "all" | "rsvp_confirmed" | "rsvp_pending" | "not_rsvp";
  scheduledFor?: string;
  sentAt?: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  sentCount?: number;
  createdBy: string;
  createdAt: string;
}

export interface AutomatedReminder {
  id: string;
  eventId: string;
  type: ReminderType;
  enabled: boolean;
  message: string;
  triggerTime?: string; // ISO string for scheduled reminders
  triggerCondition?: ReminderTrigger;
  recipientFilter: "all" | "rsvp_confirmed" | "rsvp_pending";
  lastSentAt?: string;
  sentCount: number;
}

export interface PersonalizedInvite {
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  customMessage: string;
  sentAt?: string;
  status: "pending" | "sent" | "failed";
}
