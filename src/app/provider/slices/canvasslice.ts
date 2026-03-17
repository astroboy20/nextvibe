import { Template } from "@/types/canvas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CanvasState {
  view: string;
  backdropFile: File | null;
  template: Template | null;

  isPreviewOpen: boolean;
  isFontsOpen: boolean;
  isElementsOpen: boolean;
  isUploadImgOpen: boolean;

  hasSavedData: boolean;
  isRestoreModalOpen: boolean;
}

const initialState: CanvasState = {
  view: "start",
  backdropFile: null,
  template: null,

  isPreviewOpen: false,
  isFontsOpen: false,
  isElementsOpen: false,
  isUploadImgOpen: false,

  hasSavedData: false,
  isRestoreModalOpen: false,
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setTemplate(state, action: PayloadAction<Template | null>) {
      state.template = action.payload;
    },

    setView(state, action: PayloadAction<string>) {
      state.view = action.payload;
    },

    setBackdropFile(state, action: PayloadAction<File | null>) {
      // File is also non-serializable, but handled separately
      state.backdropFile = action.payload;
    },

    setIsPreviewOpen(state, action: PayloadAction<boolean>) {
      state.isPreviewOpen = action.payload;
    },

    setIsFontsOpen(state, action: PayloadAction<boolean>) {
      state.isFontsOpen = action.payload;
    },

    setIsElementsOpen(state, action: PayloadAction<boolean>) {
      state.isElementsOpen = action.payload;
    },

    setIsUploadImgOpen(state, action: PayloadAction<boolean>) {
      state.isUploadImgOpen = action.payload;
    },

    setIsRestoreModalOpen(state, action: PayloadAction<boolean>) {
      state.isRestoreModalOpen = action.payload;
    },

    setHasSavedData(state, action: PayloadAction<boolean>) {
      state.hasSavedData = action.payload;
    },
  },
});

export const {
  setTemplate,
  setView,
  setBackdropFile,
  setIsPreviewOpen,
  setIsFontsOpen,
  setIsElementsOpen,
  setIsUploadImgOpen,
  setIsRestoreModalOpen,
  setHasSavedData,
} = canvasSlice.actions;

export default canvasSlice.reducer;