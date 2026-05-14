"use client";

import { useGetStatsQuery } from "@/app/provider/api/admin";
import { StatsCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Calendar, ImageIcon, Gamepad2, DollarSign,
  Tag, TrendingUp, Activity, Heart, MessageCircle, Share2,
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
                value={(stats?.totalUsers ?? 0).toLocaleString()}
                icon={Users}
                accent="plum"
              />
              <StatsCard
                title="Total Events"
                value={(stats?.totalEvents ?? 0).toLocaleString()}
                icon={Calendar}
                accent="cyan"
              />
              <StatsCard
                title="Published Events"
                value={(stats?.eventsByStatus?.PUBLISHED ?? 0).toLocaleString()}
                icon={Activity}
                accent="cyan"
              />
              <StatsCard
                title="Draft Events"
                value={(stats?.eventsByStatus?.DRAFT ?? 0).toLocaleString()}
                icon={Calendar}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Content
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Postcards"
                value={(stats?.totalPostcards ?? 0).toLocaleString()}
                icon={ImageIcon}
                accent="pink"
              />
              <StatsCard
                title="Game Sessions"
                value={(stats?.totalGameSessions ?? 0).toLocaleString()}
                icon={Gamepad2}
                accent="purple"
              />
              <StatsCard
                title="Total Vibe Tags"
                value={(stats?.totalVibeTags ?? 0).toLocaleString()}
                icon={Tag}
                accent="pink"
              />
              <StatsCard
                title="Tickets Sold"
                value={(stats?.totalTicketsSold ?? 0).toLocaleString()}
                icon={TrendingUp}
                accent="purple"
              />
            </div>
          </div>

          {/* Revenue & Social */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Revenue &amp; Social
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Revenue"
                value={`₦${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
                icon={DollarSign}
                accent="plum"
              />
              <StatsCard
                title="Total Likes"
                value={(stats?.totalLikes ?? 0).toLocaleString()}
                icon={Heart}
                accent="pink"
              />
              <StatsCard
                title="Total Comments"
                value={(stats?.totalComments ?? 0).toLocaleString()}
                icon={MessageCircle}
                accent="cyan"
              />
              <StatsCard
                title="Total Shares"
                value={(stats?.totalShares ?? 0).toLocaleString()}
                icon={Share2}
                accent="purple"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
