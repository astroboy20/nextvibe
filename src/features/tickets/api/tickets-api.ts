import { baseApi } from "@/store/api/baseApi";

/**
 * Ticket tiers of an event.
 *
 * Injected into `baseApi` so they share the `"Event"` tag with `events-api`:
 * changing a tier refetches the event page that lists it.
 */
export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation<any, { eventId: string; ticketData: any }>({
      query: ({ eventId, ticketData }) => ({
        url: `/v1/events/${eventId}/tickets`,
        method: "POST",
        body: ticketData,
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    updateTicket: builder.mutation<
      any,
      { eventId: string; ticketData: any; ticketId: string }
    >({
      query: ({ eventId, ticketData, ticketId }) => ({
        url: `/v1/events/${eventId}/tickets/${ticketId}`,
        method: "PATCH",
        body: ticketData,
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    deleteTicket: builder.mutation<any, { eventId: string; ticketId: any }>({
      query: ({ eventId, ticketId }) => ({
        url: `/v1/events/${eventId}/tickets/${ticketId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    getTickets: builder.query<any, string>({
      query: (eventId) => `/v1/events/${eventId}/tickets`,
      providesTags: (_, __, id) => [{ type: "Event", id }],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useGetTicketsQuery,
} = ticketsApi;
