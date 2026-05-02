
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getTokens } from "@/hooks/getToken";



export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        prepareHeaders: (headers) => {
            const { accessToken } = getTokens()

            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`)
            }
        }
    }),
    endpoints: (build) => ({

        login: build.mutation({
            query(body) {
                return {
                    url: "/v1/auth/login",
                    method: "POST",
                    body
                }
            }
        }),
        googleLogin: build.mutation({
            query(body: { idToken: string }) {
                return {
                    url: "/v1/auth/oauth/google",
                    method: "POST",
                    credentials: "include",
                    body
                }
            }
        }),
        register: build.mutation({
            query(body) {
                return {
                    url: "/v1/auth/register",
                    method: "POST",
                    body
                }
            }
        }),
        verifyEmail: build.mutation({
            query(body) {
                return {
                    url: "/auth/verify-email",
                    method: "POST",
                    body
                }
            }
        }),
        resendverificationEmail: build.mutation({
            query(body) {
                return {
                    url: "/auth/request-new-verification",
                    method: "POST",
                    body
                }
            }
        }),
        forgotPassword: build.mutation({
            query(body) {
                return {
                    url: "/v1/auth/forgot-password",
                    method: "POST",
                    body
                }
            }
        }),
        getUser: build.query<any, void>({
            query() {
                return {
                    url: "/v1/users/me",
                    method: "GET",
                }
            }
        }),
        getMe: build.query<any, void>({
            query() {
                return {
                    url: "/v1/me",
                    method: "GET",
                }
            }
        }),
        getOrganizerEvents: build.query<any, string>({
            query(organizerId) {
                return {
                    url: `/v1/events/organizer/${organizerId}`,
                    method: "GET",
                }
            }
        }),
        getUserBasic: build.query<any, string>({
            query(userId) {
                return {
                    url: `/v1/users/${userId}/basic`,
                    method: "GET",
                }
            }
        }),
        getUserActivity: build.query<any, string>({
            query(userId) {
                return {
                    url: `/v1/users/${userId}/activity`,
                    method: "GET",
                }
            }
        }),
        logout: build.mutation<void, void>({
            query() {
                return {
                    url: "/v1/auth/logout",
                    method: "POST",
                }
            }
        }),



    })
})

export const { useLoginMutation, useGoogleLoginMutation, useRegisterMutation, useVerifyEmailMutation, useResendverificationEmailMutation, useGetUserQuery, useGetMeQuery, useGetUserBasicQuery, useGetUserActivityQuery, useGetOrganizerEventsQuery, useForgotPasswordMutation, useLogoutMutation } = authApi