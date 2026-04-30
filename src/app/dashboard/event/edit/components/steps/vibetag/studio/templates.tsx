"use client";

import { useDispatch, useSelector } from "react-redux";
import { setTemplate, setView } from "@/app/provider/slices/canvas-slice";
import { RootState } from "@/app/provider/store";
import { allTemplates } from "@/data/templates";
import { Template } from "@/types/canvas";
import { PRIMARY_COLOR } from "@/utils/constants";
import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Templates() {
  const dispatch = useDispatch();
  const template = useSelector((state: RootState) => state.canvas.template);

  const handleTemplate = (template: Template) => {
    dispatch(setTemplate(template));
    dispatch(setView("editor"));
  };

  return (
    <div className="space-y-6 my-20">
      {/* Header & Category Select */}
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-semibold">
          Create your own vibetag for your event
        </h2>
        <p className="text-sm text-gray-500">
          Get started by selecting a category or template
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Start from Scratch */}
        <Card
          className="h-52 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => dispatch(setView("editor"))}
        >
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 border border-(--primary-color) flex items-center justify-center rounded-full">
              <Check size={20} color={PRIMARY_COLOR} />
            </div>
            <CardTitle className="text-center uppercase font-bold text-gray-700 text-lg">
              Start from scratch
            </CardTitle>
          </CardContent>
        </Card>

        {/* Render all templates */}
        {allTemplates.map((temp) => {
          const selected = temp.id === template?.id;
          return (
            <Card
              key={temp.id}
              className={cn(
                "relative h-52 cursor-pointer overflow-hidden transition-all duration-200",
                selected
                  ? `border-2 border-[${PRIMARY_COLOR}] scale-105 bg-gray-50 shadow-sm`
                  : "border border-gray-200 bg-white hover:scale-105"
              )}
              onClick={() => handleTemplate(temp)}
            >
              <Image
                src={temp.mock}
                alt={temp.name}
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                priority
              />
              {selected && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 bg-(--primary-color) rounded-full flex items-center justify-center"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <Check size={16} color="white" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
