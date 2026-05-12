"use client";

import { useGetStatsQuery } from "@/app/provider/api/admin";
import { StatsCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  ImageIcon,
  Gamepad2,
  DollarSign,
  Tag,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

function StatsSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((g) => (
        <div key={g}>
          <Skeleton className="h-3 w-28 mb-4 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-7 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const { data: stats, isLoading, isError } = useGetStatsQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Stats</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          A snapshot of all key platform metrics.
        </p>
      </div>

      {isLoading ? (
        <StatsSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load stats. Please try again.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Users & Events */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Users &amp; Events
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Users"
                value={(stats?.totalUsers ?? stats?.total_users ?? 0).toLocaleString()}
                icon={Users}
                accent="plum"
              />
              <StatsCard
                title="Total Events"
                value={(stats?.totalEvents ?? stats?.total_events ?? 0).toLocaleString()}
                icon={Calendar}
                accent="cyan"
              />
              <StatsCard
                title="Active Events"
                value={(stats?.activeEvents ?? stats?.active_events ?? 0).toLocaleString()}
                icon={Activity}
                accent="cyan"
              />
              <StatsCard
                title="Total Postcards"
                value={(stats?.totalPostcards ?? stats?.total_postcards ?? 0).toLocaleString()}
                icon={ImageIcon}
                accent="pink"
              />
            </div>
          </div>

          {/* Engagement & Revenue */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Engagement &amp; Revenue
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Active Sessions"
                value={(stats?.activeSessions ?? stats?.active_sessions ?? 0).toLocaleString()}
                icon={Gamepad2}
                accent="purple"
              />
              <StatsCard
                title="Total Revenue"
                value={
                  (stats?.totalRevenue ?? stats?.total_revenue)
                    ? `$${Number(stats?.totalRevenue ?? stats?.total_revenue).toLocaleString()}`
                    : "$0"
                }
                icon={DollarSign}
                accent="plum"
              />
              <StatsCard
                title="Total Coupons"
                value={(stats?.totalCoupons ?? stats?.total_coupons ?? 0).toLocaleString()}
                icon={Tag}
                accent="pink"
              />
              <StatsCard
                title="Total Vibe Tags"
                value={(stats?.totalVibetags ?? stats?.total_vibetags ?? 0).toLocaleString()}
                icon={TrendingUp}
                accent="purple"
              />
            </div>
          </div>

          {/* User Status */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              User Status
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Verified Users"
                value={(stats?.verifiedUsers ?? stats?.verified_users ?? 0).toLocaleString()}
                icon={CheckCircle}
                accent="cyan"
              />
              <StatsCard
                title="Banned Users"
                value={(stats?.bannedUsers ?? stats?.banned_users ?? 0).toLocaleString()}
                icon={XCircle}
              />
              <StatsCard
                title="Total Game Sessions"
                value={(stats?.totalGameSessions ?? stats?.total_game_sessions ?? 0).toLocaleString()}
                icon={Gamepad2}
                accent="purple"
              />
              <StatsCard
                title="Total Payments"
                value={(stats?.totalPayments ?? stats?.total_payments ?? 0).toLocaleString()}
                icon={DollarSign}
                accent="plum"
              />
            </div>
          </div>

          {/* Raw data fallback */}
          {stats && Object.keys(stats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  All Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {typeof value === "number"
                          ? value.toLocaleString()
                          : String(value ?? "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
