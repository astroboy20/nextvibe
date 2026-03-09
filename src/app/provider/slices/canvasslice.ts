import { Template } from "@/types/canvas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface CanvasState {
    view: string;
    canvas: any | null;
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
    canvas: null,
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


        setCanvas(state, action: PayloadAction<any | null>) {
            const canvas = action.payload;

            if (state.canvas) {
                state.canvas.off("object:added");
                state.canvas.off("object:modified");
                state.canvas.off("object:removed");
            }

            if (canvas) {
                const saveCanvas = () => {
                    const json = canvas.toJSON();

                    if (typeof window !== "undefined") {
                        localStorage.setItem("fabricCanvas", JSON.stringify(json));
                    }

                    state.hasSavedData = true;
                };

                canvas.on("object:added", saveCanvas);
                canvas.on("object:modified", saveCanvas);
                canvas.on("object:removed", saveCanvas);
            }

            const savedData =
                typeof window !== "undefined" &&
                localStorage.getItem("fabricCanvas");

            state.canvas = canvas;
            state.hasSavedData = !!savedData;
            state.isRestoreModalOpen = !!savedData;
        },


        setTemplate(state, action: PayloadAction<Template | null>) {
            state.template = action.payload;
        },


        setView(state, action: PayloadAction<string>) {
            state.view = action.payload;
        },

        setBackdropFile(state, action: PayloadAction<File | null>) {
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


        saveCanvasToLocalStorage(state) {
            if (!state.canvas) return;

            const json = state.canvas.toJSON();

            if (typeof window !== "undefined") {
                localStorage.setItem("fabricCanvas", JSON.stringify(json));
            }

            state.hasSavedData = true;
        },

        loadCanvasFromLocalStorage(state) {
            if (!state.canvas) return;

            const savedData =
                typeof window !== "undefined" &&
                localStorage.getItem("fabricCanvas");

            if (savedData) {
                state.canvas.loadFromJSON(JSON.parse(savedData), () => {
                    state.canvas.renderAll();
                });
            }

            state.isRestoreModalOpen = false;
        },
    },
});

export const {
    setCanvas,
    setTemplate,
    setView,
    setBackdropFile,
    setIsPreviewOpen,
    setIsFontsOpen,
    setIsElementsOpen,
    setIsUploadImgOpen,
    setIsRestoreModalOpen,
    saveCanvasToLocalStorage,
    loadCanvasFromLocalStorage,
} = canvasSlice.actions;

export default canvasSlice.reducer;