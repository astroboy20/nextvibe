import React from "react";
import DesignTemplate from "./design-templates";

interface VibetagsProps {
  eventId: string;
  name?: string;
}
const Vibetags = ({eventId,name}:VibetagsProps) => {
  return (
    <div className="flex flex-col gap-8  overflow-y-scroll no-scrollbar">
      <DesignTemplate />
    </div>
  );
};

export default Vibetags;
