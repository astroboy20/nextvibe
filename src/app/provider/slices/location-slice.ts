import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserLocation {
    location: {
        latitude: number;
        longitude: number;
        address: string;
        city: string;
        country: string;
    } | null;
    /** true once city/country has been successfully synced to the backend this session */
    synced: boolean;
}

const initialState: UserLocation = {
    location: {
        latitude: 0,
        longitude: 0,
        address: "",
        city: "",
        country: "",
    },
    synced: false,
};

const locationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        setLocation(state, action: PayloadAction<UserLocation["location"] | null>) {
            if (!action.payload) return;
            state.location = {
                ...state.location,
                ...action.payload,
            };
        },
        setLocationSynced(state, action: PayloadAction<boolean>) {
            state.synced = action.payload;
        },
    },
});

export const { setLocation, setLocationSynced } = locationSlice.actions;

export default locationSlice.reducer;