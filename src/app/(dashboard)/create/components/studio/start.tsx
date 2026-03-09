"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { PRIMARY_COLOR } from "@/utils/constants";
import { useDispatch } from "react-redux";
import { setView } from "@/app/provider/slices/canvasslice";

export function Start() {
  const dispatch = useDispatch();
  const handleWithTemplate = () => {
    dispatch(setView("template"));
  };

  return (
    <div>
      <div className="flex flex-col gap-8 mb-12">
        {/* Design with Templates */}
        <Card
          onClick={handleWithTemplate}
          className="cursor-pointer rounded-xl border hover:shadow-md transition"
        >
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                style={{ borderColor: PRIMARY_COLOR }}
              >
                <Menu size={22} color={PRIMARY_COLOR} />
              </Button>

              <div className="flex flex-col">
                <h3 className="font-medium leading-none">
                  Design with Templates
                </h3>

                <p className="text-xs text-muted-foreground">
                  Drag & drop editor with pre-made templates
                </p>
              </div>
            </div>

            {/* Templates Preview */}
            <div className="flex gap-4 px-4">
              <div className="w-[35%] rounded-md bg-muted overflow-hidden">
                <Image
                  src="/template1.png"
                  alt="Template 1"
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex-1 rounded-md bg-muted overflow-hidden">
                <Image
                  src="/template2.png"
                  alt="Template 2"
                  width={600}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
