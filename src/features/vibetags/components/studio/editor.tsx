"use client";

import Controls from "./controls";
import Scene from "./scene";

interface EditorProps {
  onSaveVibeTag?: (file: File, meta?: { paymentRequired: boolean; vibeTagId?: string }) => void;
  activityTiming?: string;
  eventId?: string;
  eventName?: string;
}

export default function Editor({ onSaveVibeTag, activityTiming, eventId, eventName }: EditorProps) {
  return (
    <div className="flex flex-col gap-8 mb-25">
      <Scene />
      <Controls
        onSaveVibeTag={onSaveVibeTag}
        activityTiming={activityTiming}
        eventId={eventId}
        eventName={eventName}
      />
    </div>
  );
}