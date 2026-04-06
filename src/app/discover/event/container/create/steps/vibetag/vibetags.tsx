import React from "react";
import DesignTemplate from "./design-templates";
import { ChevronLeft } from "lucide-react";

interface VibetagsProps {
  onBack: () => void;
}
const Vibetags = ({ onBack }: VibetagsProps) => {
  return (
    <div className="flex flex-col gap-8" onClick={onBack}>
      <div className="flex gap-2 items-center">
        <ChevronLeft className="cursor-pointer" /> Back
      </div>
      <DesignTemplate />
    </div>
  );
};

export default Vibetags;
