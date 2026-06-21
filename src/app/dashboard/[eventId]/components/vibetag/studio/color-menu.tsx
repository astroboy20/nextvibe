"use client";

import { useState, useCallback, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { canvasStore } from "@/hooks/canvas-store";

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f7d060", "#ff2d78", "#00d4ff", "#39ff14", "#bf5fff",
];

interface ColorMenuProps {
  canvas: any | null;
}

/** Strip gradient fill so solid color can take effect */
function clearGradient(obj: any) {
  if (obj.fill && typeof obj.fill === "object") {
    obj.fill = "#000000";
  }
  obj.set({
    fillLinearGradientStartPoint: undefined,
    fillLinearGradientEndPoint: undefined,
    fillLinearGradientColorStops: undefined,
    fillRadialGradientStartPoint: undefined,
    fillRadialGradientEndPoint: undefined,
    fillRadialGradientColorStops: undefined,
    fillPriority: undefined,
  });
}

/** Read the active textbox — from canvas selection OR from canvasStore proxy */
function resolveTextbox(canvas: any): any | null {
  if (!canvas) return null;
  // First try canvas active object
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === "text" || obj.type === "i-text" || obj.type === "textbox")) {
    return obj;
  }
  // Fall back to the textbox tracked by scene.tsx (survives proxy blur)
  const fromStore = (canvasStore as any).getActiveTextbox?.();
  if (fromStore && (fromStore.type === "text" || fromStore.type === "i-text" || fromStore.type === "textbox")) {
    return fromStore;
  }
  return null;
}

function readFill(obj: any): string {
  const fill = obj?.fill;
  return typeof fill === "string" ? fill : "#000000";
}

export default function ColorMenu({ canvas }: ColorMenuProps) {
  const [color, setColor] = useState<string>("#000000");

  useEffect(() => {
    if (!canvas) return;
    const sync = () => {
      const obj = resolveTextbox(canvas);
      setColor(obj ? readFill(obj) : "#000000");
    };
    sync();
    canvas.on("selection:created", sync);
    canvas.on("selection:updated", sync);
    canvas.on("selection:cleared", () => setColor("#000000"));
    return () => {
      canvas.off("selection:created", sync);
      canvas.off("selection:updated", sync);
      canvas.off("selection:cleared", sync);
    };
  }, [canvas]);

  const applyColor = useCallback(
    (newColor: string) => {
      if (!canvas) return;
      const obj = resolveTextbox(canvas);
      if (!obj) return;
      clearGradient(obj);
      obj.set("fill", newColor);
      obj._originalFill = newColor;
      canvas.requestRenderAll();
    },
    [canvas]
  );

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    applyColor(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-10 h-10 p-0 rounded-full border-2 border-border shadow-sm"
          style={{ backgroundColor: color }}
          aria-label="Text color"
          title="Change text color"
        />
      </PopoverTrigger>

      <PopoverContent
        className="w-52 p-3 space-y-3"
        // Prevent popover open/close from triggering canvas blur
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Custom color</p>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-border"
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Presets</p>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#6366f1" : "transparent",
                  boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #e5e7eb" : undefined,
                }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
