import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/user"
import eventFormReducer from "./slices/eventformslice"
import { authApi } from "./api/authApi";
import canvasReducer from "./slices/canvasslice";
import { gamesApi } from "./api/gameApi";
import { eventsApi } from "./api/eventApi";
import { userApi } from "./api/userApi";

export const store = configureStore({
    reducer: {
        user: authReducer,
        eventForm: eventFormReducer,
        canvas: canvasReducer,
        [authApi.reducerPath]: authApi.reducer,
        [gamesApi.reducerPath]: gamesApi.reducer,
        [eventsApi.reducerPath]: eventsApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(
            authApi.middleware,
            gamesApi.middleware,
            eventsApi.middleware,
            userApi.middleware
        )
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch