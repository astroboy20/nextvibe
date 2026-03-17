"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setHasSavedData,
  setIsRestoreModalOpen,
} from "@/app/provider/slices/canvasslice";
import { canvasStore } from "@/hooks/canvas-store";

const Scene = () => {
  const dispatch = useDispatch();
  const domCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const template = useSelector((state: RootState) => state.canvas.template);

  useEffect(() => {
    let isMounted = true;

    const initFabric = async () => {
      const fabricModule = await import("fabric");
      const {
        Canvas,
        Image: FabricImage,
        InteractiveFabricObject,
      } = fabricModule;

      if (!domCanvasRef.current || !isMounted) return;

      // Dispose any existing canvas first
      const existing = canvasStore.get();
      if (existing) {
        existing.dispose();
        canvasStore.set(null);
      }

      const fabricCanvas = new Canvas(domCanvasRef.current, {
        width: 300,
        height: 600,
        preserveObjectStacking: true,
      });

      canvasStore.set(fabricCanvas);

      InteractiveFabricObject.ownDefaults = {
        ...InteractiveFabricObject.ownDefaults,
        selectable: true,
        evented: true,
        cornerStyle: "circle",
        cornerColor: "#030047",
        transparentCorners: false,
      };

      const saveCanvas = () => {
        try {
          const json = fabricCanvas.toJSON();
          localStorage.setItem("fabricCanvas", JSON.stringify(json));
          dispatch(setHasSavedData(true));
        } catch (e) {
          console.error("Failed to save canvas:", e);
        }
      };

      fabricCanvas.on("object:added", saveCanvas);
      fabricCanvas.on("object:modified", saveCanvas);
      fabricCanvas.on("object:removed", saveCanvas);

      const savedData = localStorage.getItem("fabricCanvas");
      if (savedData) {
        dispatch(setHasSavedData(true));
        dispatch(setIsRestoreModalOpen(true));
      }

      if (template?.frame) {
        FabricImage.fromURL(template.frame, { crossOrigin: "anonymous" }).then(
          (img: any) => {
            if (!isMounted) return;
            img.scaleX = fabricCanvas.getWidth() / img.width;
            img.scaleY = fabricCanvas.getHeight() / img.height;
            fabricCanvas.backgroundImage = img;
            fabricCanvas.renderAll();
          }
        );
      }
    };

    initFabric();

    return () => {
      isMounted = false;
      const c = canvasStore.get();
      if (c) {
        c.dispose();
        canvasStore.set(null);
      }
    };
  }, [dispatch, template]);

  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex bg-white rounded-xl shadow-md p-2.5 border border-gray-100">
        <div className="bg-gray-100">
          <canvas
            ref={domCanvasRef}
            className="border border-gray-100 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Scene;
