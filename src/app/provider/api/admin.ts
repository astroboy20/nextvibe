import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ── Shared pagination wrapper ─────────────────────────────────────────────────
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Coupon types ──────────────────────────────────────────────────────────────
export interface IAdminCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminCouponRedemption {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  redeemedAt: string;
  discountApplied: number;
}

export interface IAdminCouponDetail extends IAdminCoupon {
  redemptions: IAdminCouponRedemption[];
}

export interface ICreateAdminCouponInput {
  code?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  usageLimit?: number;
  expiresAt?: string;
  description?: string;
}

export interface IUpdateAdminCouponInput {
  isActive?: boolean;
  usageLimit?: number;
  expiresAt?: string;
  description?: string;
}

// ── User types ────────────────────────────────────────────────────────────────
export interface IAdminUser {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'SPONSOR' | 'ADMIN' | 'SUPER_ADMIN';
  isBanned: boolean;
  bannedAt?: string | null;
  isEmailVerified: boolean;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  oauthProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminUserDetail extends IAdminUser {
  recentEvents?: any[];
  recentPurchases?: any[];
  recentPostcards?: any[];
  counts?: {
    events?: number;
    purchases?: number;
    postcards?: number;
  };
}

export interface IToggleBanResponse {
  id: string;
  username: string;
  isBanned: boolean;
  bannedAt: string | null;
}

export interface IUpdateRoleResponse {
  id: string;
  username: string;
  role: string;
}

// ── Vibe tag types ────────────────────────────────────────────────────────────
export interface IAdminVibeTag {
  id: string;
  name: string;
  activityTiming: string;
  isPlatformDefault: boolean;
  eventId: string | null;
  postcardCount: number;
  totalLikesOnPostcards: number;
}

export interface IVibeTagStatsResponse {
  total: number;
  vibeTags: IAdminVibeTag[];
}

// ── Game session types ────────────────────────────────────────────────────────
export interface IAdminGameSession {
  id: string;
  user?: { id: string; displayName?: string; username?: string; email?: string };
  event?: { id: string; title?: string };
  gameType?: string;
  score?: number;
  status: string;
  roundCount?: number;
  participantCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ── Postcard types ────────────────────────────────────────────────────────────
export interface IAdminPostcard {
  id: string;
  imageUrl?: string;
  user?: { id: string; displayName?: string; username?: string; email?: string };
  event?: { id: string; title?: string };
  likesCount?: number;
  vibeTags?: string[];
  createdAt: string;
}

// ── Event types ───────────────────────────────────────────────────────────────
export interface IAdminEvent {
  id: string;
  title: string;
  description?: string;
  status: string;
  organizer?: { id: string; displayName?: string; username?: string; email?: string };
  location?: string | { name?: string; address?: string };
  startDate?: string;
  endDate?: string;
  ticketPrice?: number;
  capacity?: number;
  eventType?: string;
  eventMode?: string;
  category?: string;
  createdAt: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function unwrap<T>(response: { status?: string; data?: T } | T): T {
  if (response && typeof response === 'object' && 'data' in (response as any)) {
    return (response as any).data as T;
  }
  return response as T;
}

function unwrapPaginated<T>(
  response: { status?: string; data?: T[] | IPaginatedResponse<T> } | T[] | IPaginatedResponse<T>
): IPaginatedResponse<T> {
  const inner = unwrap<T[] | IPaginatedResponse<T>>(response as any);
  if (Array.isArray(inner)) {
    return { data: inner, total: inner.length, page: 1, limit: inner.length, totalPages: 1 };
  }
  if (inner && typeof inner === 'object' && 'data' in inner) {
    return inner as IPaginatedResponse<T>;
  }
  return { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };
}

// ── base query ────────────────────────────────────────────────────────────────
const adminBaseQuery = (args: any, api: any, extraOptions: any) => {
  const adjustedArgs =
    typeof args === 'string'
      ? `/v1/admin${args}`
      : { ...args, url: `/v1/admin${args.url}` };
  return baseQueryWithReauth(adjustedArgs, api, extraOptions);
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  tagTypes: ['Stats', 'Analytics', 'Payments', 'Events', 'Postcards', 'GameSessions', 'VibeTag', 'Users', 'Coupons'],
  endpoints: (builder) => ({
    // ── Stats & Analytics ──────────────────────────────────────────────────
    getStats: builder.query<any, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
      transformResponse: (r: any) => unwrap(r),
    }),

    getAnalytics: builder.query<any[], void>({
      query: () => '/analytics',
      providesTags: ['Analytics'],
      transformResponse: (r: any) => unwrap(r),
    }),

    // ── Payments ───────────────────────────────────────────────────────────
    getPayments: builder.query<any[], void>({
      query: () => '/payments',
      providesTags: ['Payments'],
      transformResponse: (r: any) => unwrap(r),
    }),

    getPaymentStats: builder.query<any, void>({
      query: () => '/payments/stats',
      providesTags: ['Payments'],
      transformResponse: (r: any) => unwrap(r),
    }),

    // ── Events ─────────────────────────────────────────────────────────────
    getEvents: builder.query<IPaginatedResponse<IAdminEvent>, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/events',
        params: params ?? {},
      }),
      providesTags: ['Events'],
      transformResponse: (r: any) => unwrapPaginated<IAdminEvent>(r),
    }),

    getEventDetail: builder.query<IAdminEvent, string>({
      query: (id) => `/events/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Events', id }],
      transformResponse: (r: any) => unwrap<IAdminEvent>(r),
    }),

    cancelEvent: builder.mutation<{ id: string; name: string; status: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/events/${id}/cancel`,
        method: 'PATCH',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ['Events'],
      transformResponse: (r: any) => unwrap(r),
    }),

    // ── Postcards ──────────────────────────────────────────────────────────
    getPostcards: builder.query<IPaginatedResponse<IAdminPostcard>, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/postcards',
        params: params ?? {},
      }),
      providesTags: ['Postcards'],
      transformResponse: (r: any) => unwrapPaginated<IAdminPostcard>(r),
    }),

    // ── Game Sessions ──────────────────────────────────────────────────────
    getGameSessions: builder.query<IPaginatedResponse<IAdminGameSession>, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/game-sessions',
        params: params ?? {},
      }),
      providesTags: ['GameSessions'],
      transformResponse: (r: any) => unwrapPaginated<IAdminGameSession>(r),
    }),

    // ── Vibe Tags ──────────────────────────────────────────────────────────
    getVibeTagStats: builder.query<IVibeTagStatsResponse, void>({
      query: () => '/vibetags',
      providesTags: ['VibeTag'],
      transformResponse: (r: any): IVibeTagStatsResponse => {
        const inner: any = unwrap(r);
        if (inner && typeof inner === 'object' && 'vibeTags' in inner) {
          return inner as IVibeTagStatsResponse;
        }
        if (Array.isArray(inner)) {
          return { total: (inner as any[]).length, vibeTags: inner as IAdminVibeTag[] };
        }
        return { total: 0, vibeTags: [] };
      },
    }),

    // ── Users ──────────────────────────────────────────────────────────────
    getUsers: builder.query<
      IPaginatedResponse<IAdminUser>,
      { page?: number; limit?: number; role?: string } | void
    >({
      query: (params) => ({
        url: '/users',
        params: params ?? {},
      }),
      providesTags: ['Users'],
      transformResponse: (r: any) => unwrapPaginated<IAdminUser>(r),
    }),

    getUserDetail: builder.query<IAdminUserDetail, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
      transformResponse: (r: any) => unwrap<IAdminUserDetail>(r),
    }),

    updateUserRole: builder.mutation<IUpdateRoleResponse, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
      transformResponse: (r: any) => unwrap<IUpdateRoleResponse>(r),
    }),

    toggleUserBan: builder.mutation<IToggleBanResponse, string>({
      query: (id) => ({
        url: `/users/${id}/ban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
      transformResponse: (r: any) => unwrap<IToggleBanResponse>(r),
    }),

    // ── Coupons ────────────────────────────────────────────────────────────
    createCoupon: builder.mutation<{ status: string; data: IAdminCoupon }, ICreateAdminCouponInput>({
      query: (coupon) => ({
        url: '/coupons',
        method: 'POST',
        body: coupon,
      }),
      invalidatesTags: ['Coupons'],
    }),

    getCoupons: builder.query<
      IPaginatedResponse<IAdminCoupon>,
      { page?: number; limit?: number; isActive?: boolean } | void
    >({
      query: (params) => ({
        url: '/coupons',
        params: params ?? {},
      }),
      providesTags: ['Coupons'],
      transformResponse: (r: any) => unwrapPaginated<IAdminCoupon>(r),
    }),

    getCouponDetail: builder.query<IAdminCouponDetail, string>({
      query: (id) => `/coupons/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Coupons', id }],
      transformResponse: (r: any) => unwrap<IAdminCouponDetail>(r),
    }),

    updateCoupon: builder.mutation<{ status: string }, { id: string; data: IUpdateAdminCouponInput }>({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Coupons'],
    }),

    deleteCoupon: builder.mutation<{ status: string }, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetPaymentsQuery,
  useGetPaymentStatsQuery,
  useGetEventsQuery,
  useGetEventDetailQuery,
  useCancelEventMutation,
  useGetPostcardsQuery,
  useGetGameSessionsQuery,
  useGetVibeTagStatsQuery,
  useGetUsersQuery,
  useGetUserDetailQuery,
  useUpdateUserRoleMutation,
  useToggleUserBanMutation,
  useCreateCouponMutation,
  useGetCouponsQuery,
  useGetCouponDetailQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = adminApi;
