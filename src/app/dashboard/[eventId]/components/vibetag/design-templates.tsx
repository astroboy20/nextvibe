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
}

export default function DesignTemplate({ onSaveVibeTag }: DesignTemplateProps) {
  const dispatch = useDispatch();
  const view = useSelector((state: RootState) => state.canvas.view);

  useEffect(() => {
    dispatch(setView("start"));
  }, [dispatch]);

  return (
    <div>
      {view === "start" && <Start />}
      {view === "template" && <Templates />}
      {view === "editor" && <Editor onSaveVibeTag={onSaveVibeTag} />}
    </div>
  );
}
