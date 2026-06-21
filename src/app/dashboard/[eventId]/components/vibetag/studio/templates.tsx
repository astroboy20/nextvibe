"use client";

import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTemplate, setView } from "@/app/provider/slices/canvas-slice";
import { RootState } from "@/app/provider/store";
import { VibeTags } from "@/data/templates";
import { Template } from "@/types/canvas";
import { PRIMARY_COLOR } from "@/utils/constants";
import Image from "next/image";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

// Category metadata — emoji + label for each category in the data
const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  all:          { label: "All",         emoji: "✨" },
  birthday:     { label: "Birthday",    emoji: "🎂" },
  wedding:      { label: "Wedding",     emoji: "💍" },
  convocation:  { label: "Graduation",  emoji: "🎓" },
  nysc:         { label: "NYSC",        emoji: "🪖" },
  prom:         { label: "Prom",        emoji: "👗" },
  travel:       { label: "Travel",      emoji: "✈️" },
};

// Derive ordered category list from the data (preserve insertion order, "all" first)
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
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Choose a Template</h2>
        <p className="text-sm text-muted-foreground">
          Pick a category then tap a template to start editing
        </p>
      </div>

      {/* Category filter — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat] ?? { label: cat, emoji: "🏷️" };
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-150 shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
              {/* Template count badge */}
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {cat === "all" ? VibeTags.length : VibeTags.filter((t) => t.category === cat).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Start from Scratch — always first */}
        <Card
          className="h-44 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 hover:shadow-md active:scale-95 transition-all duration-150 border-dashed"
          onClick={() => dispatch(setView("editor"))}
        >
          <CardContent className="flex flex-col items-center justify-center gap-2 p-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-full border-2"
              style={{ borderColor: PRIMARY_COLOR }}
            >
              <Pencil size={16} color={PRIMARY_COLOR} />
            </div>
            <CardTitle className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wide leading-tight">
              Start from scratch
            </CardTitle>
          </CardContent>
        </Card>

        {/* Filtered templates */}
        {filtered.map((temp) => {
          const isSelected = temp.id === selectedTemplate?.id;
          return (
            <Card
              key={temp.id}
              className={cn(
                "relative h-44 cursor-pointer overflow-hidden transition-all duration-200 active:scale-95",
                isSelected
                  ? "ring-2 ring-primary scale-[1.03] shadow-lg"
                  : "border border-border hover:border-primary/40 hover:shadow-md"
              )}
              onClick={() => handleTemplate(temp)}
            >
              <Image
                src={temp.mock}
                alt={temp.name}
                fill
                sizes="(max-width: 640px) 30vw, 200px"
                style={{ objectFit: "cover", objectPosition: "center" }}
                priority={false}
              />

              {/* Category label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                <p className="text-[10px] font-semibold text-white/90 capitalize truncate">
                  {CATEGORY_META[temp.category]?.label ?? temp.category}
                </p>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <Check size={14} color="white" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-3xl">🔍</p>
          <p className="text-sm font-medium text-foreground">No templates in this category yet</p>
          <p className="text-xs text-muted-foreground">Start from scratch or pick another category</p>
        </div>
      )}
    </div>
  );
}
