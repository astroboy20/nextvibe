"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsElementsOpen } from "@/app/provider/slices/canvasslice";
import { allElements } from "@/data/elements";
import { Canvas, FabricImage } from "fabric";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ElementsProps {
  canvas: Canvas | null;
}

export default function Elements({ canvas }: ElementsProps) {
  const dispatch = useDispatch();
  const isElementsOpen = useSelector((state: any) => state.canvas.isElementsOpen);
  const [tabValue, setTabValue] = useState("fsvg");

  const handleAddElement = (url: string) => {
    FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
      img.scaleToWidth(200);
      canvas?.setActiveObject(img);
      canvas?.centerObject(img);
      canvas?.add(img);
    });
    dispatch(setIsElementsOpen(false));
  };

  return (
    <Dialog open={isElementsOpen} onOpenChange={(open) => !open && dispatch(setIsElementsOpen(false))}>
      <DialogContent className="max-w-4xl w-full p-6">
        <DialogHeader>
          <DialogTitle>Add Elements</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <Tabs value={tabValue} onValueChange={setTabValue} className="mt-4">
          <TabsList>
            <TabsTrigger value="fsvg">Flat SVG</TabsTrigger>
            <TabsTrigger value="others" disabled>
              Others
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fsvg" className="mt-4">
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {allElements.map((element, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-2 rounded-lg flex justify-center items-center hover:scale-105 transition-transform duration-200"
                  onClick={() => handleAddElement(element.url)}
                >
                  <Image
                    src={element.url}
                    width={80}
                    height={80}
                    alt="Element"
                    className="object-contain"
                  />
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="others" className="mt-4">
            <p className="text-sm text-gray-500 text-center">Coming soon...</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}