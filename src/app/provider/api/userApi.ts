
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";



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
        })



    })
})

export const { useGetUserQuery, useSwitchRoleMutation } = userApi