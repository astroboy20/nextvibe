"use client";

import { useState, useCallback, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorMenuProps {
  canvas: any | null;
}

export default function ColorMenu({ canvas }: ColorMenuProps) {
  const [color, setColor] = useState<string>("#000000");

  const getTextColor = useCallback(() => {
    if (!canvas) return "#000000";
    const activeObject = canvas.getActiveObject();
    if (
      activeObject &&
      (activeObject.type === "text" ||
        activeObject.type === "i-text" ||
        activeObject.type === "textbox")
    ) {
      // ✅ If the textbox is in editing mode and has a text selection,
      // read from the selection's styles rather than the object-level fill.
      // This gives accurate feedback when different parts have different colors.
      if (activeObject.isEditing) {
        const selectionStart = activeObject.selectionStart ?? 0;
        const styles = activeObject.getSelectionStyles(
          selectionStart,
          selectionStart + 1,
          true
        );
        if (styles?.length && styles[0]?.fill) {
          return styles[0].fill as string;
        }
      }
      const fill = activeObject.get("fill");
      return typeof fill === "string" ? fill : "#000000";
    }
    return "#000000";
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const updateColor = () => setColor(getTextColor());

    updateColor();

    canvas.on("selection:created", updateColor);
    canvas.on("selection:updated", updateColor);
    canvas.on("selection:cleared", () => setColor("#000000"));
    // ✅ Also update when the cursor moves within a textbox during editing
    canvas.on("text:selection:changed", updateColor);

    return () => {
      canvas.off("selection:created", updateColor);
      canvas.off("selection:updated", updateColor);
      canvas.off("selection:cleared");
      canvas.off("text:selection:changed", updateColor);
    };
  }, [canvas, getTextColor]);

  const applyColorToText = useCallback(
    (newColor: string) => {
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (
        !activeObject ||
        (activeObject.type !== "text" &&
          activeObject.type !== "i-text" &&
          activeObject.type !== "textbox")
      ) {
        return;
      }

      // ✅ CRITICAL: Fabric v6 distinguishes between two states:
      //
      // 1. Textbox is in EDITING MODE with characters selected:
      //    → Use setSelectionStyles() to color only the selected characters.
      //    → Also update the object-level fill so newly typed chars inherit the color.
      //
      // 2. Textbox is SELECTED but NOT in editing mode (object selected on canvas):
      //    → Use activeObject.set("fill") to recolor the whole text block.
      //
      // Using only set("fill") in case 1 changes the whole block color but does NOT
      // update already-styled characters, making the color picker appear broken.

      if (activeObject.isEditing) {
        const selectionStart = activeObject.selectionStart ?? 0;
        const selectionEnd = activeObject.selectionEnd ?? 0;

        if (selectionStart !== selectionEnd) {
          // Characters are highlighted — color just the selection
          activeObject.setSelectionStyles(
            { fill: newColor },
            selectionStart,
            selectionEnd
          );
        }
        // Always update object-level fill so new characters typed use this color
        activeObject.set("fill", newColor);
      } else {
        // Not in editing mode — color the whole textbox
        activeObject.set("fill", newColor);
        // Clear any per-character style overrides so the new color takes full effect
        if (typeof activeObject.cleanStyle === "function") {
          activeObject.cleanStyle("fill");
        }
      }

      // ✅ Use requestRenderAll (not renderAll) — this is the correct Fabric v6 API.
      // renderAll() is synchronous and can cause issues; requestRenderAll() schedules
      // a proper re-render on the next animation frame.
      canvas.requestRenderAll();
    },
    [canvas]
  );

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    applyColorToText(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-10 h-10 p-0 rounded-full border"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-36 p-4">
        <div className="flex flex-col items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 p-0 border-none rounded-lg cursor-pointer"
          />
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => document.body.click()}
          >
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}