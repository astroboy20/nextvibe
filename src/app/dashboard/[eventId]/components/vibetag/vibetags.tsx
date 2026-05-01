"use client";

import DesignTemplate from "./design-templates";

interface VibetagsProps {
  onClose: () => void;
}

const Vibetags = ({ onClose }: VibetagsProps) => {
  const handleSaveVibeTag = (file: File) => {
    console.log("VibeTag saved:", file);
    onClose();
  };

  return (
    <div className="flex flex-col gap-8">
     
      <DesignTemplate onSaveVibeTag={handleSaveVibeTag} />
    </div>
  );
};

export default Vibetags;
