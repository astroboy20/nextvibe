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

      // ── Core text editing entry point ─────────────────────────────────────
      // Must be called synchronously inside a trusted user-gesture handler
      // (touchstart/touchend/click) for mobile keyboards to appear.
      const enterTextEditing = (textbox: any) => {
        if (textbox.isEditing) return; // already editing — don't interrupt
        fabricCanvas.setActiveObject(textbox);
        textbox.enterEditing();
        fabricCanvas.requestRenderAll();
        if (textbox.hiddenTextarea) {
          textbox.hiddenTextarea.focus();
          textbox.hiddenTextarea.click();
        }
      };

      // ── Expose for Fonts.tsx ──────────────────────────────────────────────
      (canvasStore as any).enterTextEditing = enterTextEditing;

      // ── Touch handler on the raw DOM canvas ──────────────────────────────
      // This fires synchronously in the browser's trusted gesture context,
      // so focus() on the hidden textarea will actually open the keyboard
      // on iOS/Android. Fabric's own event chain runs on touchend, which
      // is already too late for some mobile browsers.
      const upperCanvas = fabricCanvas.upperCanvasEl ?? domCanvasRef.current;
      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch) return;

        // Get canvas-relative coordinates
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (touch.clientX - rect.left) / (fabricCanvas.getZoom() ?? 1);
        const y = (touch.clientY - rect.top) / (fabricCanvas.getZoom() ?? 1);

        // Find the topmost object at the touch point
        const target = fabricCanvas.findTarget({ clientX: touch.clientX, clientY: touch.clientY } as any);
        if (target && (target as any).type === "textbox") {
          // Synchronously focus — this IS inside a trusted gesture handler
          enterTextEditing(target as any);
        }
      };

      upperCanvas?.addEventListener("touchend", handleTouchEnd, { passive: true });

      // ── Mouse double-click (desktop fallback) ─────────────────────────────
      fabricCanvas.on("mouse:dblclick", (e: any) => {
        const target = e.target;
        if (target && target.type === "textbox") {
          enterTextEditing(target);
        }
      });

      // ── selection:created — first time a textbox is tapped (desktop) ──────
      fabricCanvas.on("selection:created", (e: any) => {
        const target = e.selected?.[0];
        if (target && target.type === "textbox" && !target.isEditing) {
          enterTextEditing(target);
        }
      });

      // ── selection:updated — re-tapping a previously deselected textbox ────
      fabricCanvas.on("selection:updated", (e: any) => {
        const target = e.selected?.[0];
        if (target && target.type === "textbox" && !target.isEditing) {
          enterTextEditing(target);
        }
      });

      // ── Persistence ───────────────────────────────────────────────────────
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

      // Cleanup touch listener with the canvas
      const originalDispose = fabricCanvas.dispose.bind(fabricCanvas);
      fabricCanvas.dispose = () => {
        upperCanvas?.removeEventListener("touchend", handleTouchEnd);
        return originalDispose();
      };
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