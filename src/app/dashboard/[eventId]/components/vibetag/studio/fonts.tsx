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

    dispatch(setIsFontsOpen(false));

    // ✅ Use the shared enterTextEditing helper from Scene.tsx via canvasStore.
    // This is the ONLY reliable way in Fabric v6 — it focuses the hidden textarea
    // that Fabric uses for keyboard input. Without this, text editing breaks
    // after deselection because the browser focus lands on the wrong element.
    setTimeout(() => {
      const enterTextEditing = (canvasStore as any).enterTextEditing;
      if (enterTextEditing) {
        enterTextEditing(text);
      } else {
        // Fallback in case the helper isn't ready yet
        canvas.setActiveObject(text);
        text.enterEditing();
        // Force focus on the hidden textarea
        if (text.hiddenTextarea) {
          text.hiddenTextarea.focus();
          text.hiddenTextarea.click();
        }
        canvas.requestRenderAll();
      }
    }, 100);
  };

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