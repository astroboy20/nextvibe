"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/shared/components/stat-card";
import { ChartContainer } from "@/shared/components/chart-container";
import { RefreshCw, Users, Gamepad2, Image as ImageIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface RepeatEngagementModuleProps {
  data: {
    repeatAttendees: number;
    repeatAttendeesPercentage: number;
    multiRoundPlayers: number;
    repeatCreators: number;
  };
  newVsReturning?: {
    new: number;
    returning: number;
  };
  engagementDepth?: Array<{
    touchpoints: string;
    count: number;
  }>;
}

export function RepeatEngagementModule({
  data,
  newVsReturning,
  engagementDepth = [],
}: RepeatEngagementModuleProps) {
  const repeatPercentageFormatted = data.repeatAttendeesPercentage.toFixed(1);

  const pieData = newVsReturning
    ? [
        { name: "New Attendees", value: newVsReturning.new, color: "#60a5fa" },
        {
          name: "Returning Attendees",
          value: newVsReturning.returning,
          color: "#a78bfa",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Repeat Attendees"
          value={`${data.repeatAttendees} (${repeatPercentageFormatted}%)`}
          icon={RefreshCw}
          accent="plum"
        />
        <StatsCard
          title="Multi-Round Players"
          value={data.multiRoundPlayers}
          icon={Gamepad2}
          accent="cyan"
        />
        <StatsCard
          title="Repeat Creators"
          value={data.repeatCreators}
          icon={ImageIcon}
          accent="pink"
        />
        <StatsCard
          title="Total Engaged"
          value={data.repeatAttendees + data.multiRoundPlayers}
          icon={Users}
          accent="purple"
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New vs Returning Donut Chart */}
        {pieData.length > 0 && (
          <ChartContainer
            title="New vs Returning Attendees"
            description="First-time vs repeat event attendees"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Engagement Depth Distribution */}
        {engagementDepth.length > 0 && (
          <ChartContainer
            title="Engagement Depth Distribution"
            description="Number of touchpoints per attendee"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementDepth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="touchpoints" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>

      {/* Engagement Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Repeat Attendees</span>
              </div>
              <p className="text-2xl font-bold">{data.repeatAttendees}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Attended previous events by this organizer
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Multi-Round Players</span>
              </div>
              <p className="text-2xl font-bold">{data.multiRoundPlayers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Played 2+ rounds or multiple game sessions
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Repeat Creators</span>
              </div>
              <p className="text-2xl font-bold">{data.repeatCreators}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Posted multiple postcards or active across both phases
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
