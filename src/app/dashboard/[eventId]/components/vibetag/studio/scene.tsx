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
  // Persistent proxy input — always in the DOM so focus() always works
  const proxyInputRef = useRef<HTMLInputElement | null>(null);
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

      // ── Proxy input keyboard bridge ───────────────────────────────────────
      // The proxy <input> is always mounted in the DOM. When we focus it,
      // the mobile keyboard opens immediately because it's a real input element
      // in a trusted gesture context. We then forward every keystroke into
      // whichever Fabric textbox is currently being edited.
      //
      // This sidesteps the core problem: Fabric's hiddenTextarea is created
      // lazily and may be detached between edit sessions, so focus() on it
      // outside a direct user-gesture doesn't open the keyboard on mobile.

      let activeTextbox: any = null;

      const proxyInput = proxyInputRef.current;

      const focusProxy = (textbox: any) => {
        activeTextbox = textbox;
        if (proxyInput) {
          proxyInput.value = textbox.text ?? "";
          proxyInput.focus();
          // Move cursor to end
          const len = proxyInput.value.length;
          proxyInput.setSelectionRange(len, len);
        }
      };

      const blurProxy = () => {
        activeTextbox = null;
        proxyInput?.blur();
      };

      // Forward proxy input events → Fabric textbox
      if (proxyInput) {
        // input event: user typed or deleted a character
        proxyInput.addEventListener("input", () => {
          if (!activeTextbox) return;
          const newText = proxyInput.value;
          activeTextbox.set("text", newText);
          // Move cursor to match proxy input cursor
          const pos = proxyInput.selectionStart ?? newText.length;
          activeTextbox.selectionStart = pos;
          activeTextbox.selectionEnd = pos;
          fabricCanvas.requestRenderAll();
          // Keep proxy value in sync (in case Fabric modifies text)
          proxyInput.value = activeTextbox.text ?? "";
        });

        // keydown: handle special keys (Enter, Backspace, arrow keys)
        proxyInput.addEventListener("keydown", (e) => {
          if (!activeTextbox) return;
          if (e.key === "Enter") {
            const pos = proxyInput.selectionStart ?? activeTextbox.text.length;
            const text = activeTextbox.text as string;
            const newText = text.slice(0, pos) + "\n" + text.slice(pos);
            activeTextbox.set("text", newText);
            activeTextbox.selectionStart = pos + 1;
            activeTextbox.selectionEnd = pos + 1;
            fabricCanvas.requestRenderAll();
            proxyInput.value = activeTextbox.text;
            const newPos = pos + 1;
            proxyInput.setSelectionRange(newPos, newPos);
            e.preventDefault();
          }
        });

        // blur: exit editing when proxy loses focus
        proxyInput.addEventListener("blur", () => {
          if (activeTextbox) {
            activeTextbox.exitEditing?.();
            activeTextbox = null;
            fabricCanvas.requestRenderAll();
          }
        });
      }

      // ── Core enter-editing function ───────────────────────────────────────
      const PLACEHOLDER = "Click to edit";

      const enterTextEditing = (textbox: any) => {
        fabricCanvas.setActiveObject(textbox);
        fabricCanvas.requestRenderAll();

        // Clear placeholder text on first edit
        if (textbox.text === PLACEHOLDER) {
          textbox.set("text", "");
          fabricCanvas.requestRenderAll();
        }

        // Enter Fabric's editing mode so cursor renders
        if (!textbox.isEditing) {
          textbox.enterEditing();
          fabricCanvas.requestRenderAll();
        }
        // Focus the proxy input to open the mobile keyboard
        focusProxy(textbox);
      };

      // Expose for Fonts.tsx
      (canvasStore as any).enterTextEditing = enterTextEditing;
      (canvasStore as any).blurProxy = blurProxy;

      // ── Raw touch handler on the upper canvas ─────────────────────────────
      // touchend is a trusted gesture — focus() called here WILL open keyboard
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

      // ── Desktop: double-click ─────────────────────────────────────────────
      fabricCanvas.on("mouse:dblclick", (e: any) => {
        if (e.target?.type === "textbox") enterTextEditing(e.target);
      });

      // ── Desktop/mobile: single click — covers both new selections and
      //    clicks on an already-selected textbox (which don't fire
      //    selection:created / selection:updated again) ───────────────────────
      fabricCanvas.on("mouse:down", (e: any) => {
        if (e.target?.type === "textbox") enterTextEditing(e.target);
      });

      // ── selection events (kept for completeness / fast path) ─────────────
      fabricCanvas.on("selection:created", (e: any) => {
        const t = e.selected?.[0];
        if (t?.type === "textbox") enterTextEditing(t);
      });
      fabricCanvas.on("selection:updated", (e: any) => {
        const t = e.selected?.[0];
        if (t?.type === "textbox") enterTextEditing(t);
      });

      // ── Exit editing when canvas selection is cleared ─────────────────────
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

      // Cleanup
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
        <div className="bg-gray-100 relative">
          <canvas
            ref={domCanvasRef}
            className="border border-gray-100 rounded-lg"
          />
          {/*
            Proxy input — always in the DOM, positioned off-screen so it's
            invisible but focusable. The mobile keyboard opens when this
            input is focused (trusted gesture). Keystrokes are bridged to
            whichever Fabric textbox is active.
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
              position: "absolute",
              top: 0,
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
