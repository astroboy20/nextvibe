"use client";

import DesignTemplate from "./design-templates";

interface VibetagsProps {
  onClose: () => void;
  activityTiming: string;
  eventId: string;
  eventName?: string;
}

const Vibetags = ({ onClose, activityTiming, eventId, eventName }: VibetagsProps) => {
  const handleSaveVibeTag = (file: File) => {
    onClose();
  };

  return (
    <div className="flex flex-col gap-8">
      <DesignTemplate
        onSaveVibeTag={handleSaveVibeTag}
        activityTiming={activityTiming}
        eventId={eventId}
        eventName={eventName}
      />
    </div>
  );
};

export default Vibetags;
