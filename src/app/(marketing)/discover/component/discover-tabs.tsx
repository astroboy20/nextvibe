"use client";
import { Sparkles, TrendingUp, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabValue = "foryou" | "trending" | "nearby";

interface DiscoverTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export default function DiscoverTabs({ activeTab, onTabChange }: DiscoverTabsProps) {
  return (
    <div className="mb-5">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as TabValue)}
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
    </div>
  );
}
