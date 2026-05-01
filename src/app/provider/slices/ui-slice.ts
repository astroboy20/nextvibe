import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  hideHeader: boolean;
}

const initialState: UIState = {
  hideHeader: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setHideHeader: (state, action: PayloadAction<boolean>) => {
      state.hideHeader = action.payload;
    },
  },
});

export const { setHideHeader } = uiSlice.actions;
export default uiSlice.reducer;