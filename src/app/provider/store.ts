import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/user"
import eventFormReducer from "./slices/eventform-slice"
import locationReducer from "./slices/location-slice"
import uiReducer from "./slices/ui-slice";
import { authApi } from "./api/authApi";
import canvasReducer from "./slices/canvas-slice";
import { gamesApi } from "./api/gameApi";
import { eventsApi } from "./api/eventApi";
import { userApi } from "./api/userApi";
import { messagingApi } from "./api/messagingApi";
import { socialApi } from "./api/socialApi";
import { paymentApi } from "./api/paymentApi";
import { notificationApi } from "./api/notificationApi";
import { adminApi } from "./api/admin";
import { organizerPaymentApi } from "./api/organizerPaymentApi";
import { reminderApi } from "./api/reminderApi";
import { pledgeApi } from "./api/pledgeApi";

export const store = configureStore({
    reducer: {
        user: authReducer,
        eventForm: eventFormReducer,
        canvas: canvasReducer,
        location: locationReducer,
        ui: uiReducer,
        [authApi.reducerPath]: authApi.reducer,
        [gamesApi.reducerPath]: gamesApi.reducer,
        [eventsApi.reducerPath]: eventsApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [messagingApi.reducerPath]: messagingApi.reducer,
        [socialApi.reducerPath]: socialApi.reducer,
        [paymentApi.reducerPath]: paymentApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [organizerPaymentApi.reducerPath]: organizerPaymentApi.reducer,
        [reminderApi.reducerPath]: reminderApi.reducer,
        [pledgeApi.reducerPath]: pledgeApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(
            authApi.middleware,
            gamesApi.middleware,
            eventsApi.middleware,
            userApi.middleware,
            messagingApi.middleware,
            socialApi.middleware,
            paymentApi.middleware,
            notificationApi.middleware,
            adminApi.middleware,
            organizerPaymentApi.middleware,
            reminderApi.middleware,
            pledgeApi.middleware,
        )
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch