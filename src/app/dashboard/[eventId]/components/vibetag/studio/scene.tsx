"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setHasSavedData,
  setIsRestoreModalOpen,
} from "@/app/provider/slices/canvas-slice";
import { canvasStore } from "@/hooks/canvas-store";

const PLACEHOLDER = "Tap to edit";

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
        cornerStyle: "circle",
        cornerColor: "#030047",
        transparentCorners: false,
      };

      // ─────────────────────────────────────────────────────────────────────
      // Proxy input keyboard bridge
      //
      // Mobile browsers only open the keyboard from focus() calls inside a
      // trusted user-gesture handler (touchend, click, etc.).
      // Fabric's hiddenTextarea is created lazily and is often detached between
      // edit sessions, so focusing it programmatically doesn't reliably open
      // the keyboard on iOS/Android.
      //
      // Solution: keep a real <input> always in the DOM. Tap on any textbox →
      // focus the proxy input (keyboard opens) → forward every keystroke into
      // the active Fabric Textbox → canvas re-renders → user sees their text.
      // ─────────────────────────────────────────────────────────────────────

      let activeTextbox: any = null;
      const proxyInput = proxyInputRef.current!;

      // Sync proxy value → Fabric textbox on every input event
      const onProxyInput = () => {
        if (!activeTextbox) return;
        const newText = proxyInput.value;
        const pos = proxyInput.selectionStart ?? newText.length;
        activeTextbox.set("text", newText || PLACEHOLDER);
        // If user has cleared to empty, show placeholder dimmed
        if (!newText) {
          activeTextbox.set({ fill: "#aaaaaa" });
        } else {
          // Restore the original fill (stored when editing began)
          if (activeTextbox._originalFill !== undefined) {
            activeTextbox.set({ fill: activeTextbox._originalFill });
          }
        }
        activeTextbox.selectionStart = pos;
        activeTextbox.selectionEnd = pos;
        fabricCanvas.requestRenderAll();
      };

      // Handle Enter key (newline in Fabric textbox)
      const onProxyKeydown = (e: KeyboardEvent) => {
        if (!activeTextbox) return;
        if (e.key === "Enter") {
          const pos = proxyInput.selectionStart ?? activeTextbox.text.length;
          const text = proxyInput.value;
          const newText = text.slice(0, pos) + "\n" + text.slice(pos);
          proxyInput.value = newText;
          activeTextbox.set("text", newText);
          fabricCanvas.requestRenderAll();
          const newPos = pos + 1;
          proxyInput.setSelectionRange(newPos, newPos);
          activeTextbox.selectionStart = newPos;
          activeTextbox.selectionEnd = newPos;
          e.preventDefault();
        }
        if (e.key === "Backspace" && proxyInput.value === "") {
          // All text deleted — restore placeholder
          activeTextbox.set({ text: PLACEHOLDER, fill: "#aaaaaa" });
          fabricCanvas.requestRenderAll();
        }
      };

      // When proxy loses focus, gracefully exit Fabric editing
      const onProxyBlur = () => {
        if (!activeTextbox) return;
        // If the textbox is empty after editing, restore placeholder
        const currentText = activeTextbox.text ?? "";
        if (!currentText || currentText === "") {
          activeTextbox.set({ text: PLACEHOLDER, fill: "#aaaaaa" });
        }
        activeTextbox.exitEditing?.();
        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();
        activeTextbox = null;
      };

      proxyInput.addEventListener("input", onProxyInput);
      proxyInput.addEventListener("keydown", onProxyKeydown);
      proxyInput.addEventListener("blur", onProxyBlur);

      // Focus proxy and enter Fabric editing mode
      const enterTextEditing = (textbox: any) => {
        // If already editing this textbox, just re-focus the proxy (re-opens keyboard)
        if (activeTextbox === textbox) {
          proxyInput.focus();
          return;
        }

        // Exit any previously active textbox
        if (activeTextbox && activeTextbox !== textbox) {
          activeTextbox.exitEditing?.();
        }

        activeTextbox = textbox;
        fabricCanvas.setActiveObject(textbox);

        // Store original fill so we can restore it after placeholder removal
        if (textbox._originalFill === undefined) {
          textbox._originalFill = textbox.fill ?? "#000000";
        }

        // Clear placeholder text and restore fill
        if (textbox.text === PLACEHOLDER) {
          textbox.set({ text: "", fill: textbox._originalFill });
          fabricCanvas.requestRenderAll();
        }

        // Enter Fabric's native editing mode so the cursor blinking renders
        if (!textbox.isEditing) {
          textbox.enterEditing();
        }
        fabricCanvas.requestRenderAll();

        // Sync proxy value to current text (empty string so keyboard shows blank)
        proxyInput.value = textbox.text === PLACEHOLDER ? "" : (textbox.text ?? "");
        proxyInput.focus();
        // Place cursor at end
        const len = proxyInput.value.length;
        proxyInput.setSelectionRange(len, len);
      };

      const blurProxy = () => {
        proxyInput.blur();
      };

      // Expose on canvasStore so Fonts.tsx and other controls can call it
      (canvasStore as any).enterTextEditing = enterTextEditing;
      (canvasStore as any).blurProxy = blurProxy;

      // ── Touch handler (trusted gesture → keyboard opens) ──────────────────
      const upperCanvas = fabricCanvas.upperCanvasEl ?? domCanvasRef.current;

      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const target = fabricCanvas.findTarget({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as any);
        if (target && (target as any).type === "textbox") {
          enterTextEditing(target as any);
        }
      };

      upperCanvas?.addEventListener("touchend", handleTouchEnd, { passive: true });

      // ── Desktop: single click enters editing immediately ──────────────────
      fabricCanvas.on("mouse:down", (e: any) => {
        if (e.target?.type === "textbox") enterTextEditing(e.target);
      });

      // ── Desktop: double-click also triggers (redundant but safe) ─────────
      fabricCanvas.on("mouse:dblclick", (e: any) => {
        if (e.target?.type === "textbox") enterTextEditing(e.target);
      });

      // ── Selection events ──────────────────────────────────────────────────
      fabricCanvas.on("selection:created", (e: any) => {
        const t = e.selected?.[0];
        if (t?.type === "textbox") enterTextEditing(t);
      });
      fabricCanvas.on("selection:updated", (e: any) => {
        const t = e.selected?.[0];
        if (t?.type === "textbox") enterTextEditing(t);
      });
      fabricCanvas.on("selection:cleared", () => {
        blurProxy();
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

      // Cleanup — remove proxy listeners and canvas
      const originalDispose = fabricCanvas.dispose.bind(fabricCanvas);
      fabricCanvas.dispose = () => {
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
    <div className="w-full flex justify-center items-center">
      <div className="flex bg-white rounded-xl shadow-md p-2.5 border border-gray-100">
        <div className="bg-gray-100 relative">
          <canvas
            ref={domCanvasRef}
            className="border border-gray-100 rounded-lg"
          />
          {/*
            Proxy input — always in the DOM, off-screen but focusable.
            Tapping a textbox focuses this input → keyboard opens on mobile.
            All keystrokes are forwarded into the active Fabric Textbox.
          */}
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
