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

// Must match the PLACEHOLDER constant in scene.tsx
const PLACEHOLDER = "Tap to edit";

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

    // Store the intended fill so scene.tsx can restore it after clearing the placeholder
    const intendedFill = styles.fill ?? styles.fillLinearGradientColorStops ? undefined : "#000000";

    const text = new Textbox(PLACEHOLDER, {
      ...styles,
      // Show placeholder in a muted grey so the user knows to tap
      fill: "#aaaaaa",
      fontSize: styles.fontSize ?? 22,
      width: 200,
      padding: 5,
      centeredScaling: true,
      editable: true,
    }) as any;

    // Store the real fill so scene.tsx can restore it when user starts typing
    text._originalFill = intendedFill ?? styles.fill ?? "#000000";

    canvas.add(text);
    canvas.centerObject(text);
    canvas.requestRenderAll();

    // Close the dialog first, then immediately enter editing so
    // the keyboard opens right away on mobile
    dispatch(setIsFontsOpen(false));

    // Small tick to let the dialog close animation finish, then enter editing
    setTimeout(() => {
      const enterTextEditing = (canvasStore as any).enterTextEditing;
      if (enterTextEditing) {
        enterTextEditing(text);
      } else {
        canvas.setActiveObject(text);
        text.enterEditing();
        canvas.requestRenderAll();
      }
    }, 150);
  };

  return (
    <Dialog
      open={isFontsOpen}
      onOpenChange={(open) => dispatch(setIsFontsOpen(open))}
    >
      <DialogContent className="sm:max-w-2xl w-full rounded-xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-base font-semibold">Choose a Text Style</DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tap a style to add it to your canvas
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {fonts.map((font, index) => (
              <button
                key={index}
                onClick={() => onAddText(font.canvasStyles)}
                className="relative flex items-center justify-center rounded-xl border border-border bg-muted/40 hover:border-primary/60 hover:bg-muted/80 active:scale-95 transition-all duration-150 overflow-hidden"
                style={{ height: 72 }}
              >
                {/* Background pattern for dark text styles */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2220%22 height%3D%2220%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect width%3D%2210%22 height%3D%2210%22 fill%3D%22%23f5f5f5%22%2F%3E%3Crect x%3D%2210%22 y%3D%2210%22 width%3D%2210%22 height%3D%2210%22 fill%3D%22%23f5f5f5%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

                <span
                  className="relative z-10 px-3 py-1 text-center leading-tight truncate max-w-full"
                  style={{
                    fontSize: "1.15rem",
                    ...font.webStyles,
                  }}
                >
                  {font.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
