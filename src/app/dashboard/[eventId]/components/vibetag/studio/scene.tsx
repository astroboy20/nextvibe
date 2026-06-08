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

      canvasStore.set(fabricCanvas);

      InteractiveFabricObject.ownDefaults = {
        ...InteractiveFabricObject.ownDefaults,
        selectable: true,
        evented: true,
        cornerStyle: "circle",
        cornerColor: "#030047",
        transparentCorners: false,
      };

      // ✅ The ONLY reliable way to handle text editing in Fabric v6
      // Fabric v6 uses a hidden textarea for keyboard input.
      // We must focus that textarea — NOT the canvas element.
      const enterTextEditing = (textbox: any) => {
        fabricCanvas.setActiveObject(textbox);
        fabricCanvas.requestRenderAll();
        textbox.enterEditing();
        // Focus the hidden textarea that Fabric v6 uses for input.
        // Do NOT call .select() — on mobile it can immediately steal/drop
        // the focus, preventing the keyboard from appearing.
        if (textbox.hiddenTextarea) {
          textbox.hiddenTextarea.focus();
          textbox.hiddenTextarea.click();
        }
        fabricCanvas.requestRenderAll();
      };

      // ✅ Handle double click to re-edit existing textboxes
      fabricCanvas.on("mouse:dblclick", (e: any) => {
        const target = e.target;
        if (target && target.type === "textbox") {
          enterTextEditing(target);
        }
      });

      // Enter edit mode when a textbox is selected (first tap / selection:created)
      fabricCanvas.on("selection:created", (e: any) => {
        const target = e.selected?.[0];
        if (target && target.type === "textbox" && !target.isEditing) {
          setTimeout(() => enterTextEditing(target), 50);
        }
      });

      // Re-enter edit mode when the same textbox is tapped again after
      // being deselected — Fabric fires selection:updated in this case,
      // not selection:created.
      fabricCanvas.on("selection:updated", (e: any) => {
        const target = e.selected?.[0];
        if (target && target.type === "textbox" && !target.isEditing) {
          setTimeout(() => enterTextEditing(target), 50);
        }
      });

      // Also handle mouse:down as a fallback for iOS Safari which sometimes
      // skips dblclick entirely.
      fabricCanvas.on("mouse:down", (e: any) => {
        const target = e.target;
        if (
          target &&
          target.type === "textbox" &&
          fabricCanvas.getActiveObject() === target &&
          !target.isEditing
        ) {
          setTimeout(() => enterTextEditing(target), 50);
        }
      });

      // ✅ Expose helper on store so Fonts.tsx can call it too
      (canvasStore as any).enterTextEditing = enterTextEditing;

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
            FabricImage.fromURL(templateFrame, {
              crossOrigin: "anonymous",
            }).then((img: any) => {
              if (!isMounted) return resolve();
              img.scaleX = fabricCanvas.getWidth() / img.width;
              img.scaleY = fabricCanvas.getHeight() / img.height;
              fabricCanvas.backgroundImage = img;
              fabricCanvas.renderAll();
              resolve();
            });
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
            className="border border-gray-100 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Scene;