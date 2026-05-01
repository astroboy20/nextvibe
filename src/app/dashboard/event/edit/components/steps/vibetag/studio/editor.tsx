"use client";

import Controls from "./controls";
import Scene from "./scene";

interface EditorProps {
  onSaveVibeTag?: (file: File) => void;
  name: string;
  eventId: string;
}

export default function Editor({ onSaveVibeTag, eventId, name }: EditorProps) {
  return (
    <div className="flex flex-col gap-8 mb-25">
      <Scene />
      <Controls onSaveVibeTag={onSaveVibeTag} eventId={eventId} name={name} />
    </div>
  );
}
