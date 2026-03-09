"use client";

import { useDispatch, useSelector } from "react-redux";
import { setIsFontsOpen } from "@/app/provider/slices/canvasslice";
import { RootState } from "@/app/provider/store";
import { fonts } from "@/data/fonts";
import { Canvas, Textbox } from "fabric";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FontsProps {
  canvas: Canvas | null;
}

export default function Fonts({ canvas }: FontsProps) {
  const dispatch = useDispatch();
  const isFontsOpen = useSelector(
    (state: RootState) => state.canvas.isFontsOpen
  );

  const onAddText = (styles: any) => {
    if (canvas) {
      const text = new Textbox("Click to edit", {
        ...styles,
        fill: "#000",
        fontSize: 20,
        width: 110,
        padding: 5,
        centeredScaling: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.centerObject(text);
      canvas.renderAll();
      dispatch(setIsFontsOpen(false));
    }
  };

  return (
    <Dialog
      open={isFontsOpen}
      onOpenChange={(open) => dispatch(setIsFontsOpen(open))}
    >
      <DialogContent className="sm:max-w-3xl w-full rounded-lg">
        <DialogHeader>
          <DialogTitle>Select a Font</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute top-2 right-2">
              Close
            </Button>
          </DialogClose>
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
