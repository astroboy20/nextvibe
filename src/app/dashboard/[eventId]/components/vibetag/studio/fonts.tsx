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

export const PLACEHOLDER = "Tap to edit";

interface FontsProps {
  canvas: any | null;
}

/**
 * Determine if a font style needs a dark tile background.
 * White fills and neon colours are invisible on a light bg.
 */
function needsDarkBg(webStyles: Record<string, any>): boolean {
  const fill = webStyles.color ?? webStyles.WebkitTextFillColor ?? "";
  if (typeof fill === "string") {
    const lower = fill.toLowerCase();
    if (lower === "#fff" || lower === "#ffffff" || lower === "white") return true;
    // Neon colours are very light/bright — always look better on dark
    if (lower.startsWith("#00") || lower === "#39ff14" || lower === "#bf5fff") return true;
  }
  // Neon shadow effects look best on dark
  const shadow = webStyles.textShadow ?? "";
  if (shadow.includes("0 0")) return true;
  return false;
}

export default function Fonts({ canvas }: FontsProps) {
  const dispatch = useDispatch();
  const isFontsOpen = useSelector((state: RootState) => state.canvas.isFontsOpen);

  const onAddText = (styles: any, originalFill?: string) => {
    if (!canvas) return;

    const text = new Textbox(PLACEHOLDER, {
      ...styles,
      fill: "#aaaaaa",           // grey placeholder until user taps
      fontSize: styles.fontSize ?? 22,
      width: 200,
      padding: 5,
      centeredScaling: true,
      editable: true,
    }) as any;

    // Store the real fill/gradient info for scene.tsx to restore on first edit
    text._originalFill = originalFill ?? styles.fill ?? "#000000";

    // Ensure the font is loaded in the browser before Fabric tries to render it.
    // Use the exact fontFamily from canvasStyles — must match the @font-face declaration.
    const fontFamily: string = styles.fontFamily ?? "Helvetica";
    const fontSize: number = styles.fontSize ?? 22;
    const fontPromise = document.fonts
      .load(`${fontSize}px "${fontFamily}"`)
      .catch(() => {/* silently fall back if font isn't available */});

    fontPromise.then(() => {
      canvas.add(text);
      canvas.centerObject(text);
      canvas.requestRenderAll();
    });

    dispatch(setIsFontsOpen(false));

    // Let dialog close animation finish, then enter editing
    setTimeout(() => {
      const enterTextEditing = (canvasStore as any).enterTextEditing;
      if (enterTextEditing) {
        enterTextEditing(text);
      } else {
        canvas.setActiveObject(text);
        text.enterEditing();
        canvas.requestRenderAll();
      }
    }, 200);
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
            {fonts.map((font, index) => {
              const dark = needsDarkBg(font.webStyles);
              // Inline style for the preview span — use webStyles directly
              const previewStyle: React.CSSProperties = {
                fontSize: "1.1rem",
                lineHeight: 1.2,
                ...font.webStyles,
              };

              return (
                <button
                  key={index}
                  onClick={() => onAddText(font.canvasStyles, font.webStyles.color as string)}
                  className="relative flex items-center justify-center rounded-xl border border-border overflow-hidden active:scale-95 transition-all duration-150"
                  style={{
                    height: 72,
                    background: dark ? "#1a1a2e" : "#f8f8f8",
                  }}
                >
                  <span
                    className="relative z-10 px-3 text-center leading-tight"
                    style={previewStyle}
                  >
                    {font.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
