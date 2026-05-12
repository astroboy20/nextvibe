"use client";

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
} from "recharts";
import { Users, Calendar, ImageIcon, Gamepad2 } from "lucide-react";
import { StatsCard } from "@/components/stat-card";
import { ChartContainer } from "@/components/chart-container";
import { EmptyState } from "@/components/empty-state";
import { useGetAnalyticsQuery, useGetStatsQuery } from "@/app/provider/api/admin";

// brand palette tokens
const PLUM = "hsl(316 62% 20%)";
const CYAN = "hsl(195 100% 42%)";
const PINK = "hsl(330 70% 55%)";
const PURPLE = "hsl(280 60% 50%)";

function normaliseAnalytics(item: any) {
  return {
    date: item.date ?? item.day ?? item._id ?? "—",
    events_created: item.eventsCreated ?? item.events_created ?? 0,
    users_joined: item.usersJoined ?? item.users_joined ?? item.newUsers ?? 0,
    game_sessions: item.gameSessions ?? item.game_sessions ?? 0,
    postcards_uploaded: item.postcardsUploaded ?? item.postcards_uploaded ?? 0,
  };
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: "0.625rem",
    border: "1px solid hsl(var(--border))",
    fontSize: 12,
    boxShadow: "0 4px 20px -4px hsl(280 30% 20% / 0.12)",
  },
};

export default function DashboardHome() {
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsQuery();

  const analyticsData = (analytics ?? []).slice(-30).map(normaliseAnalytics);

  const totalUsers = stats?.totalUsers ?? stats?.total_users ?? 0;
  const totalEvents = stats?.totalEvents ?? stats?.total_events ?? 0;
  const totalPostcards = stats?.totalPostcards ?? stats?.total_postcards ?? 0;
  const activeSessions = stats?.activeSessions ?? stats?.active_sessions ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back — here&apos;s what&apos;s happening on the platform.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          loading={statsLoading}
          accent="plum"
        />
        <StatsCard
          title="Total Events"
          value={totalEvents.toLocaleString()}
          icon={Calendar}
          loading={statsLoading}
          accent="cyan"
        />
        <StatsCard
          title="Total Postcards"
          value={totalPostcards.toLocaleString()}
          icon={ImageIcon}
          loading={statsLoading}
          accent="pink"
        />
        <StatsCard
          title="Active Sessions"
          value={activeSessions.toLocaleString()}
          icon={Gamepad2}
          loading={statsLoading}
          accent="purple"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartContainer
          title="Events Created"
          description="Last 30 days"
          loading={analyticsLoading}
        >
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="events_created"
                  stroke={CYAN}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: CYAN }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No analytics data yet" />
          )}
        </ChartContainer>

        <ChartContainer
          title="User Growth"
          description="Last 30 days"
          loading={analyticsLoading}
        >
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="users_joined" fill={PLUM} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No analytics data yet" />
          )}
        </ChartContainer>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartContainer
          title="Game Sessions"
          description="Last 30 days"
          loading={analyticsLoading}
        >
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="game_sessions"
                  stroke={PURPLE}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: PURPLE }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No analytics data yet" />
          )}
        </ChartContainer>

        <ChartContainer
          title="Postcards Uploaded"
          description="Last 30 days"
          loading={analyticsLoading}
        >
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="postcards_uploaded" fill={PINK} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No analytics data yet" />
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
