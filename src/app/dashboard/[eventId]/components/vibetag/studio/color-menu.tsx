"use client";

import { useState, useCallback, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f7d060", "#ff2d78", "#00d4ff", "#39ff14", "#bf5fff",
];

interface ColorMenuProps {
  canvas: any | null;
}

/** Remove all gradient fills from a Fabric textbox so a solid fill can take effect */
function clearGradientFill(obj: any) {
  // Fabric v6: gradient is stored as obj.fill being a Gradient instance
  // or via fillLinearGradientColorStops / fillRadialGradientColorStops
  if (obj.fill && typeof obj.fill === "object") {
    obj.fill = "#000000";
  }
  // Also wipe out any gradient properties that were set directly
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

/** Get the active textbox — works whether or not the proxy input has focus */
function getActiveTextbox(canvas: any): any | null {
  if (!canvas) return null;
  const obj = canvas.getActiveObject();
  if (
    obj &&
    (obj.type === "text" || obj.type === "i-text" || obj.type === "textbox")
  ) {
    return obj;
  }
  return null;
}

/** Read the current solid fill color from a textbox (ignores gradients) */
function readFill(obj: any): string {
  const fill = obj?.fill;
  if (typeof fill === "string") return fill;
  // Gradient or unknown — default to black
  return "#000000";
}

export default function ColorMenu({ canvas }: ColorMenuProps) {
  const [color, setColor] = useState<string>("#000000");

  // Sync picker color whenever canvas selection changes
  useEffect(() => {
    if (!canvas) return;

    const sync = () => {
      const obj = getActiveTextbox(canvas);
      setColor(obj ? readFill(obj) : "#000000");
    };

    sync();
    canvas.on("selection:created", sync);
    canvas.on("selection:updated", sync);
    canvas.on("selection:cleared", () => setColor("#000000"));

    return () => {
      canvas.off("selection:created", sync);
      canvas.off("selection:updated", sync);
    };
  }, [canvas]);

  const applyColor = useCallback(
    (newColor: string) => {
      if (!canvas) return;

      const obj = getActiveTextbox(canvas);
      if (!obj) return;

      // 1. Strip any gradient so solid fill takes effect
      clearGradientFill(obj);

      // 2. Apply solid color
      obj.set("fill", newColor);

      // 3. Also update _originalFill so scene.tsx doesn't restore the old value
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

      <PopoverContent className="w-52 p-3 space-y-3">
        {/* Native color picker for full spectrum */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Custom color</p>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-border"
          />
        </div>

        {/* Quick preset swatches */}
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
