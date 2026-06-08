"use client";

import { useDispatch, useSelector } from "react-redux";
import { setIsFontsOpen } from "@/app/provider/slices/canvas-slice";
import { RootState } from "@/app/provider/store";
import { fonts } from "@/data/fonts";
import { Textbox } from "fabric";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { canvasStore } from "@/hooks/canvas-store";

interface FontsProps {
  canvas: any | null;
}

export default function Fonts({ canvas }: FontsProps) {
  const dispatch = useDispatch();
  const isFontsOpen = useSelector(
    (state: RootState) => state.canvas.isFontsOpen
  );

  const onAddText = (styles: any) => {
    if (!canvas) return;

    const text = new Textbox("Click to edit", {
      ...styles,
      fill: "#000",
      fontSize: 20,
      width: 200,
      padding: 5,
      centeredScaling: true,
      editable: true,
    });

    canvas.add(text);
    canvas.centerObject(text);
    canvas.requestRenderAll();

    // Focus the proxy input BEFORE closing the dialog so the keyboard
    // stays open through the dialog transition on mobile.
    const enterTextEditing = (canvasStore as any).enterTextEditing;
    if (enterTextEditing) {
      enterTextEditing(text);
    } else {
      canvas.setActiveObject(text);
      text.enterEditing();
      canvas.requestRenderAll();
    }

    dispatch(setIsFontsOpen(false));  };

  return (
    <Dialog
      open={isFontsOpen}
      onOpenChange={(open) => dispatch(setIsFontsOpen(open))}
    >
      <DialogContent className="sm:max-w-3xl w-full rounded-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Select a Font</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {fonts.map((font, index) => (
            <button
              key={index}
              onClick={() => onAddText(font.canvasStyles)}
              className="border border-red-500 flex justify-center items-center rounded-lg p-3 hover:scale-105 transition-transform duration-300"
              style={font.webStyles}
            >
              {font.name}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}