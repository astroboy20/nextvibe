
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthResponse } from "../type";



export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        // prepareHeaders: (headers) => {
        //     const { user_token, tutor_token } = getTokens()
        //     if (user_token || tutor_token) {
        //         headers.set("Authorization", `Bearer ${user_token || tutor_token}`)
        //     }
        // }
    }),
    endpoints: (build) => ({

        login: build.mutation({
            query(body) {
                return {
                    url: "/auth/login",
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
        register: build.mutation<AuthResponse, string>({
            query(body) {
                return {
                    url: "/auth/register",
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
        })



    })
})

export const { useLoginMutation, useGoogleLoginMutation, useRegisterMutation, useVerifyEmailMutation, useResendverificationEmailMutation } = authApi