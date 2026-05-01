// ✅ Guard against duplicate initialization in Next.js dev (Fast Refresh)
declare global {
  var __canvasStore:
    | {
        canvas: any;
        listeners: Array<(canvas: any) => void>;
      }
    | undefined;
}

// ✅ use globalThis instead of global
if (!globalThis.__canvasStore) {
  globalThis.__canvasStore = { canvas: null, listeners: [] };
}

const store = globalThis.__canvasStore!;

export const canvasStore = {
  get(): any {
    return store.canvas;
  },

  set(canvas: any) {
    store.canvas = canvas;
    store.listeners.forEach((fn) => fn(canvas));
  },

  onChange(fn: (canvas: any) => void) {
    store.listeners.push(fn);
    return () => {
      const idx = store.listeners.indexOf(fn);
      if (idx > -1) store.listeners.splice(idx, 1);
    };
  },
};