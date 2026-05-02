"use client";

import { RootState } from "@/app/provider/store";
import { useDispatch, useSelector } from "react-redux";
import { setView } from "@/app/provider/slices/canvas-slice";
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

  useEffect(() => {
    dispatch(setView("start"));
  }, [dispatch]);

  return (
    <div>
      {view === "start" && <Start />}
      {view === "template" && <Templates />}
      {view === "editor" && (
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
