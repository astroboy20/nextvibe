"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/shared/components/stat-card";
import { ChartContainer } from "@/shared/components/chart-container";
import { Users, UserCheck, TrendingUp, Eye } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface ParticipationModuleProps {
  data: {
    totalRsvps: number;
    confirmedRsvps: number;
    waitlistedRsvps: number;
    totalCheckIns: number;
    checkInRate: number;
    spectatorJoins: number;
  };
  funnelData?: Array<{
    stage: string;
    count: number;
  }>;
  timelineData?: Array<{
    date: string;
    rsvps: number;
    checkIns: number;
  }>;
}

export function ParticipationModule({
  data,
  funnelData,
  timelineData,
}: ParticipationModuleProps) {
  const checkInRateFormatted =
    data.confirmedRsvps > 0
      ? ((data.totalCheckIns / data.confirmedRsvps) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total RSVPs"
          value={data.totalRsvps}
          icon={Users}
          accent="plum"
        />
        <StatsCard
          title="Total Check-Ins"
          value={data.totalCheckIns}
          icon={UserCheck}
          accent="cyan"
        />
        <StatsCard
          title="Check-In Rate"
          value={`${checkInRateFormatted}%`}
          icon={TrendingUp}
          accent="pink"
        />
        <StatsCard
          title="Spectator Joins"
          value={data.spectatorJoins}
          icon={Eye}
          accent="purple"
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Funnel */}
        <ChartContainer
          title="Attendance Funnel"
          description="Conversion from RSVP to attendance"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                funnelData || [
                  { stage: "RSVPs", count: data.totalRsvps },
                  { stage: "Confirmed", count: data.confirmedRsvps },
                  { stage: "Checked In", count: data.totalCheckIns },
                ]
              }
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="stage" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Participation Timeline */}
        <ChartContainer
          title="Participation Timeline"
          description="Cumulative RSVPs vs arrivals over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timelineData || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rsvps"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="RSVPs"
              />
              <Line
                type="monotone"
                dataKey="checkIns"
                stroke="hsl(195, 100%, 38%)"
                strokeWidth={2}
                name="Check-Ins"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* RSVP Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">RSVP Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confirmed</span>
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${data.totalRsvps > 0 ? (data.confirmedRsvps / data.totalRsvps) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {data.confirmedRsvps}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Waitlisted</span>
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${data.totalRsvps > 0 ? (data.waitlistedRsvps / data.totalRsvps) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {data.waitlistedRsvps}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
