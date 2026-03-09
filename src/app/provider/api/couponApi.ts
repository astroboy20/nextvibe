import { ICoupon, IApplyCouponResponse, IApplyCouponInput, ICreateCouponInput } from "@/types/coupon.type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const couponApi = createApi({
    reducerPath: "couponApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        // Optionally, you can add headers here
        // prepareHeaders: (headers) => {
        //   const token = getToken();
        //   if (token) headers.set("Authorization", `Bearer ${token}`);
        // }
    }),
    endpoints: (build) => ({
        verifyCoupon: build.query<{ status: string; data: ICoupon }, { code: string; cartTotal: number }>({
            query: ({ code, cartTotal }) => ({
                url: `/coupons/verify/${code}?cartTotal=${cartTotal}`,
                method: "GET",
            }),
        }),

        applyCoupon: build.mutation<{ status: string; data: IApplyCouponResponse }, IApplyCouponInput>({
            query: (body) => ({
                url: "/coupons/apply",
                method: "POST",
                body,
            }),
        }),

        getAllCoupons: build.query<{ status: string; data: ICoupon[] }, void>({
            query: () => ({
                url: "/coupons",
                method: "GET",
            }),
        }),

        getCouponById: build.query<{ status: string; data: ICoupon }, string>({
            query: (id) => ({
                url: `/coupons/${id}`,
                method: "GET",
            }),
        }),

        createCoupon: build.mutation<{ status: string; data: any }, ICreateCouponInput>({
            query: (body) => ({
                url: "/coupons",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useLazyVerifyCouponQuery,
    useApplyCouponMutation,
    useGetAllCouponsQuery,
    useGetCouponByIdQuery,
    useCreateCouponMutation,
} = couponApi;