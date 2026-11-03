/**
 * Wishlist (event gift registry). Money amounts are strings — Postgres DECIMAL
 * serialised — so format them with formatMoney and never do arithmetic on them.
 */

export type ContributionStatus = "PENDING" | "CONFIRMED" | "REJECTED";

/** An item as guests see it: confirmed totals only, never pending. */
export interface PublicWishlistItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  /** null = open-ended "just give" item */
  price: string | null;
  sortOrder: number;
  isFulfilled: boolean;
  confirmedTotal: string;
  /** What "Pay in full" fills in. null for "just give" items. */
  remainingAmount: string | null;
  contributorCount: number;
}

export interface PublicWishlist {
  id: string;
  eventId: string;
  currency: string;
  items: PublicWishlistItem[];
}

export interface PublicContributor {
  id: string;
  /** Already "Anonymous" when the giver asked for it. */
  name: string;
  message: string | null;
  createdAt: string;
}

export interface PaymentDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

export interface OrganizerWishlistItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  sortOrder: number;
  fulfilledAt: string | null;
  confirmedTotal: string;
  pendingTotal: string;
  confirmedCount: number;
  pendingCount: number;
}

export interface OrganizerWishlist {
  id: string;
  eventId: string;
  isEnabled: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  updatedAt: string;
  confirmedTotal: string;
  pendingTotal: string;
  items: OrganizerWishlistItem[];
}

export interface Contribution {
  id: string;
  itemId: string;
  name: string;
  email: string | null;
  message: string | null;
  isAnonymous: boolean;
  amount: string;
  status: ContributionStatus;
  reviewedAt: string | null;
  createdAt: string;
  item: { id: string; name: string; deletedAt: string | null };
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; hasNext: boolean };
}
