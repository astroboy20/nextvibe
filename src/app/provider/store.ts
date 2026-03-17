import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/user"
import eventFormReducer from "./slices/eventformslice"
import { authApi } from "./api/authApi";
import canvasReducer from "./slices/canvasslice";
import { gamesApi } from "./api/gameApi";
import { eventsApi } from "./api/eventApi";

export const store = configureStore({
    reducer: {
        user: authReducer,
        eventForm: eventFormReducer,
        canvas: canvasReducer,
        [authApi.reducerPath]: authApi.reducer,
        [gamesApi.reducerPath]: gamesApi.reducer,
        [eventsApi.reducerPath]: eventsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(
            authApi.middleware,
            gamesApi.middleware,
            eventsApi.middleware
        )
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch