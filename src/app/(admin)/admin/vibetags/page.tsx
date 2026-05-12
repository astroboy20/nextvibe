"use client";

import { useGetVibeTagStatsQuery } from "@/app/provider/api/admin";
import type { IAdminVibeTag } from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/chart-container";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Tag, Heart, FileImage } from "lucide-react";

const COLORS = [
  "hsl(316 62% 20%)",   // plum
  "hsl(195 100% 42%)",  // cyan
  "hsl(330 70% 55%)",   // pink
  "hsl(280 60% 50%)",   // purple
  "hsl(316 50% 35%)",
  "hsl(195 80% 38%)",
  "hsl(330 55% 48%)",
  "hsl(280 45% 42%)",
  "hsl(316 40% 28%)",
  "hsl(195 60% 35%)",
];

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b last:border-0">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function VibeTagsPage() {
  const { data, isLoading, isError } = useGetVibeTagStatsQuery();

  const vibeTags: IAdminVibeTag[] = data?.vibeTags ?? [];
  const total = data?.total ?? 0;

  // sort by postcard count desc
  const sorted = [...vibeTags].sort(
    (a, b) => (b.postcardCount ?? 0) - (a.postcardCount ?? 0)
  );
  const top10 = sorted.slice(0, 10);

  const chartData = top10.map((t) => ({
    name: t.name,
    postcards: t.postcardCount ?? 0,
    likes: t.totalLikesOnPostcards ?? 0,
  }));

  const totalPostcards = sorted.reduce((s, t) => s + (t.postcardCount ?? 0), 0);
  const totalLikes = sorted.reduce((s, t) => s + (t.totalLikesOnPostcards ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vibe Tags</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-wide vibe tag usage statistics.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Tags</p>
                <p className="text-2xl font-bold tabular-nums">{total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(330_70%_55%/0.12)] flex items-center justify-center shrink-0">
                <FileImage className="w-5 h-5 text-[hsl(330,70%,50%)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Postcards</p>
                <p className="text-2xl font-bold tabular-nums">{totalPostcards.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(280_60%_50%/0.12)] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-[hsl(280,60%,45%)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold tabular-nums">{totalLikes.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <ChartContainer title="Top 10 Vibe Tags by Postcard Count" loading={isLoading}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.625rem",
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
                formatter={(value: any, name: any) => [
                  Number(value).toLocaleString(),
                  name === "postcards" ? "Postcards" : "Likes",
                ]}
              />
              <Bar dataKey="postcards" radius={[0, 4, 4, 0]}>
                {chartData.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="text-left py-3 pr-4 font-medium w-10">#</th>
                    <th className="text-left py-3 pr-4 font-medium">Tag</th>
                    <th className="text-left py-3 pr-4 font-medium">Timing</th>
                    <th className="text-left py-3 pr-4 font-medium">Type</th>
                    <th className="text-right py-3 pr-4 font-medium">Postcards</th>
                    <th className="text-right py-3 pr-4 font-medium">Likes</th>
                    <th className="text-right py-3 font-medium">% of Total</th>
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
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          #{index + 1}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span className="font-medium">{tag.name ?? "—"}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {tag.activityTiming ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {tag.isPlatformDefault ? (
                            <Badge variant="secondary" className="text-xs">
                              Platform
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium">
                          {(tag.postcardCount ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {(tag.totalLikesOnPostcards ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
