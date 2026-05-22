"use client";

import { useGetVibeTagStatsQuery } from "@/app/provider/api/admin";
import type { IAdminVibeTag } from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/chart-container";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Tag, Heart, FileImage } from "lucide-react";

const COLORS = [
  "hsl(316, 62%, 20%)",
  "hsl(195, 100%, 42%)",
  "hsl(330, 70%, 55%)",
  "hsl(280, 60%, 50%)",
  "hsl(316, 50%, 35%)",
];

function truncate(str: string, max = 14) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function ColoredBar(props: any) {
  const { x, y, width, height, index } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={COLORS[index % COLORS.length]}
      rx={4}
      ry={4}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground whitespace-nowrap">{label}</p>
          <p className="text-xl font-bold tabular-nums leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center py-3 border-b last:border-0">
          <Skeleton className="h-4 w-5 shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16 shrink-0" />
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// Responsive YAxis width hook
function useYAxisWidth() {
  if (typeof window === "undefined") return 110;
  return window.innerWidth < 640 ? 90 : 130;
}

export default function VibeTagsPage() {
  const { data, isLoading, isError } = useGetVibeTagStatsQuery();
  const yAxisWidth = useYAxisWidth();

  const vibeTags: IAdminVibeTag[] = data?.vibeTags ?? [];
  const total = data?.total ?? 0;

  const sorted = [...vibeTags].sort(
    (a, b) => (b.postcardCount ?? 0) - (a.postcardCount ?? 0)
  );

  // Only top 5
  const top5 = sorted.slice(0, 5);

  const chartData = top5.map((t) => ({
    name: truncate(t.name ?? "—"),
    fullName: t.name ?? "—",
    postcards: t.postcardCount ?? 0,
  }));

  const totalPostcards = sorted.reduce((s, t) => s + (t.postcardCount ?? 0), 0);
  const totalLikes = sorted.reduce((s, t) => s + (t.totalLikesOnPostcards ?? 0), 0);

  // Fixed, predictable chart height for 5 bars
  const CHART_HEIGHT = 300;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vibe Tags</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-wide vibe tag usage statistics.
        </p>
      </div>

      {/* Summary stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={Tag}
            label="Total Tags"
            value={total}
            iconBg="hsl(316 62% 20% / 0.1)"
            iconColor="hsl(316, 62%, 20%)"
          />
          <StatCard
            icon={FileImage}
            label="Postcards"
            value={totalPostcards.toLocaleString()}
            iconBg="hsl(330 70% 55% / 0.12)"
            iconColor="hsl(330, 70%, 50%)"
          />
          <StatCard
            icon={Heart}
            label="Likes"
            value={totalLikes.toLocaleString()}
            iconBg="hsl(280 60% 50% / 0.12)"
            iconColor="hsl(280, 60%, 45%)"
          />
        </div>
      )}

      {/* Chart — key fixes:
          1. Outer div has a known height so ResponsiveContainer can resolve it
          2. overflow-hidden prevents any bar from escaping the card
          3. yAxisWidth is responsive (smaller on mobile)
          4. barSize is fixed so bars don't grow absurdly tall with only 5 items
      */}
      <ChartContainer title="Top 5 Vibe Tags by Postcard Count" loading={isLoading}>
        {chartData.length > 0 ? (
          <div style={{ width: "100%", height: CHART_HEIGHT }} className="overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
                barSize={28}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={undefined}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={yAxisWidth}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.625rem",
                    border: "1px solid hsl(var(--border))",
                    fontSize: 12,
                  }}
                  formatter={(value: any) => [Number(value).toLocaleString(), "Postcards"]}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === label);
                    return item?.fullName ?? label;
                  }}
                />
                <Bar dataKey="postcards" shape={<ColoredBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No vibe tag data" />
        )}
      </ChartContainer>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vibe Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <p className="text-center text-muted-foreground py-8">
              Failed to load vibe tags.
            </p>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No vibe tags yet"
              description="Vibe tag usage will appear here."
              icon={<Tag className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              {/* Mobile card list */}
              <div className="sm:hidden space-y-3">
                {sorted.map((tag, index) => {
                  const pct =
                    totalPostcards > 0
                      ? ((tag.postcardCount / totalPostcards) * 100).toFixed(1)
                      : "0";
                  return (
                    <div
                      key={tag.id ?? index}
                      className="flex items-start gap-3 rounded-xl border border-border p-3"
                    >
                      <span
                        className="w-3 h-3 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate">{tag.name ?? "—"}</p>
                          <Badge
                            variant={tag.isPlatformDefault ? "secondary" : "outline"}
                            className="text-xs shrink-0"
                          >
                            {tag.isPlatformDefault ? "Platform" : "Custom"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tag.activityTiming ?? "—"}
                        </p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileImage className="w-3 h-3" />
                            {(tag.postcardCount ?? 0).toLocaleString()} postcards
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {(tag.totalLikesOnPostcards ?? 0).toLocaleString()} likes
                          </span>
                          <span>{pct}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">#{index + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-3 font-medium w-8">#</th>
                      <th className="text-left py-3 pr-4 font-medium">Tag</th>
                      <th className="text-left py-3 pr-4 font-medium">Timing</th>
                      <th className="text-left py-3 pr-4 font-medium">Type</th>
                      <th className="text-right py-3 pr-4 font-medium">Postcards</th>
                      <th className="text-right py-3 pr-4 font-medium">Likes</th>
                      <th className="text-right py-3 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((tag, index) => {
                      const pct =
                        totalPostcards > 0
                          ? ((tag.postcardCount / totalPostcards) * 100).toFixed(1)
                          : "0";
                      return (
                        <tr
                          key={tag.id ?? index}
                          className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 pr-3 text-muted-foreground text-xs">
                            #{index + 1}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{tag.name ?? "—"}</span>
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs whitespace-nowrap">
                            {tag.activityTiming ?? "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={tag.isPlatformDefault ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {tag.isPlatformDefault ? "Platform" : "Custom"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-right font-medium tabular-nums">
                            {(tag.postcardCount ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground tabular-nums">
                            {(tag.totalLikesOnPostcards ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-muted-foreground tabular-nums">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}