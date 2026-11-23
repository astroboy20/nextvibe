import { baseApi } from "@/store/api/baseApi";
import {
  CoOrganizerListResponse,
  CoOrganizerRole,
  PendingCoOrganizerInvite,
  CoOrganizerStatus,
} from "@/features/events/types";

/**
 * Co-Organizer & Team Management API
 * 
 * Implements the full co-organizer system with:
 * - 3-tier role hierarchy (OWNER, SUPER_ADMIN, CO_ORGANIZER)
 * - Invite management with 7-day expiry
 * - Role promotion/demotion (OWNER only)
 * - Team member removal with permission checks
 */

export const coOrganizersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Event-Scoped Team Management ────────────────────────────────────────

    /**
     * GET /events/:eventId/co-organizers
     * Access: OWNER, SUPER_ADMIN, CO_ORGANIZER
     * Returns team roster filtered by requester role
     */
    getCoOrganizers: builder.query<CoOrganizerListResponse, string>({
      query: (eventId) => `/v1/events/${eventId}/co-organizers`,
      providesTags: (_, __, eventId) => [
        { type: "Event", id: `${eventId}-coorganizers` },
      ],
    }),

    /**
     * POST /events/:eventId/co-organizers
     * Access: OWNER and SUPER_ADMIN
     * Invite a new co-organizer by email
     */
    inviteCoOrganizer: builder.mutation<
      {
        id: string;
        email: string;
        role: CoOrganizerRole;
        status: CoOrganizerStatus;
        expiresAt: string;
        emailSent: boolean;
      },
      { eventId: string; email: string; role?: CoOrganizerRole }
    >({
      query: ({ eventId, email, role }) => ({
        url: `/v1/events/${eventId}/co-organizers`,
        method: "POST",
        body: { email, ...(role ? { role } : {}) },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: `${eventId}-coorganizers` },
      ],
    }),

    /**
     * PATCH /events/:eventId/co-organizers/:coOrganizerId/role
     * Access: OWNER only
     * Promote/demote a co-organizer
     */
    updateCoOrganizerRole: builder.mutation<
      { id: string; role: CoOrganizerRole; status: CoOrganizerStatus },
      { eventId: string; coOrganizerId: string; role: CoOrganizerRole }
    >({
      query: ({ eventId, coOrganizerId, role }) => ({
        url: `/v1/events/${eventId}/co-organizers/${coOrganizerId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: `${eventId}-coorganizers` },
        { type: "Event", id: eventId },
      ],
    }),

    /**
     * DELETE /events/:eventId/co-organizers/:coOrganizerId
     * Access: OWNER (can remove anyone), SUPER_ADMIN (can remove CO_ORGANIZERs only)
     */
    removeCoOrganizer: builder.mutation<
      { message: string },
      { eventId: string; coOrganizerId: string }
    >({
      query: ({ eventId, coOrganizerId }) => ({
        url: `/v1/events/${eventId}/co-organizers/${coOrganizerId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: `${eventId}-coorganizers` },
      ],
    }),

    /**
     * DELETE /events/:eventId/co-organizers/me
     * Access: Any accepted SUPER_ADMIN or CO_ORGANIZER
     * Leave the event team
     */
    leaveEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `/v1/events/${eventId}/co-organizers/me`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, eventId) => [
        { type: "Event", id: `${eventId}-coorganizers` },
        { type: "Event", id: eventId },
        "Events",
      ],
    }),

    // ── Invitee Actions (User-Scoped) ──────────────────────────────────────

    /**
     * GET /co-organizers/invites
     * Returns all pending invites for the signed-in user's email
     */
    getMyPendingInvites: builder.query<PendingCoOrganizerInvite[], void>({
      query: () => "/v1/co-organizers/invites",
      providesTags: ["Events"],
    }),

    /**
     * POST /co-organizers/invites/:token/accept
     * Accept a co-organizer invite
     */
    acceptInvite: builder.mutation<
      { eventId: string; eventName: string; role: CoOrganizerRole },
      string
    >({
      query: (token) => ({
        url: `/v1/co-organizers/invites/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Events"],
    }),

    /**
     * POST /co-organizers/invites/:token/decline
     * Decline a co-organizer invite
     */
    declineInvite: builder.mutation<{ message: string }, string>({
      query: (token) => ({
        url: `/v1/co-organizers/invites/${token}/decline`,
        method: "POST",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetCoOrganizersQuery,
  useInviteCoOrganizerMutation,
  useUpdateCoOrganizerRoleMutation,
  useRemoveCoOrganizerMutation,
  useLeaveEventMutation,
  useGetMyPendingInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} = coOrganizersApi;
