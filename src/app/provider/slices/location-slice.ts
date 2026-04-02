
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



export interface UserLocation {
    location: {
        latitude: number;
        longitude: number;
        address: string;
        city: string;
        country: string;
    } | null

}



const initialState: UserLocation = {
    location: {
        latitude: 0,
        longitude: 0,
        address: "",
        city: "",
        country: "",
    },

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
        }


    },
});

export const {
    setLocation
} = locationSlice.actions;

export default locationSlice.reducer;