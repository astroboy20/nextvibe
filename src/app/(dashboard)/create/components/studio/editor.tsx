"use client";
import Controls from "./controls";
import Scene from "./scene";

interface EditorProps {
  onSaveVibeTag?: (file: File) => void;
}

export default function Editor({ onSaveVibeTag }: EditorProps) {
  return (
    <div className="flex flex-col gap-8 mb-12">
      <Scene />
      <Controls onSaveVibeTag={onSaveVibeTag} />
    </div>
  );
}
