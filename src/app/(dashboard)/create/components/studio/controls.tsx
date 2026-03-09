"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setBackdropFile,
  setIsElementsOpen,
  setIsFontsOpen,
  setIsPreviewOpen,
  setIsUploadImgOpen,
  setView,
} from "@/app/provider/slices/canvasslice";
import base64ToImage from "@/utils/base64ToImg";
import { getFabric } from "@/lib/fabric/getFabric";

import Fonts from "./fonts";
import ColorMenu from "./color-menu";


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
import Preview from "./preview";
import Elements from "./elements";
import UploadImg from "./uploadImg";

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
  const canvas = useSelector((state: RootState) => state.canvas.canvas);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  // Sync selection with canvas
  useEffect(() => {
    if (!canvas) return;

    const init = async () => {
      const Fabric = await getFabric();

      const handleSelection = () => setSelectedObject(canvas.getActiveObject());
      const handleDeselection = () => setSelectedObject(null);

      canvas.on("mouse:down", handleSelection);
      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", handleDeselection);

      return () => {
        canvas.off("mouse:down", handleSelection);
        canvas.off("selection:created", handleSelection);
        canvas.off("selection:updated", handleSelection);
        canvas.off("selection:cleared", handleDeselection);
      };
    };

    init();
  }, [canvas]);

  // Handle top controls
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

  // Handle actions on selected object
  const handleActionClick = (id: string) => {
    if (!canvas || !selectedObject) return;

    switch (id) {
      case "bring-front":
        canvas.moveObjectTo(selectedObject, canvas.size() - 1);
        canvas.requestRenderAll();
        break;
      case "send-back":
        canvas.moveObjectTo(selectedObject, 0);
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

  // Save canvas as backdrop
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
      <div className="flex flex-col gap-4 w-full max-w-3xl">
        {/* Top Controls */}
        <div className="flex gap-2">
          {controls.map((control) => (
            <Card
              key={control.id}
              className="flex flex-col items-center justify-center p-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleControl(control.id)}
            >
              <control.icon className="w-6 h-6" />
              <Text className="text-xs font-semibold mt-1">
                {control.label}
              </Text>
            </Card>
          ))}
        </div>

        {/* Selected Object Controls */}
        {selectedObject && (
          <div className="border-t mt-4 pt-2">
            {selectedObject.type === "textbox" && <ColorMenu canvas={canvas} />}
            <div className="flex gap-2 mt-2">
              {controlActions.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col items-center justify-center p-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleActionClick(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                  <Text className="text-xs font-semibold mt-1">
                    {item.label}
                  </Text>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Continue / Save Button */}
        <Button
          className="mt-4 bg-primary hover:bg-primary/90 text-white"
          onClick={handleContinue}
        >
          Save
        </Button>
      </div>

      {/* Modals */}
      <Fonts canvas={canvas} />
      <Preview canvas={canvas} />
      <UploadImg canvas={canvas} />
      <Elements canvas={canvas} />
    </div>
  );
}
