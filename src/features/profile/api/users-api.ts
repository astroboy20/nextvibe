
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/api/baseQuery";



export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: baseQueryWithReauth,
    keepUnusedDataFor: 300,
    endpoints: (build) => ({



        getUser: build.query<any, void>({
            query() {
                return {
                    url: "/v1/users/me",
                    method: "GET",
                }
            }
        }),
        switchRole: build.mutation({
            query(role: string) {
                return {
                    url: "/v1/users/me/switch-role",
                    method: "POST",
                    body: { role }
                }
            }
        }),

        /**
         * PATCH /v1/users/me
         * Syncs city + country to the backend once per session after location resolves.
         * Uses the existing profile update endpoint — city and country are optional fields.
         */
        updateMe: build.mutation<any, { city?: string; country?: string }>({
            query(body) {
                return {
                    url: "/v1/users/me",
                    method: "PATCH",
                    body,
                }
            }
        }),

        /** GET /v1/users/me/deletion-check — what blocks deletion, and whether a password is needed. */
        getDeletionCheck: build.query<
            {
                canDelete: boolean;
                blockers: { code: string; message: string }[];
                needsPassword: boolean;
            },
            void
        >({
            query: () => ({ url: "/v1/users/me/deletion-check", method: "GET" }),
            transformResponse: (res: any) => res?.data ?? res,
        }),

        /**
         * DELETE /v1/users/me — anonymizes the account and signs it out
         * everywhere. Purchases and payouts are kept as "Deleted user".
         */
        deleteAccount: build.mutation<{ deleted: true }, { password?: string }>({
            query: (body) => ({ url: "/v1/users/me", method: "DELETE", body }),
        }),



    })
})

export const { useGetUserQuery, useSwitchRoleMutation, useUpdateMeMutation, useGetDeletionCheckQuery, useDeleteAccountMutation } = userApi