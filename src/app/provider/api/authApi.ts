
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthResponse } from "../type";
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
        googleLogin: build.mutation<AuthResponse, string>({
            query(body) {
                return {
                    url: "/auth/google",
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
        getUser: build.query<any, void>({
            query() {
                return {
                    url: "/users/me",
                    method: "GET",
                }
            }
        }),



    })
})

export const { useLoginMutation, useGoogleLoginMutation, useRegisterMutation, useVerifyEmailMutation, useResendverificationEmailMutation, useGetUserQuery } = authApi