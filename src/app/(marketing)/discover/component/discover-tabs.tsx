"use client";
import { Sparkles, TrendingUp, MapPin, Gamepad2, Tag, Ticket, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const CHIP_FILTERS = [
  { id: "games", label: "Has Games", icon: Gamepad2 },
  { id: "vibetag", label: "Has VibeTag", icon: Tag },
  { id: "free", label: "Free", icon: Ticket },
  { id: "soon", label: "Starting Soon", icon: Clock },
] as const;

export type ChipId = (typeof CHIP_FILTERS)[number]["id"];
export type TabValue = "foryou" | "trending" | "nearby";

interface DiscoverTabsProps {
  activeTab: TabValue;
  activeFilters: ChipId[];
  onTabChange: (tab: TabValue) => void;
  onChipToggle: (id: ChipId) => void;
}

export default function DiscoverTabs({
  activeTab,
  activeFilters,
  onTabChange,
  onChipToggle,
}: DiscoverTabsProps) {
  return (
    <div className="mb-5">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as TabValue)}
        className="mb-3"
      >
        <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
          <TabsTrigger
            value="foryou"
            className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" /> For You
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <TrendingUp className="h-3.5 w-3.5" /> Trending
          </TabsTrigger>
          <TabsTrigger
            value="nearby"
            className="gap-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MapPin className="h-3.5 w-3.5" /> Near You
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CHIP_FILTERS.map(({ id, label, icon: Icon }) => {
          const isActive = activeFilters.includes(id);
          return (
            <button
              key={id}
              onClick={() => onChipToggle(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
