"use client";
import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const INTEREST_OPTIONS = [
  "music", "tech", "party", "art", "food",
  "fitness", "travel", "nightlife", "festival", "wedding",
];

interface DiscoverFilterBarProps {
  searchQuery: string;
  locationFilter: string;
  interestFilter: string;
  autoLocating: boolean;
  hasFilters: boolean;
  placeholder?: string;
  onSearchChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onInterestChange: (v: string) => void;
  onDetectLocation: () => void;
  onClearFilters: () => void;
}

export default function DiscoverFilterBar({
  searchQuery,
  locationFilter,
  interestFilter,
  autoLocating,
  hasFilters,
  placeholder = "Search events by name…",
  onSearchChange,
  onLocationChange,
  onInterestChange,
  onDetectLocation,
  onClearFilters,
}: DiscoverFilterBarProps) {
  return (
    <div className="mb-5 rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 pl-9 rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Location + Vibe + clear */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[140px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Location"
            className="h-9 pl-9 pr-9"
          />
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={autoLocating}
            title="Use my location"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <MapPin
              className={cn("h-3.5 w-3.5", autoLocating && "animate-pulse text-primary")}
            />
          </button>
        </div>

        <Select
          value={interestFilter || "__all__"}
          onValueChange={(v) => onInterestChange(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-9 flex-1 min-w-[120px]">
            <SelectValue placeholder="Vibe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All vibes</SelectItem>
            {INTEREST_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 shrink-0 text-xs text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
