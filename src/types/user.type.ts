import { IEvent } from "./event.type";


export interface IUser {
  id: string;
  name: string;
  dateOfBirth: Date;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  phoneNumber: string;
  about?: string;
  address?: string;
  gender: "male" | "female" | "prefer not to say" | "other";
  role: "attendee" | "organizer" | "sponsor" | null;
  serverRole: "user" | "admin";
  email: string;
  avatar: string;
  coverImage?: string;
  token?: string; 
  interests: string[];
  subscription: "free" | "pro" | "premium";
  uploadCount: number;
  favoriteIds: string[];
  favorites: Partial<IEvent>[];
  followerIds: string[];
  followingIds: string[];
  followers: Partial<IUser>[];
  following: Partial<IUser>[];
  contentHistory?: {
    eventId: string;
    galleryItemId: string;
    uploadedAt: Date;
  }[];
  isAdmin?: boolean;
  brandingAssets?: { logoUrl: string; bannerUrl: string }[];
  comparePassword(password: string): Promise<boolean>;
}
