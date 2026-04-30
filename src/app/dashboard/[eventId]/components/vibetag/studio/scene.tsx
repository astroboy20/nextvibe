"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setHasSavedData,
  setIsRestoreModalOpen,
} from "@/app/provider/slices/canvas-slice";
import { canvasStore } from "@/hooks/canvas-store";

const Scene = () => {
  const dispatch = useDispatch();
  const domCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const template = useSelector((state: RootState) => state.canvas.template);
  const templateFrame = template?.frame ?? null;

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

      // ✅ Make upper canvas focusable for keyboard input
      if (fabricCanvas.upperCanvasEl) {
        fabricCanvas.upperCanvasEl.setAttribute("tabindex", "0");
        fabricCanvas.upperCanvasEl.style.outline = "none";
      }

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

      const loadTemplateAndRestore = async () => {
        if (templateFrame) {
          await new Promise<void>((resolve) => {
            FabricImage.fromURL(templateFrame, { crossOrigin: "anonymous" }).then(
              (img: any) => {
                if (!isMounted) return resolve();
                img.scaleX = fabricCanvas.getWidth() / img.width;
                img.scaleY = fabricCanvas.getHeight() / img.height;
                fabricCanvas.backgroundImage = img;
                fabricCanvas.renderAll();
                resolve();
              }
            );
          });
        }

        const savedData = localStorage.getItem("fabricCanvas");
        if (savedData && isMounted) {
          dispatch(setHasSavedData(true));
          dispatch(setIsRestoreModalOpen(true));
        }
      };

      await loadTemplateAndRestore();
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
  }, [dispatch, templateFrame]);

  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex bg-white rounded-xl shadow-md p-2.5 border border-gray-100">
        <div className="bg-gray-100">
          <canvas
            ref={domCanvasRef}
            tabIndex={0}
            className="border border-gray-100 rounded-lg outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Scene;