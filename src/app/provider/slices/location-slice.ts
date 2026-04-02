
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
        setLocation(state, action: PayloadAction<Partial<UserLocation> | null>) {
            if (state.location) {
                state.location = {
                    ...state.location,
                    latitude: action.payload?.location?.latitude ?? state.location.latitude,
                    longitude: action.payload?.location?.longitude ?? state.location.longitude,
                    address: action.payload?.location?.address ?? state.location.address,
                    city: action.payload?.location?.city ?? state.location.city,
                    country: action.payload?.location?.country ?? state.location.country,
                };
            }

        },


    },
});

export const {
    setLocation
} = locationSlice.actions;

export default locationSlice.reducer;