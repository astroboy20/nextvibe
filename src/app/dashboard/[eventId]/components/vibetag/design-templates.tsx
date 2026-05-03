"use client";

import { RootState } from "@/app/provider/store";
import { useDispatch, useSelector } from "react-redux";
import { setView, setTemplate } from "@/app/provider/slices/canvas-slice";
import { useEffect } from "react";
import Templates from "./studio/templates";
import Editor from "./studio/editor";
import { Start } from "./studio/start";

interface DesignTemplateProps {
  onSaveVibeTag?: (file: File) => void;
  activityTiming?: string;
  eventId?: string;
  eventName?: string;
}

export default function DesignTemplate({ onSaveVibeTag, activityTiming, eventId, eventName }: DesignTemplateProps) {
  const dispatch = useDispatch();
  const view = useSelector((state: RootState) => state.canvas.view);

  // Reset to start screen and clear any previously selected template every time this mounts
  useEffect(() => {
    dispatch(setView("start"));
    dispatch(setTemplate(null));
  }, [dispatch]);

  // Guard: don't render editor/template until the reset has taken effect
  const safeView = view === "start" || view === "template" || view === "editor" ? view : "start";

  return (
    <div>
      {safeView === "start" && <Start />}
      {safeView === "template" && <Templates />}
      {safeView === "editor" && (
        <Editor
          onSaveVibeTag={onSaveVibeTag}
          activityTiming={activityTiming}
          eventId={eventId}
          eventName={eventName}
        />
      )}
    </div>
  );
}
