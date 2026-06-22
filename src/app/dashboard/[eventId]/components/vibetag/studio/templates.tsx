/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTemplate, setView } from "@/app/provider/slices/canvas-slice";
import { RootState } from "@/app/provider/store";
import { VibeTags } from "@/data/templates";
import { Template } from "@/types/canvas";
import { PRIMARY_COLOR } from "@/utils/constants";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  all:         { label: "All",        emoji: "✨" },
  birthday:    { label: "Birthday",   emoji: "🎂" },
  wedding:     { label: "Wedding",    emoji: "💍" },
  convocation: { label: "Graduation", emoji: "🎓" },
  nysc:        { label: "NYSC",       emoji: "🪖" },
  prom:        { label: "Prom",       emoji: "👗" },
  travel:      { label: "Travel",     emoji: "✈️" },
};

function getCategories(templates: Template[]): string[] {
  const seen = new Set<string>();
  templates.forEach((t) => seen.add(t.category));
  return ["all", ...Array.from(seen)];
}

export default function Templates() {
  const dispatch = useDispatch();
  const selectedTemplate = useSelector((state: RootState) => state.canvas.template);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => getCategories(VibeTags), []);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? VibeTags
        : VibeTags.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  const handleTemplate = (template: Template) => {
    dispatch(setTemplate(template));
    dispatch(setView("editor"));
  };

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Header */}
      <div className="space-y-0.5 text-center">
        <h2 className="text-base font-semibold">Choose a Template</h2>
        <p className="text-xs text-muted-foreground">
          Filter by category, then tap to use
        </p>
      </div>

      {/* Category pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat] ?? { label: cat, emoji: "🏷️" };
          const count = cat === "all"
            ? VibeTags.length
            : VibeTags.filter((t) => t.category === cat).length;
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition-all shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border"
              )}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid — 2 equal columns, images shown via <img> so no Next.js fill quirks */}
      <div className="grid grid-cols-2 gap-3">

        {/* Scratch card */}
        <button
          onClick={() => dispatch(setView("editor"))}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/60 active:scale-95 transition-all"
          style={{ aspectRatio: "3/4" }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full border-2"
            style={{ borderColor: PRIMARY_COLOR }}
          >
            <Pencil size={16} color={PRIMARY_COLOR} />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-center leading-tight px-2">
            Start from scratch
          </span>
        </button>

        {/* Template cards */}
        {filtered.map((temp) => {
          const isSelected = temp.id === selectedTemplate?.id;
          return (
            <button
              key={temp.id}
              onClick={() => handleTemplate(temp)}
              className={cn(
                "relative overflow-hidden rounded-xl active:scale-95 transition-all duration-150",
                isSelected ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-border"
              )}
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={temp.mock}
                alt={temp.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* bottom label */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                <p className="text-[10px] font-semibold text-white capitalize truncate">
                  {CATEGORY_META[temp.category]?.label ?? temp.category}
                </p>
              </div>

              {/* selected tick */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <Check size={12} color="white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center space-y-1">
          <p className="text-2xl">🔍</p>
          <p className="text-sm text-muted-foreground">No templates in this category yet</p>
        </div>
      )}
    </div>
  );
}
