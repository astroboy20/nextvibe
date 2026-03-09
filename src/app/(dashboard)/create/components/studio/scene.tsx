"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { setCanvas } from "@/app/provider/slices/canvasslice";

const Scene = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<any>(null);
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

      if (!canvasRef.current || !isMounted) return;

      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 300,
        height: 600,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = fabricCanvas;
      dispatch(setCanvas(fabricCanvas));

      InteractiveFabricObject.ownDefaults = {
        ...InteractiveFabricObject.ownDefaults,
        selectable: true,
        evented: true,
        cornerStyle: "circle",
        cornerColor: "#030047",
        transparentCorners: false,
      };

      if (template?.frame) {
        FabricImage.fromURL(template.frame, { crossOrigin: "anonymous" }).then(
          (img: any) => {
            if (!fabricCanvas) return;
            img.scaleX = fabricCanvas.getWidth() / img.width;
            img.scaleY = fabricCanvas.getHeight() / img.height;
            fabricCanvas.backgroundImage = img as any;
          }
        );
      }
    };

    initFabric();

    return () => {
      isMounted = false;
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        dispatch(setCanvas(null));
      }
    };
  }, [dispatch, template]);

  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex bg-white rounded-xl shadow-md p-2.5 border border-gray-100">
        <div className="bg-gray-100">
          <canvas
            ref={canvasRef}
            className="border border-gray-100 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Scene;
