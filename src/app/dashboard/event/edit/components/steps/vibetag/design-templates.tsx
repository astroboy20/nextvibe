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
  eventId?: string;
  name?: string;
}

export default function DesignTemplate({
  onSaveVibeTag,
  eventId,
  name,
}: DesignTemplateProps) {
  const dispatch = useDispatch();
  const view = useSelector((state: RootState) => state.canvas.view);

  // ✅ Reset to "start" whenever this component mounts (i.e. modal opens)
  useEffect(() => {
    dispatch(setView("start"));
  }, [dispatch]);

  return (
    <div>
      {view === "start" && <Start />}
      {view === "template" && <Templates />}
      {view === "editor" && (
        <Editor onSaveVibeTag={onSaveVibeTag} eventId={eventId} name={name} />
      )}
    </div>
  );
}
