"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/shared/components/stat-card";
import { ChartContainer } from "@/shared/components/chart-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Users,
  Trophy,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
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

interface GameSession {
  id: string;
  title: string;
  phase: "PRE_EVENT" | "DURING_EVENT";
  roundCount: number;
  uniquePlayers: number;
  avgScore: number;
  completionRate: number;
  status: "ACTIVE" | "COMPLETED";
}

interface RewardStatus {
  status: "WON" | "CLAIMED" | "APPROVED" | "FULFILLED";
  count: number;
}

interface GamificationModuleProps {
  data: {
    activeSessions: number;
    completedSessions: number;
    uniquePlayers: number;
    gameParticipationRate: number;
    totalSubmissions: number;
  };
  sessions?: GameSession[];
  rewardStatuses?: RewardStatus[];
  onViewActionQueue?: () => void;
}

export function GamificationModule({
  data,
  sessions = [],
  rewardStatuses = [],
  onViewActionQueue,
}: GamificationModuleProps) {
  const participationRateFormatted = data.gameParticipationRate.toFixed(1);

  const rewardColors = {
    WON: "#fbbf24",
    CLAIMED: "#60a5fa",
    APPROVED: "#a78bfa",
    FULFILLED: "#34d399",
  };

  const pendingRewards = rewardStatuses.find((r) => r.status === "CLAIMED")?.count || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active/Completed Sessions"
          value={`${data.activeSessions}/${data.completedSessions}`}
          icon={Gamepad2}
          accent="plum"
        />
        <StatsCard
          title="Unique Players"
          value={data.uniquePlayers}
          icon={Users}
          accent="cyan"
        />
        <StatsCard
          title="Participation Rate"
          value={`${participationRateFormatted}%`}
          icon={Trophy}
          accent="pink"
        />
        <StatsCard
          title="Total Submissions"
          value={data.totalSubmissions}
          icon={CheckCircle}
          accent="purple"
        />
      </div>

      {/* Per-Session Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No game sessions created yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Title
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Phase
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-3">
                      Rounds
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-3">
                      Players
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-3">
                      Avg Score
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-3">
                      Completion
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">
                        {session.title}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            session.phase === "PRE_EVENT"
                              ? "text-blue-600 bg-blue-50 border-blue-200"
                              : "text-purple-600 bg-purple-50 border-purple-200"
                          }
                        >
                          {session.phase === "PRE_EVENT"
                            ? "Pre-Event"
                            : "Main Event"}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-center">
                        {session.roundCount}
                      </td>
                      <td className="py-3 text-sm text-center">
                        {session.uniquePlayers}
                      </td>
                      <td className="py-3 text-sm text-center">
                        {session.avgScore.toFixed(1)}
                      </td>
                      <td className="py-3 text-sm text-center">
                        {session.completionRate.toFixed(1)}%
                      </td>
                      <td className="py-3 text-center">
                        <Badge
                          variant={
                            session.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {session.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward Fulfillment Pipeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reward Fulfillment Pipeline</CardTitle>
          {pendingRewards > 0 && onViewActionQueue && (
            <Button size="sm" variant="outline" onClick={onViewActionQueue}>
              Action Queue
              <Badge variant="destructive" className="ml-2">
                {pendingRewards}
              </Badge>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {rewardStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No rewards awarded yet
            </p>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={rewardStatuses}
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {rewardStatuses.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={rewardColors[entry.status]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Status Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {rewardStatuses.map((status) => (
                  <div
                    key={status.status}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: rewardColors[status.status] }}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {status.status}
                      </p>
                      <p className="text-sm font-semibold">{status.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
