
let _canvas: any = null;
const _listeners: Array<(canvas: any) => void> = [];

export const canvasStore = {
  get(): any {
    return _canvas;
  },

  set(canvas: any) {
    _canvas = canvas;
    _listeners.forEach((fn) => fn(canvas));
  },

  onChange(fn: (canvas: any) => void) {
    _listeners.push(fn);
    return () => {
      const idx = _listeners.indexOf(fn);
      if (idx > -1) _listeners.splice(idx, 1);
    };
  },
};