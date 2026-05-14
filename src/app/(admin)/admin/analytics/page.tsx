"use client";

import { useGetAnalyticsQuery } from "@/app/provider/api/admin";
import { ChartContainer } from "@/components/chart-container";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

// Same normaliser used in the overview dashboard
function normaliseAnalytics(raw: any) {
  if (!raw) return [];
  if (raw.usersByDay || raw.eventsByDay || raw.revenueByDay) {
    const usersByDay: Record<string, number> = raw.usersByDay ?? {};
    const eventsByDay: Record<string, number> = raw.eventsByDay ?? {};
    const revenueByDay: Record<string, number> = raw.revenueByDay ?? {};
    const allDates = Array.from(
      new Set([...Object.keys(usersByDay), ...Object.keys(eventsByDay), ...Object.keys(revenueByDay)])
    ).sort();
    return allDates.map((date) => ({
      date: date.slice(5), // MM-DD
      events_created: eventsByDay[date] ?? 0,
      users_joined: usersByDay[date] ?? 0,
      revenue: revenueByDay[date] ?? 0,
    }));
  }
  if (Array.isArray(raw)) return raw.slice(-30);
  return [];
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: "0.625rem",
    border: "1px solid hsl(var(--border))",
    fontSize: 12,
  },
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError } = useGetAnalyticsQuery();
  const data = normaliseAnalytics(analytics);

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform time-series analytics for the last 30 days.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load analytics. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform time-series analytics for the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Events Created" description="Daily" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="events_created" stroke="hsl(195 100% 42%)" strokeWidth={2.5} dot={false} name="Events" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>

        <ChartContainer title="New Users" description="Daily" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="users_joined" fill="hsl(316 62% 20%)" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>

        <ChartContainer title="Revenue" description="Daily (₦)" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="revenue" fill="hsl(280 60% 50%)" radius={[4, 4, 0, 0]} name="Revenue (₦)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>

        {/* Combined overview */}
        <ChartContainer title="Platform Overview" description="Events + Users combined" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="events_created" stroke="hsl(195 100% 42%)" strokeWidth={2} dot={false} name="Events" />
                <Line type="monotone" dataKey="users_joined" stroke="hsl(316 62% 20%)" strokeWidth={2} dot={false} name="Users" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
