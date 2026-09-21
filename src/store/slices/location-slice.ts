import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * NDPC Compliance — Location Slice
 *
 * Only stores city and country — no precise coordinates or full addresses.
 * This satisfies the NDPA 2023 principle of data minimisation.
 */

export interface UserLocation {
  location: {
    city: string;
    country: string;
  } | null;
  /** true once city/country has been successfully synced to the backend this session */
  synced: boolean;
}

const initialState: UserLocation = {
  location: {
    city: "",
    country: "",
  },
  synced: false,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation(
      state,
      action: PayloadAction<{ city: string; country: string } | null>
    ) {
      if (!action.payload) return;
      state.location = {
        city: action.payload.city,
        country: action.payload.country,
      };
    },
    setLocationSynced(state, action: PayloadAction<boolean>) {
      state.synced = action.payload;
    },
    clearLocation(state) {
      state.location = null;
      state.synced = false;
    },
  },
});

export const { setLocation, setLocationSynced, clearLocation } =
  locationSlice.actions;

export default locationSlice.reducer;
