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
    const activeObject = canvas?.getActiveObject();
    if (
      activeObject &&
      (activeObject.type === "text" ||
        activeObject.type === "i-text" ||
        activeObject.type === "textbox")
    ) {
      const fill = activeObject.get("fill");
      return typeof fill === "string" ? fill : "#000000";
    }
    return "#000000";
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const updateColor = () => setColor(getTextColor());
    // ✅ Store handler reference so .off() can remove the exact same fn
    const clearColor = () => setColor("#000000");

    updateColor();

    canvas.on("selection:created", updateColor);
    canvas.on("selection:updated", updateColor);
    canvas.on("selection:cleared", clearColor);

    return () => {
      canvas.off("selection:created", updateColor);
      canvas.off("selection:updated", updateColor);
      canvas.off("selection:cleared", clearColor); // ✅ same reference
    };
  }, [canvas, getTextColor]);

  const applyColorToText = useCallback(
    (newColor: string) => {
      if (!canvas) return;
      const activeObject = canvas.getActiveObject();
      if (
        activeObject &&
        (activeObject.type === "text" ||
          activeObject.type === "i-text" ||
          activeObject.type === "textbox")
      ) {
        activeObject.set("fill", newColor);
        canvas.renderAll();
      }
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