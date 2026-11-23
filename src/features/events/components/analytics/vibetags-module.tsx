"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/shared/components/stat-card";
import { ChartContainer } from "@/shared/components/chart-container";
import { Badge } from "@/components/ui/badge";
import { Tag, Image as ImageIcon, TrendingUp, Percent } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";

interface VibeTag {
  id: string;
  name: string;
  imageUrl: string;
  usageCount: number;
  phase: "PRE_EVENT" | "DURING_EVENT";
}

interface VibeTagsModuleProps {
  data: {
    activePreEventTags: number;
    activeDuringEventTags: number;
    brandedCreations: number;
    brandedAdoptionRate: number;
  };
  topTags?: VibeTag[];
  phaseComparison?: {
    preEvent: number;
    duringEvent: number;
  };
}

export function VibeTagsModule({
  data,
  topTags = [],
  phaseComparison,
}: VibeTagsModuleProps) {
  const adoptionRateFormatted = data.brandedAdoptionRate.toFixed(1);

  const phaseData = phaseComparison
    ? [
        { phase: "Pre-Event", usage: phaseComparison.preEvent },
        { phase: "During Event", usage: phaseComparison.duringEvent },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pre-Event Tags"
          value={data.activePreEventTags}
          icon={Tag}
          accent="plum"
        />
        <StatsCard
          title="During-Event Tags"
          value={data.activeDuringEventTags}
          icon={Tag}
          accent="cyan"
        />
        <StatsCard
          title="Branded Creations"
          value={data.brandedCreations}
          icon={ImageIcon}
          accent="pink"
        />
        <StatsCard
          title="Adoption Rate"
          value={`${adoptionRateFormatted}%`}
          icon={Percent}
          accent="purple"
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Comparison */}
        {phaseData.length > 0 && (
          <ChartContainer
            title="Phase Comparison"
            description="Pre-Event vs During-Event usage"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={phaseData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="usage"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Top VibeTags Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top VibeTags</CardTitle>
          </CardHeader>
          <CardContent>
            {topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No VibeTags created yet
              </p>
            ) : (
              <div className="space-y-3">
                {topTags.slice(0, 5).map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={tag.imageUrl}
                          alt={tag.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {tag.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tag.usageCount} uses
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        tag.phase === "PRE_EVENT"
                          ? "text-blue-600 bg-blue-50 border-blue-200"
                          : "text-purple-600 bg-purple-50 border-purple-200"
                      }
                    >
                      {tag.phase === "PRE_EVENT" ? "Pre" : "During"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adoption Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Branded (with VibeTags)
              </span>
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${data.brandedAdoptionRate}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-20 text-right">
                  {data.brandedCreations}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unbranded</span>
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-muted-foreground/50"
                    style={{
                      width: `${100 - data.brandedAdoptionRate}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-20 text-right">
                  {Math.max(
                    0,
                    Math.round(
                      data.brandedCreations /
                        (data.brandedAdoptionRate / 100) -
                        data.brandedCreations
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
