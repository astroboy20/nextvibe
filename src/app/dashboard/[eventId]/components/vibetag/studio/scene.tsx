"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setHasSavedData,
  setIsRestoreModalOpen,
} from "@/app/provider/slices/canvas-slice";
import { canvasStore } from "@/hooks/canvas-store";

export const PLACEHOLDER = "Tap to edit";

const Scene = () => {
  const dispatch = useDispatch();
  const domCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const proxyInputRef = useRef<HTMLInputElement | null>(null);
  const template = useSelector((state: RootState) => state.canvas.template);
  const templateFrame = template?.frame ?? null;

  useEffect(() => {
    let isMounted = true;

    const initFabric = async () => {
      const fabricModule = await import("fabric");
      const { Canvas, Image: FabricImage, InteractiveFabricObject } = fabricModule;

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
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        cornerStyle: "circle",
        cornerColor: "#030047",
        transparentCorners: false,
      };

      // ─────────────────────────────────────────────────────────────────────
      // Proxy input keyboard bridge
      //
      // Mobile browsers only open the keyboard from focus() inside a trusted
      // user-gesture handler. We keep a real <textarea> always in the DOM.
      // Tapping a textbox focuses this proxy → keyboard opens → keystrokes
      // are forwarded into the active Fabric Textbox.
      // ─────────────────────────────────────────────────────────────────────

      let activeTextbox: any = null;
      // Track whether the user is dragging so we don't enter edit on move
      let pointerMoved = false;

      const proxyInput = proxyInputRef.current!;

      const onProxyInput = () => {
        if (!activeTextbox) return;
        const newText = proxyInput.value;
        const pos = proxyInput.selectionStart ?? newText.length;

        if (!newText) {
          activeTextbox.set({ text: PLACEHOLDER, fill: "#aaaaaa" });
        } else {
          activeTextbox.set("text", newText);
          if (activeTextbox._originalFill !== undefined) {
            activeTextbox.set({ fill: activeTextbox._originalFill });
          }
        }

        activeTextbox.selectionStart = pos;
        activeTextbox.selectionEnd = pos;
        fabricCanvas.requestRenderAll();
      };

      const onProxyKeydown = (e: KeyboardEvent) => {
        if (!activeTextbox) return;
        if (e.key === "Enter") {
          const pos = proxyInput.selectionStart ?? activeTextbox.text.length;
          const text = proxyInput.value;
          const newText = text.slice(0, pos) + "\n" + text.slice(pos);
          proxyInput.value = newText;
          activeTextbox.set("text", newText);
          if (activeTextbox._originalFill !== undefined) {
            activeTextbox.set({ fill: activeTextbox._originalFill });
          }
          fabricCanvas.requestRenderAll();
          const newPos = pos + 1;
          proxyInput.setSelectionRange(newPos, newPos);
          activeTextbox.selectionStart = newPos;
          activeTextbox.selectionEnd = newPos;
          e.preventDefault();
        }
      };

      // On blur: exit editing but keep the object selected so color picker still works
      const onProxyBlur = () => {
        if (!activeTextbox) return;
        const currentText = activeTextbox.text ?? "";
        if (!currentText || currentText === PLACEHOLDER) {
          activeTextbox.set({ text: PLACEHOLDER, fill: "#aaaaaa" });
        }
        activeTextbox.exitEditing?.();
        // DO NOT discard active object — keep it selected so color/actions still apply
        fabricCanvas.requestRenderAll();
        // Don't null out activeTextbox here — color picker needs it
      };

      proxyInput.addEventListener("input", onProxyInput);
      proxyInput.addEventListener("keydown", onProxyKeydown);
      proxyInput.addEventListener("blur", onProxyBlur);

      // Enter text editing mode (only called on intentional tap/click, not drag)
      const enterTextEditing = (textbox: any) => {
        if (activeTextbox === textbox && textbox.isEditing) {
          // Already editing — just re-focus to reopen keyboard
          proxyInput.focus();
          return;
        }

        if (activeTextbox && activeTextbox !== textbox) {
          activeTextbox.exitEditing?.();
        }

        activeTextbox = textbox;
        fabricCanvas.setActiveObject(textbox);

        if (textbox._originalFill === undefined) {
          textbox._originalFill =
            typeof textbox.fill === "string" ? textbox.fill : "#000000";
        }

        if (textbox.text === PLACEHOLDER) {
          textbox.set({ text: "", fill: textbox._originalFill });
          fabricCanvas.requestRenderAll();
        }

        if (!textbox.isEditing) {
          textbox.enterEditing();
        }
        fabricCanvas.requestRenderAll();

        proxyInput.value = textbox.text === PLACEHOLDER ? "" : (textbox.text ?? "");
        proxyInput.focus();
        const len = proxyInput.value.length;
        proxyInput.setSelectionRange(len, len);
      };

      const exitTextEditing = () => {
        if (activeTextbox) {
          const t = activeTextbox.text ?? "";
          if (!t || t === PLACEHOLDER) {
            activeTextbox.set({ text: PLACEHOLDER, fill: "#aaaaaa" });
          }
          activeTextbox.exitEditing?.();
          fabricCanvas.requestRenderAll();
        }
        // Keep activeTextbox set so color picker can still reference it
        proxyInput.blur();
      };

      // Expose on canvasStore for Fonts.tsx, ColorMenu, etc.
      (canvasStore as any).enterTextEditing = enterTextEditing;
      (canvasStore as any).exitTextEditing = exitTextEditing;
      (canvasStore as any).getActiveTextbox = () => activeTextbox;

      // ── Touch: distinguish tap vs drag ────────────────────────────────────
      const upperCanvas = fabricCanvas.upperCanvasEl ?? domCanvasRef.current;
      let touchStartX = 0, touchStartY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        pointerMoved = false;
      };

      const handleTouchMove = () => {
        pointerMoved = true;
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch) return;

        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);
        // Only enter editing if it was a tap (< 8px movement)
        if (dx > 8 || dy > 8) return;

        // findTarget returns a different type in this Fabric version — cast via unknown
        const target = fabricCanvas.findTarget({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as any) as unknown as any;
        if (target?.type === "textbox") {
          enterTextEditing(target);
        } else if (activeTextbox) {
          exitTextEditing();
        }
      };

      upperCanvas?.addEventListener("touchstart", handleTouchStart, { passive: true });
      upperCanvas?.addEventListener("touchmove", handleTouchMove, { passive: true });
      upperCanvas?.addEventListener("touchend", handleTouchEnd, { passive: true });

      // ── Desktop: distinguish click vs drag ────────────────────────────────
      fabricCanvas.on("mouse:down", () => { pointerMoved = false; });
      fabricCanvas.on("mouse:move", () => { pointerMoved = true; });
      fabricCanvas.on("mouse:up", (e: any) => {
        if (pointerMoved) return; // was a drag — don't enter edit
        if (e.target?.type === "textbox") {
          enterTextEditing(e.target);
        } else if (!e.target && activeTextbox) {
          // Clicked on empty canvas area — exit editing
          exitTextEditing();
          fabricCanvas.discardActiveObject();
          fabricCanvas.requestRenderAll();
        }
      });

      // ── Selection events ──────────────────────────────────────────────────
      fabricCanvas.on("selection:cleared", () => {
        if (activeTextbox) {
          exitTextEditing();
        }
        activeTextbox = null;
      });

      // ── Persistence ───────────────────────────────────────────────────────
      const saveCanvas = () => {
        try {
          const json = fabricCanvas.toJSON();
          localStorage.setItem("fabricCanvas", JSON.stringify(json));
          dispatch(setHasSavedData(true));
        } catch (err) {
          console.error("Failed to save canvas:", err);
        }
      };
      fabricCanvas.on("object:added", saveCanvas);
      fabricCanvas.on("object:modified", saveCanvas);
      fabricCanvas.on("object:removed", saveCanvas);

      // ── Template + restore ────────────────────────────────────────────────
      const loadTemplateAndRestore = async () => {
        if (templateFrame) {
          await new Promise<void>((resolve) => {
            FabricImage.fromURL(templateFrame, { crossOrigin: "anonymous" }).then(
              (img: any) => {
                if (!isMounted) return resolve();
                const cw = fabricCanvas.getWidth();
                const ch = fabricCanvas.getHeight();
                const iw = img.width || img.getElement?.()?.naturalWidth || cw;
                const ih = img.height || img.getElement?.()?.naturalHeight || ch;
                img.set({
                  left: 0,
                  top: 0,
                  originX: "left",
                  originY: "top",
                  scaleX: cw / iw,
                  scaleY: ch / ih,
                  selectable: false,
                  evented: false,
                });
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

      const originalDispose = fabricCanvas.dispose.bind(fabricCanvas);
      fabricCanvas.dispose = () => {
        upperCanvas?.removeEventListener("touchstart", handleTouchStart);
        upperCanvas?.removeEventListener("touchmove", handleTouchMove);
        upperCanvas?.removeEventListener("touchend", handleTouchEnd);
        proxyInput.removeEventListener("input", onProxyInput);
        proxyInput.removeEventListener("keydown", onProxyKeydown);
        proxyInput.removeEventListener("blur", onProxyBlur);
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
    <div className="w-full flex justify-center items-center overflow-hidden">
      <div className="flex bg-white rounded-xl shadow-md p-2.5 border border-gray-100 max-w-full">
        <div className="bg-gray-100 relative overflow-hidden">
          <canvas
            ref={domCanvasRef}
            className="border border-gray-100 rounded-lg block max-w-full"
            style={{ touchAction: "none" }}
          />
          <input
            ref={proxyInputRef}
            type="text"
            aria-hidden="true"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Scene;
