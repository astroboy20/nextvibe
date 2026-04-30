
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getTokens } from "@/hooks/getToken";



export const userApi = createApi({
    reducerPath: "userApi",
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
        })



    })
})

export const { useGetUserQuery, useSwitchRoleMutation } = userApi