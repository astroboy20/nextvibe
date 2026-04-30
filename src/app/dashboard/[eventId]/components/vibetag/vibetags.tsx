"use client";

import React from "react";
import DesignTemplate from "./design-templates";
import { ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { setView } from "@/app/provider/slices/canvas-slice";

interface VibetagsProps {
  onClose: () => void; // ✅ was onBack
}

const Vibetags = ({ onClose }: VibetagsProps) => {
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(setView("start"));
    onClose();
  };

  const handleSaveVibeTag = (file: File) => {
    console.log("VibeTag saved:", file);
    onClose();
  };

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex gap-2 items-center cursor-pointer"
        onClick={handleBack}
      >
        <ChevronLeft /> Back
      </div>
      <DesignTemplate onSaveVibeTag={handleSaveVibeTag} />
    </div>
  );
};

export default Vibetags;
