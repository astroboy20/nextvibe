"use client";

import { useGetAnalyticsQuery } from "@/app/provider/api/admin";
import { ChartContainer } from "@/components/chart-container";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError } = useGetAnalyticsQuery();

  const data = analytics?.slice(-30) || [];

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform time-series analytics for the last 30 days.
          </p>
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
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform time-series analytics for the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Events Created" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="events_created" stroke="#3b82f6" strokeWidth={2} dot={false} name="Events" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>

        <ChartContainer title="New Users" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="users_joined" fill="#10b981" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>

        <ChartContainer title="Game Sessions" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="game_sessions" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>

        <ChartContainer title="Postcards Uploaded" loading={isLoading}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="postcards_uploaded" fill="#ec4899" radius={[4, 4, 0, 0]} name="Postcards" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" />
          )}
        </ChartContainer>
      </div>

      {/* Combined overview */}
      <ChartContainer title="Platform Overview (Combined)" loading={isLoading}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="events_created" stroke="#3b82f6" strokeWidth={2} dot={false} name="Events" />
              <Line type="monotone" dataKey="users_joined" stroke="#10b981" strokeWidth={2} dot={false} name="Users" />
              <Line type="monotone" dataKey="game_sessions" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sessions" />
              <Line type="monotone" dataKey="postcards_uploaded" stroke="#ec4899" strokeWidth={2} dot={false} name="Postcards" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title="No data available" />
        )}
      </ChartContainer>
    </div>
  );
}
