import { baseApi } from "@/store/api/baseApi";
import type {
  Contribution,
  ContributionStatus,
  OrganizerWishlist,
  Paginated,
  PaymentDetails,
  PublicContributor,
  PublicWishlist,
} from "@/features/wishlist/types";

/**
 * Wishlist endpoints — all under /v1/events/:eventId/wishlist.
 *
 * Every response is wrapped by the backend's ResponseInterceptor as
 * `{ success, data }`; transformResponse unwraps it so components get the
 * payload directly.
 *
 * Writes that change the wishlist's on/off state also invalidate the `Event`
 * tag, because the event page decides whether to show the Wishlist tab from
 * `hasWishlist` on the event details.
 */
type Envelope<T> = { success: boolean; data: T };

type ItemBody = {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number | null;
  sortOrder?: number;
};

export const wishlistEndpoints = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Guests ──────────────────────────────────────────────────────────────
    getWishlist: builder.query<PublicWishlist, string>({
      query: (eventId) => `/v1/events/${eventId}/wishlist`,
      transformResponse: (res: Envelope<PublicWishlist>) => res.data,
      providesTags: (_, __, eventId) => [{ type: "Wishlist", id: eventId }],
    }),

    getItemContributors: builder.query<
      Paginated<PublicContributor>,
      { eventId: string; itemId: string; page?: number }
    >({
      query: ({ eventId, itemId, page = 1 }) =>
        `/v1/events/${eventId}/wishlist/items/${itemId}/contributors?page=${page}&limit=20`,
      transformResponse: (res: Envelope<Paginated<PublicContributor>>) =>
        res.data,
      providesTags: (_, __, { eventId }) => [{ type: "Wishlist", id: eventId }],
    }),

    // Lazy on purpose: only fetched when a guest opens the contribute dialog.
    // Not cached, so bank details never linger in the store.
    getPaymentDetails: builder.query<PaymentDetails, string>({
      query: (eventId) => `/v1/events/${eventId}/wishlist/payment-details`,
      transformResponse: (res: Envelope<PaymentDetails>) => res.data,
      keepUnusedDataFor: 0,
    }),

    reportContribution: builder.mutation<
      { id: string; status: ContributionStatus; amount: string; currency: string },
      {
        eventId: string;
        itemId: string;
        name: string;
        email?: string;
        message?: string;
        isAnonymous: boolean;
        amount: number;
      }
    >({
      query: ({ eventId, itemId, ...body }) => ({
        url: `/v1/events/${eventId}/wishlist/items/${itemId}/contributions`,
        method: "POST",
        body,
      }),
      transformResponse: (
        res: Envelope<{
          id: string;
          status: ContributionStatus;
          amount: string;
          currency: string;
        }>,
      ) => res.data,
      // No invalidation: a report is PENDING and changes nothing guests see.
    }),

    // ── Organizer ───────────────────────────────────────────────────────────
    // A 404 here means the organizer hasn't set the wishlist up yet; the
    // dashboard card treats it as the "turn it on" state, not an error.
    getOrganizerWishlist: builder.query<OrganizerWishlist, string>({
      query: (eventId) => `/v1/events/${eventId}/wishlist/manage`,
      transformResponse: (res: Envelope<OrganizerWishlist>) => res.data,
      providesTags: (_, __, eventId) => [
        { type: "Wishlist", id: `manage-${eventId}` },
      ],
    }),

    upsertWishlist: builder.mutation<
      OrganizerWishlist,
      {
        eventId: string;
        isEnabled?: boolean;
        bankName: string;
        accountNumber: string;
        accountName: string;
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/v1/events/${eventId}/wishlist`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Wishlist", id: eventId },
        { type: "Wishlist", id: `manage-${eventId}` },
        { type: "Event", id: eventId },
      ],
    }),

    createWishlistItem: builder.mutation<unknown, { eventId: string } & ItemBody>(
      {
        query: ({ eventId, ...body }) => ({
          url: `/v1/events/${eventId}/wishlist/items`,
          method: "POST",
          body,
        }),
        invalidatesTags: (_, __, { eventId }) => [
          { type: "Wishlist", id: eventId },
          { type: "Wishlist", id: `manage-${eventId}` },
        ],
      },
    ),

    updateWishlistItem: builder.mutation<
      unknown,
      { eventId: string; itemId: string } & Partial<ItemBody>
    >({
      query: ({ eventId, itemId, ...body }) => ({
        url: `/v1/events/${eventId}/wishlist/items/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Wishlist", id: eventId },
        { type: "Wishlist", id: `manage-${eventId}` },
      ],
    }),

    deleteWishlistItem: builder.mutation<
      unknown,
      { eventId: string; itemId: string }
    >({
      query: ({ eventId, itemId }) => ({
        url: `/v1/events/${eventId}/wishlist/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Wishlist", id: eventId },
        { type: "Wishlist", id: `manage-${eventId}` },
      ],
    }),

    setWishlistItemFulfilled: builder.mutation<
      unknown,
      { eventId: string; itemId: string; fulfilled: boolean }
    >({
      query: ({ eventId, itemId, fulfilled }) => ({
        url: `/v1/events/${eventId}/wishlist/items/${itemId}/${
          fulfilled ? "fulfil" : "reopen"
        }`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Wishlist", id: eventId },
        { type: "Wishlist", id: `manage-${eventId}` },
      ],
    }),

    getContributions: builder.query<
      Paginated<Contribution>,
      { eventId: string; status?: ContributionStatus; page?: number }
    >({
      query: ({ eventId, status, page = 1 }) => {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (status) params.set("status", status);
        return `/v1/events/${eventId}/wishlist/contributions?${params}`;
      },
      transformResponse: (res: Envelope<Paginated<Contribution>>) => res.data,
      providesTags: (_, __, { eventId }) => [
        { type: "Wishlist", id: `contributions-${eventId}` },
      ],
    }),

    reviewContribution: builder.mutation<
      unknown,
      {
        eventId: string;
        contributionId: string;
        status: Exclude<ContributionStatus, "PENDING">;
      }
    >({
      query: ({ eventId, contributionId, status }) => ({
        url: `/v1/events/${eventId}/wishlist/contributions/${contributionId}`,
        method: "PATCH",
        body: { status },
      }),
      // Confirming changes totals everywhere: the public list, the organizer
      // view, and the contributions list itself.
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Wishlist", id: eventId },
        { type: "Wishlist", id: `manage-${eventId}` },
        { type: "Wishlist", id: `contributions-${eventId}` },
      ],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useGetItemContributorsQuery,
  useLazyGetPaymentDetailsQuery,
  useReportContributionMutation,
  useGetOrganizerWishlistQuery,
  useUpsertWishlistMutation,
  useCreateWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useDeleteWishlistItemMutation,
  useSetWishlistItemFulfilledMutation,
  useGetContributionsQuery,
  useReviewContributionMutation,
} = wishlistEndpoints;
