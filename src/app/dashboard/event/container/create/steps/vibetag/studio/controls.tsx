"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setBackdropFile,
  setIsElementsOpen,
  setIsFontsOpen,
  setIsPreviewOpen,
  setIsUploadImgOpen,
  setView,
} from "@/app/provider/slices/canvas-slice";
import base64ToImage from "@/utils/base64ToImg";

import Fonts from "./fonts";
import ColorMenu from "./color-menu";
import Preview from "./preview";
import Elements from "./elements";
import UploadImg from "./uploadImg";

import {
  Text,
  Image,
  Eye,
  Trash2,
  ChevronUp,
  ChevronDown,
  Smile,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCanvas } from "@/hooks/use-canvas";

interface ControlItem {
  label: string;
  id: string;
  icon: any;
}

const controls: ControlItem[] = [
  { label: "Add Text", id: "add-text", icon: Text },
  { label: "Add Elements", id: "add-elements", icon: Smile },
  { label: "Upload Image", id: "upload-img", icon: Image },
  { label: "Preview", id: "preview", icon: Eye },
];

const controlActions: ControlItem[] = [
  { label: "Bring to Front", id: "bring-front", icon: ChevronUp },
  { label: "Send to Back", id: "send-back", icon: ChevronDown },
  { label: "Delete", id: "del", icon: Trash2 },
];

interface ControlsProps {
  onSaveVibeTag?: (file: File) => void;
}

export default function Controls({ onSaveVibeTag }: ControlsProps) {
  const dispatch = useDispatch();
  const canvas = useCanvas(); 
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj ?? null);
    };
    const handleDeselection = () => setSelectedObject(null);

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleDeselection);
    canvas.on("mouse:down", handleSelection);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleDeselection);
      canvas.off("mouse:down", handleSelection);
    };
  }, [canvas]);

  const handleControl = (id: string) => {
    switch (id) {
      case "add-text":
        dispatch(setIsFontsOpen(true));
        break;
      case "preview":
        dispatch(setIsPreviewOpen(true));
        break;
      case "add-elements":
        dispatch(setIsElementsOpen(true));
        break;
      case "upload-img":
        dispatch(setIsUploadImgOpen(true));
        break;
    }
  };

  const handleActionClick = (id: string) => {
    if (!canvas || !selectedObject) return;

    switch (id) {
      case "bring-front":
        canvas.bringObjectToFront(selectedObject);
        canvas.requestRenderAll();
        break;
      case "send-back":
        canvas.sendObjectToBack(selectedObject);
        canvas.requestRenderAll();
        break;
      case "del":
        canvas.remove(selectedObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        setSelectedObject(null);
        break;
    }
  };

  const handleContinue = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ multiplier: 1, format: "png" });
    const file = base64ToImage(dataUrl, "backdrop.png");
    dispatch(setBackdropFile(file));
    if (onSaveVibeTag) onSaveVibeTag(file);
    dispatch(setView("start"));
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-4 w-full">
        {/* Top Controls */}
        <div className="grid grid-cols-2 gap-2">
          {controls.map((control) => (
            <div
              key={control.id}
              className="flex flex-col items-center justify-center p-4 cursor-pointer hover:scale-105 transition-transform w-full border shadow-sm p-2 rounded"
              onClick={() => handleControl(control.id)}
            >
              <control.icon className="w-6 h-6" />
              <div className="text-xs font-semibold mt-1">{control.label}</div>
            </div>
          ))}
        </div>

        {/* Selected Object Controls */}
        {selectedObject && (
          <div className="border-t mt-4 pt-2">
            {selectedObject.type === "textbox" && (
              <ColorMenu canvas={canvas} />
            )}
            <div className="flex gap-2 mt-2">
              {controlActions.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col items-center justify-center p-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleActionClick(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-semibold mt-1">
                    {item.label}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Button
          className="mt-4 bg-primary hover:bg-primary/90 text-white"
          onClick={handleContinue}
        >
          Save
        </Button>
      </div>

      {/* Modals receive the live canvas instance */}
      <Fonts canvas={canvas} />
      <Preview canvas={canvas} />
      <UploadImg canvas={canvas} />
      <Elements canvas={canvas} />
    </div>
  );
}