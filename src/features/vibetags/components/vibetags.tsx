"use client";

import DesignTemplate from "./design-templates";

interface VibetagsProps {
  onClose: (meta?: { paymentRequired: boolean; vibeTagId?: string }) => void;
  activityTiming: string;
  eventId: string;
  eventName?: string;
}

const Vibetags = ({ onClose, activityTiming, eventId, eventName }: VibetagsProps) => {
  const handleSaveVibeTag = (_file: File, meta?: { paymentRequired: boolean; vibeTagId?: string }) => {
    onClose(meta);
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
