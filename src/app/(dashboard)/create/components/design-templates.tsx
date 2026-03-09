"use client";

import { RootState } from "@/app/provider/store";
import { useSelector } from "react-redux";
import Templates from "./studio/templates";
import Editor from "./studio/editor";
import { Start } from "./studio/start";

interface DesignTemplateProps {
  onSaveVibeTag?: (file) => void;
}

export default function DesignTemplate({ onSaveVibeTag }: DesignTemplateProps) {
  const view = useSelector((state: RootState) => state.canvas.view);

  return (
    <div>
      {view === "start" && <Start />}
      {view === "template" && <Templates />}
      {view === "editor" && <Editor onSaveVibeTag={onSaveVibeTag} />}
    </div>
  );
}
