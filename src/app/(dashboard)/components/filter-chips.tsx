"use client"
import { Gamepad2, Tag, Ticket, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const filters = [
  { id: "games", label: "Has Games", icon: Gamepad2 },
  { id: "vibetag", label: "Has VibeTag", icon: Tag },
  { id: "free", label: "Free", icon: Ticket },
  { id: "soon", label: "Starting Soon", icon: Clock },
];

const FilterChips =() =>{
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilters.includes(filter.id);

        return (
          <button
            key={filter.id}
            onClick={() => toggleFilter(filter.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[#34132E] text-primary-foreground shadow-card"
                : "bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips