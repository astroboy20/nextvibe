
"use client";

/**
 * Event Analytics Page
 *
 * All field names are derived from LIVE API responses:
 *
 * GET /v1/analytics/overview
 *   data: { totalEvents, eventsByStatus{DRAFT,PUBLISHED,...}, totalRsvps,
 *           totalCheckIns, checkInRate, totalPostcards, totalGameSessions,
 *           totalRevenue, totalEventLikes }
 *
 * GET /v1/analytics/events/:id
 *   data: { event{id,name,startsAt,endsAt,capacity},
 *           rsvps{total, byTier[{tierId,tierName,count}]},
 *           checkIns{total,rate}, postcards{total},
 *           gameSessions[], revenue{total}, ticketsSold,
 *           social{likes,shares,comments} }
 *
 * GET /v1/analytics/events/:id/vibetags
 *   data: { eventId, vibeTags[] }
 *
 * GET /v1/analytics/events/:id/postcards
 *   data: { eventId, total, byVisibility{}, byVibeTag[], topPostcards[] }
 *
 * GET /v1/analytics/events/:id/revenue
 *   data: { eventId, totalRevenue, completedPurchases, refundCount,
 *           byStatus[], byTier[] }
 *
 * GET /v1/analytics/events/:id/social
 *   data: { eventId,
 *           event{likes,shares,comments},
 *           postcards{totalPostcards,totalLikes,totalShares,totalComments,avgLikesPerPostcard},
 *           combined{totalLikes,totalShares,totalComments} }
 *
 * GET /v1/analytics/events/:id/games
 *   data: { eventId, totalSessions, totalPlayers, totalWinners, engagementRate,
 *           sessions[{id,title,status,startsAt,playerCount}],
 *           winners[{rewardId, user{id,username,displayName,avatarUrl},
 *                    session{id,title}, reward{rank,type,title,value},
 *                    isClaimed, claimedAt, awardedAt}] }
 */

import { use, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, BarChart3, Users, DollarSign, Tag,
  Image as ImageIcon, Heart, Share2, MessageCircle,
  CheckCheck, Ticket, ChevronDown, MapPin, Gamepad2,
  RefreshCw, AlertCircle, TrendingUp, Info, Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  useGetEventAnalyticsQuery,
  useGetEventVibeTagAnalyticsQuery,
  useGetEventPostcardAnalyticsQuery,
  useGetEventRevenueAnalyticsQuery,
  useGetEventSocialAnalyticsQuery,
  useGetEventLocationAnalyticsQuery,
  useGetEventGameAnalyticsQuery,
} from "@/app/provider/api/analyticsApi";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND   = "#531342";
const PALETTE = ["#531342", "#8b1f5e", "#c4417a", "#e87aaa", "#f5c6dc"];

const TIP_STYLE = {
  contentStyle: {
    borderRadius: "0.75rem",
    border: "1px solid hsl(var(--border))",
    fontSize: 12,
    background: "hsl(var(--background))",
    boxShadow: "0 4px 16px -4px rgba(83,19,66,.14)",
  },
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt      = (n?: number | null) => (n == null ? "0" : n.toLocaleString());
const fmtMoney = (kobo?: number | null) => {
  if (!kobo) return "₦0";
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000)     return `₦${(naira / 1_000).toFixed(1)}K`;
  return `₦${naira.toLocaleString()}`;
};

// ─── Shared primitives ────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, icon: Icon, color = BRAND,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}1a` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground truncate">{label}</p>
        <p className="font-display text-xl font-bold leading-tight text-foreground">{value}</p>
        {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

function SectionError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
      </div>
      <p className="text-xs text-muted-foreground">Could not load data</p>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}

function Empty({ icon: Icon = ImageIcon, message }: { icon?: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground max-w-[220px]">{message}</p>
    </div>
  );
}

// Thin coloured bar for progress visuals
function ProgressBar({ value, max, color = BRAND }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full transition-all duration-500"
           style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Section 1: Event Summary (uses /analytics/events/:id) ───────────────────
// Verified real shape:
// data.event           → { id, name, startsAt, endsAt, capacity }
// data.rsvps           → { total, byTier[{ tierId, tierName, count }] }
// data.checkIns        → { total, rate }          — rate is already a %
// data.postcards       → { total }
// data.gameSessions    → [{ id, title, status, participantCount }]
// data.revenue         → { total }                — kobo
// data.ticketsSold     → number
// data.social          → { likes, shares, comments }
function EventSummarySection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const d              = data?.data ?? {};
  const rsvpTotal      = d.rsvps?.total      ?? 0;
  const checkinTotal   = d.checkIns?.total   ?? 0;
  const checkinRate    = d.checkIns?.rate     ?? 0;   // already a % from API
  const ticketsSold    = d.ticketsSold        ?? 0;
  const postcardTotal  = d.postcards?.total   ?? 0;
  const revenue        = d.revenue?.total     ?? 0;   // kobo
  const gameSessions: any[] = Array.isArray(d.gameSessions) ? d.gameSessions : [];
  const activeGames    = gameSessions.filter((g: any) => g.status === "ACTIVE").length;
  const totalParticipants = gameSessions.reduce((s: number, g: any) => s + (g.participantCount ?? 0), 0);
  const tierData: any[]    = d.rsvps?.byTier ?? [];

  return (
    <div className="space-y-4">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard label="Total RSVPs"   value={fmt(rsvpTotal)}    icon={Users}      color={BRAND} />
        <KPICard label="Check-ins"     value={fmt(checkinTotal)} icon={CheckCheck} color="#2563eb"
                 sub={`${checkinRate}% conversion`} />
        <KPICard label="Tickets Sold"  value={fmt(ticketsSold)}  icon={Ticket}     color="#9333ea" />
        <KPICard label="Revenue"       value={fmtMoney(revenue)} icon={DollarSign} color="#16a34a" />
        <KPICard label="Game Sessions" value={fmt(gameSessions.length)} icon={Gamepad2} color="#ea580c"
                 sub={`${activeGames} active`} />
        <KPICard label="Postcards"     value={fmt(postcardTotal)} icon={ImageIcon} color="#0891b2" />
      </div>

      {/* RSVP → Check-in conversion bar */}
      {rsvpTotal > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">RSVP → Check-in Conversion</span>
              <span className="font-bold" style={{ color: BRAND }}>{checkinRate}%</span>
            </div>
            <ProgressBar value={checkinTotal} max={rsvpTotal} />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{fmt(checkinTotal)} checked in</span>
              <span>{fmt(rsvpTotal)} total RSVPs</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSVPs by ticket tier */}
      {tierData.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              RSVPs by Ticket Tier
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierData.map((t: any) => ({ name: t.tierName, RSVPs: t.count }))} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip {...TIP_STYLE} />
                  <Bar dataKey="RSVPs" fill={BRAND} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active game sessions list — real data: [{id,title,status,participantCount}] */}
      {gameSessions.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Game Sessions
              </p>
              <span className="text-[10px] text-muted-foreground">
                {fmt(totalParticipants)} total players
              </span>
            </div>
            <div className="space-y-2">
              {gameSessions.map((g: any) => (
                <div key={g.id}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      g.status === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
                    )} />
                    <span className="truncate text-xs font-medium text-foreground">{g.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-muted-foreground">
                      {fmt(g.participantCount)} players
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      g.status === "ACTIVE"
                        ? "bg-green-500/10 text-green-600"
                        : g.status === "ENDED"
                        ? "bg-muted text-muted-foreground"
                        : "bg-amber-500/10 text-amber-600"
                    )}>
                      {g.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Section 2: Revenue (uses /analytics/events/:id/revenue) ─────────────────
// Response shape:
// data.totalRevenue        → number (kobo)
// data.completedPurchases  → number
// data.refundCount         → number
// data.byStatus            → [] (status: string, count: number, revenue: number)
// data.byTier              → [] (tierName: string, sold: number, revenue: number)
function RevenueSection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventRevenueAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const d                  = data?.data ?? {};
  const totalRevenue        = d.totalRevenue        ?? 0;
  const completedPurchases  = d.completedPurchases  ?? 0;
  const refundCount         = d.refundCount         ?? 0;
  const byStatus: any[]     = d.byStatus            ?? [];
  const byTier: any[]       = d.byTier              ?? [];

  const hasData = totalRevenue > 0 || completedPurchases > 0 || byStatus.length > 0;

  if (!hasData)
    return <Empty icon={DollarSign} message="No revenue data yet. Data appears once tickets are purchased." />;

  // Status pie data — only include entries with count > 0
  const statusPie = byStatus
    .filter((s: any) => (s.count ?? s.total ?? 0) > 0)
    .map((s: any, i: number) => ({
      name:  s.status  ?? s.label ?? `Status ${i + 1}`,
      value: s.count   ?? s.total ?? 0,
      fill:  PALETTE[i % PALETTE.length],
    }));

  // Tier bar data
  const tierBars = byTier.map((t: any) => ({
    name:    t.tierName ?? t.name ?? "Tier",
    Revenue: t.revenue  ?? 0,   // kobo
    Sold:    t.sold     ?? t.count ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard label="Total Revenue"   value={fmtMoney(totalRevenue)}      icon={DollarSign} color="#16a34a" />
        <KPICard label="Completed Sales" value={fmt(completedPurchases)}     icon={TrendingUp} color={BRAND} />
        <KPICard label="Refunds"         value={fmt(refundCount)}             icon={RefreshCw}  color="#dc2626" />
        <KPICard label="Avg per Sale"    icon={DollarSign} color="#9333ea"
                 value={completedPurchases > 0 ? fmtMoney(Math.round(totalRevenue / completedPurchases)) : "—"} />
      </div>

      {/* Status donut */}
      {statusPie.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Transactions by Status
            </p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" outerRadius={72} innerRadius={36}
                       dataKey="value" paddingAngle={3} label={false}>
                    {statusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip {...TIP_STYLE} formatter={(v: any) => [fmt(v), "transactions"]} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by tier */}
      {tierBars.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Revenue by Ticket Tier
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierBars} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                         tickFormatter={v => fmtMoney(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false}
                         axisLine={false} width={72} />
                  <Tooltip {...TIP_STYLE} formatter={(v: any, name: any) =>
                    [name === "Revenue" ? fmtMoney(v) : fmt(v), name]} />
                  <Bar dataKey="Revenue" fill={BRAND}   radius={[0, 6, 6, 0]} />
                  <Bar dataKey="Sold"    fill="#e87aaa" radius={[0, 6, 6, 0]} />
                  <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Section 2b: Gamification (uses /analytics/events/:id/games) ─────────────
// Verified real shape (Gamification Analytics — Frontend Implementation Guide):
// data.totalSessions   → number
// data.totalPlayers    → number   — unique players who played a round, spectators excluded
// data.totalWinners    → number   — total rewards distributed across all sessions
// data.engagementRate  → number   — already a %, e.g. 72.5 → render "72.5%"
// data.sessions[]      → { id, title, status, startsAt, playerCount }
// data.winners[]       → { rewardId, user{id,username,displayName,avatarUrl},
//                          session{id,title}, reward{rank,type,title,value},
//                          isClaimed, claimedAt, awardedAt }
//
// winners arrive sorted by awardedAt ascending; re-sorted here by reward.rank
// so 1st/2nd/3rd group naturally. reward.value is a string — CASH gets a ₦
// prefix, everything else (VOUCHER/ITEM/etc.) is shown as-is.
function GamesAnalyticsSection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventGameAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const d               = data?.data ?? {};
  const totalSessions   = d.totalSessions  ?? 0;
  const totalPlayers    = d.totalPlayers   ?? 0;
  const totalWinners    = d.totalWinners   ?? 0;
  const engagementRate  = d.engagementRate ?? 0;
  const sessions: any[] = Array.isArray(d.sessions) ? d.sessions : [];
  const winners: any[]  = Array.isArray(d.winners)  ? d.winners  : [];

  if (totalSessions === 0)
    return <Empty icon={Gamepad2} message="No game sessions have been run for this event yet." />;

  const statusStyle: Record<string, string> = {
    ACTIVE:    "bg-green-500/10 text-green-600",
    UNLOCKED:  "bg-blue-500/10 text-blue-600",
    PENDING:   "bg-amber-500/10 text-amber-600",
    ENDED:     "bg-muted text-muted-foreground",
    CANCELLED: "bg-destructive/10 text-destructive",
  };

  const fmtRewardValue = (reward: any) => {
    const value = reward?.value ?? "";
    if (reward?.type !== "CASH") return value;
    const n = Number(value);
    return `₦${Number.isFinite(n) ? n.toLocaleString() : value}`;
  };

  const rankedWinners = [...winners].sort(
    (a: any, b: any) => (a.reward?.rank ?? 0) - (b.reward?.rank ?? 0),
  );
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard label="Sessions"   value={fmt(totalSessions)}     icon={Gamepad2}   color="#ea580c" />
        <KPICard label="Players"    value={fmt(totalPlayers)}      icon={Users}      color={BRAND} />
        <KPICard label="Winners"    value={fmt(totalWinners)}      icon={Trophy}     color="#f59e0b" />
        <KPICard label="Engagement" value={`${engagementRate}%`}   icon={TrendingUp} color="#16a34a"
                 sub="of confirmed RSVPs played" />
      </div>

      {/* Per-session breakdown */}
      {sessions.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Sessions
            </p>
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <div key={s.id}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                  <span className="truncate text-xs font-medium text-foreground">{s.title}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-muted-foreground">
                      {fmt(s.playerCount)} players
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      statusStyle[s.status] ?? "bg-muted text-muted-foreground",
                    )}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Winners table */}
      {rankedWinners.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Winners
            </p>
            <div className="space-y-2">
              {rankedWinners.map((w: any, i: number) => {
                const name = w.user?.displayName ?? w.user?.username ?? "Unknown";
                const rank = w.reward?.rank ?? i + 1;
                return (
                  <div key={w.rewardId ?? i}
                    className="flex items-start gap-2.5 rounded-2xl bg-muted/30 p-2.5">
                    <span className="mt-0.5 w-5 shrink-0 text-center text-sm">
                      {medals[rank - 1] ?? (
                        <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">{name}</p>
                          <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                            {w.session?.title ?? "—"}
                            {w.reward?.title && <> · {w.reward.title}</>}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold" style={{ color: BRAND }}>
                            {fmtRewardValue(w.reward)}
                          </p>
                          <span className={cn(
                            "text-[10px] font-medium",
                            w.isClaimed ? "text-green-600" : "text-amber-600",
                          )}>
                            {w.isClaimed ? "Claimed" : "Unclaimed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Section 3: Social Velocity (uses /analytics/events/:id/social) ───────────
// Verified real shape:
// data.event     → { likes, shares, comments }      — event-page interactions
// data.postcards → { totalPostcards, totalLikes, totalShares, totalComments,
//                    avgLikesPerPostcard }            — postcard interactions
// data.combined  → { totalLikes, totalShares, totalComments }  — sum of both
//
// NOTE: combined can be 0 even when postcards have likes — always show
//       postcard-level data if postcards.totalPostcards > 0
function SocialSection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventSocialAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const d = data?.data ?? {};

  // Event-level interactions
  const eventLikes    = d.event?.likes    ?? 0;
  const eventShares   = d.event?.shares   ?? 0;
  const eventComments = d.event?.comments ?? 0;

  // Postcard-level interactions
  const pcTotal    = d.postcards?.totalPostcards      ?? 0;
  const pcLikes    = d.postcards?.totalLikes          ?? 0;
  const pcShares   = d.postcards?.totalShares         ?? 0;
  const pcComments = d.postcards?.totalComments       ?? 0;
  const pcAvgLikes = d.postcards?.avgLikesPerPostcard ?? 0;

  // Combined — use this for top-line numbers
  // Fall back to summing manually if combined is missing
  const totalLikes    = d.combined?.totalLikes    ?? (eventLikes    + pcLikes);
  const totalShares   = d.combined?.totalShares   ?? (eventShares   + pcShares);
  const totalComments = d.combined?.totalComments ?? (eventComments + pcComments);

  // Show section whenever there are postcards OR any interaction
  const hasAnyData = pcTotal > 0 || totalLikes > 0 || totalShares > 0 || totalComments > 0;

  if (!hasAnyData)
    return <Empty icon={Share2}
      message="No social activity yet. Interactions appear as attendees engage with the event." />;

  const combinedPie = [
    { name: "Likes",    value: totalLikes,    fill: "#e11d48" },
    { name: "Shares",   value: totalShares,   fill: "#9333ea" },
    { name: "Comments", value: totalComments, fill: "#0284c7" },
  ].filter(x => x.value > 0);

  const comparisonData = [
    { category: "Likes",    Event: eventLikes,    Postcards: pcLikes    },
    { category: "Shares",   Event: eventShares,   Postcards: pcShares   },
    { category: "Comments", Event: eventComments, Postcards: pcComments },
  ];
  const hasComparison = comparisonData.some(r => r.Event > 0 || r.Postcards > 0);

  return (
    <div className="space-y-4">
      {/* Top-line KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <KPICard label="Likes"    value={fmt(totalLikes)}    icon={Heart}         color="#e11d48" />
        <KPICard label="Shares"   value={fmt(totalShares)}   icon={Share2}        color="#9333ea" />
        <KPICard label="Comments" value={fmt(totalComments)} icon={MessageCircle} color="#0284c7" />
      </div>

      {/* Engagement mix donut — only if there's something to show */}
      {combinedPie.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 text-center">
              Engagement Mix
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={combinedPie} cx="50%" cy="50%" outerRadius={68} innerRadius={34}
                       dataKey="value" paddingAngle={4} label={false}>
                    {combinedPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip {...TIP_STYLE} formatter={(v: any) => [fmt(v), ""]} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event vs Postcards comparison */}
      {hasComparison && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Event vs Postcard Engagement
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip {...TIP_STYLE} />
                  <Bar dataKey="Event"     fill={BRAND}   radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Postcards" fill="#e87aaa" radius={[4, 4, 0, 0]} barSize={20} />
                  <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Postcard detail stats — always show if postcards exist */}
      {pcTotal > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Postcard Engagement Detail
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Postcards",  value: fmt(pcTotal) },
                { label: "Avg Likes / Post", value: Number(pcAvgLikes).toFixed(1) },
                { label: "Postcard Likes",   value: fmt(pcLikes) },
                { label: "Postcard Comments",value: fmt(pcComments) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-muted/40 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Section 4: Vibe-Tags (uses /analytics/events/:id/vibetags) ───────────────
// Verified real shape:
// data.vibeTags[].id                    → string
// data.vibeTags[].name                  → string
// data.vibeTags[].activityTiming        → "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT"
// data.vibeTags[].imageUrl              → string
// data.vibeTags[].postcardCount         → number  ← actual field (not validationCount)
// data.vibeTags[].totalLikesOnPostcards → number  ← actual field (not totalAssets)
function VibeTagSection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventVibeTagAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const tags: any[] = data?.data?.vibeTags ?? [];

  if (!tags.length)
    return <Empty icon={Tag} message="No vibe-tag data yet. Tags appear once they're added to this event." />;

  const maxPosts = Math.max(...tags.map((t: any) => t.postcardCount ?? 0), 1);

  // Phase label map
  const phaseLabel: Record<string, string> = {
    PRE_EVENT:    "Pre-Event",
    DURING_EVENT: "During",
    POST_EVENT:   "Post-Event",
  };
  const phaseColor: Record<string, string> = {
    PRE_EVENT:    "#f59e0b",
    DURING_EVENT: BRAND,
    POST_EVENT:   "#0891b2",
  };

  // Chart — postcardCount + totalLikesOnPostcards per tag
  const chartData = tags.map((t: any) => ({
    name:   (t.name ?? "Tag").trim().slice(0, 14),
    Posts:  t.postcardCount         ?? 0,
    Likes:  t.totalLikesOnPostcards ?? 0,
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard label="Total Tags"   value={fmt(tags.length)}  icon={Tag}         color={BRAND} />
        <KPICard label="Total Posts"
                 value={fmt(tags.reduce((s: number, t: any) => s + (t.postcardCount ?? 0), 0))}
                 icon={ImageIcon} color="#0891b2" />
        <KPICard label="Total Likes on Posts"
                 value={fmt(tags.reduce((s: number, t: any) => s + (t.totalLikesOnPostcards ?? 0), 0))}
                 icon={Heart} color="#e11d48" />
        <KPICard label="Top Tag Posts"
                 value={fmt(maxPosts)}
                 icon={TrendingUp} color="#9333ea" />
      </div>

      {/* Posts + Likes per tag */}
      <Card className="border-border/60">
        <CardContent className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Posts &amp; Likes per Tag
          </p>
          <div style={{ height: Math.max(140, tags.length * 56) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false}
                       axisLine={false} width={72} />
                <Tooltip {...TIP_STYLE} />
                <Bar dataKey="Posts" fill={BRAND}   radius={[0, 6, 6, 0]} barSize={14} />
                <Bar dataKey="Likes" fill="#e87aaa" radius={[0, 6, 6, 0]} barSize={14} />
                <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-tag detail cards */}
      <div className="space-y-2">
        {tags.map((t: any, i: number) => {
          const phase = t.activityTiming ?? "PRE_EVENT";
          const posts = t.postcardCount         ?? 0;
          const likes = t.totalLikesOnPostcards ?? 0;
          return (
            <div key={t.id ?? i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              {/* Tag image */}
              {/* {t.imageUrl && (
                <img src={t.imageUrl} alt={t.name}
                  className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              )} */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {t.name ?? `Tag ${i + 1}`}
                  </span>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: `${phaseColor[phase]}1a`, color: phaseColor[phase] }}>
                    {phaseLabel[phase] ?? phase}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{fmt(posts)} posts</span>
                  <span className="text-border">·</span>
                  <span>♥ {fmt(likes)} likes</span>
                </div>
                <ProgressBar value={posts} max={maxPosts} color={PALETTE[i % PALETTE.length]} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section 5: Postcards (uses /analytics/events/:id/postcards) ──────────────
// Verified real shape:
// data.total                    → number
// data.byVisibility             → { PUBLIC: number, PRIVATE: number }  — object
// data.byVibeTag[]              → { vibeTagId, vibeTagName, postcardCount, totalLikes }
// data.topPostcards[]           → { id, caption, visibility, likeCount, commentCount,
//                                   createdAt, author{id,username,displayName},
//                                   vibeTag{id,name}, media[{mediaType}] }
function PostcardSection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventPostcardAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const d              = data?.data ?? {};
  const total          = d.total          ?? 0;
  const byVisibility   = d.byVisibility   ?? {};
  const byVibeTag: any[] = d.byVibeTag    ?? [];
  const topPostcards: any[] = d.topPostcards ?? [];

  if (total === 0)
    return <Empty icon={ImageIcon} message="No postcards yet. They appear once attendees create them." />;

  // byVisibility is a plain object: { PUBLIC: 3, PRIVATE: 0 }
  const visData = Object.entries(byVisibility)
    .map(([name, value], i) => ({ name, value: value as number, fill: PALETTE[i % PALETTE.length] }))
    .filter(x => x.value > 0);

  // byVibeTag bar — uses real field postcardCount
  const vibeTagBars = byVibeTag.map((v: any) => ({
    name:  (v.vibeTagName ?? "Tag").trim().slice(0, 14),
    Posts: v.postcardCount ?? 0,
    Likes: v.totalLikes    ?? 0,
  }));

  const topLikes = Math.max(...topPostcards.map((p: any) => p.likeCount ?? 0), 1);

  const mediaIcon = (type: string) =>
    type === "VIDEO" ? "🎬" : type === "AUDIO" ? "🎵" : "📷";

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard label="Total Postcards" value={fmt(total)}     icon={ImageIcon} color="#0891b2" />
        <KPICard label="Top Post Likes"
                 value={fmt(topPostcards[0]?.likeCount ?? 0)}
                 icon={Heart} color="#e11d48" />
      </div>

      {/* Visibility donut */}
      {visData.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 text-center">
              Visibility Split
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={visData} cx="50%" cy="50%" outerRadius={70} innerRadius={36}
                       dataKey="value" paddingAngle={4} label={false}>
                    {visData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip {...TIP_STYLE} formatter={(v: any) => [fmt(v), "postcards"]} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts & Likes per Vibe-Tag */}
      {vibeTagBars.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Posts &amp; Likes per Vibe-Tag
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vibeTagBars} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={24} />
                  <Tooltip {...TIP_STYLE} />
                  <Bar dataKey="Posts" fill={BRAND}   radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="Likes" fill="#e87aaa" radius={[4, 4, 0, 0]} barSize={22} />
                  <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top postcards leaderboard with rich author + media info */}
      {topPostcards.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Top Posts by Likes
            </p>
            <div className="space-y-2.5">
              {topPostcards.slice(0, 10).map((p: any, i: number) => {
                const likes    = p.likeCount    ?? 0;
                const comments = p.commentCount ?? 0;
                const author   = p.author?.displayName ?? p.author?.username ?? "Unknown";
                const tagName  = p.vibeTag?.name?.trim() ?? "";
                const mediaType = p.media?.[0]?.mediaType ?? "PHOTO";
                const medals   = ["🥇", "🥈", "🥉"];
                const caption  = p.caption?.trim() || null;
                return (
                  <div key={p.id ?? i}
                    className="flex items-start gap-2.5 rounded-2xl bg-muted/30 p-2.5">
                    <span className="mt-0.5 w-5 shrink-0 text-center text-sm">
                      {medals[i] ?? (
                        <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">
                            {caption ?? `Post by ${author}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {mediaIcon(mediaType)} {author}
                            {tagName && <> · <span style={{ color: BRAND }}>{tagName}</span></>}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold" style={{ color: "#e11d48" }}>
                            ♥ {fmt(likes)}
                          </p>
                          {comments > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              {fmt(comments)} cmts
                            </p>
                          )}
                        </div>
                      </div>
                      <ProgressBar value={likes} max={topLikes} color="#e11d48" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Section 6: Audience Demographics (Location) ─────────────────────────────
// Uses GET /v1/analytics/events/:id/locations — the dedicated location endpoint.
// Response shape:
//   data.eventId         → string
//   data.totalAttendees  → number
//   data.byCity[]        → { city, count, percentage }
//   data.byCountry[]     → { country, count, percentage }
//
// "Unknown" bucket = attendees who haven't shared location yet.
// Per doc: show tooltip "Unknown includes attendees who haven't shared their location yet."
function DemographicsSection({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventLocationAnalyticsQuery(eventId);

  if (isLoading) return <SectionSkeleton />;
  if (isError)   return <SectionError onRetry={refetch} />;

  const d = data?.data ?? data ?? {};
  const totalAttendees: number = d.totalAttendees ?? 0;
  const byCity: any[]          = d.byCity         ?? [];
  const byCountry: any[]       = d.byCountry       ?? [];

  if (totalAttendees === 0)
    return (
      <Empty icon={MapPin}
        message="No confirmed attendees yet. Location clusters appear once people RSVP." />
    );

  // "Unknown" always rendered last with a tooltip footnote
  const unknownCity    = byCity.find((c: any) => c.city === "Unknown");
  const unknownCountry = byCountry.find((c: any) => c.country === "Unknown");
  const locatedCount   = totalAttendees - (unknownCity?.count ?? 0);
  const coveragePct    = totalAttendees > 0
    ? Math.round((locatedCount / totalAttendees) * 100) : 0;

  // Separate known from unknown for bar chart data
  const cityBars    = byCity.map((c: any)    => ({ name: c.city    ?? "Unknown", count: c.count, pct: c.percentage }));
  const countryBars = byCountry.map((c: any) => ({ name: c.country ?? "Unknown", count: c.count, pct: c.percentage }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard label="Total Attendees"   value={fmt(totalAttendees)} icon={Users}  color={BRAND} />
        <KPICard label="Location Coverage"
                 value={`${coveragePct}%`}
                 icon={MapPin} color="#0891b2"
                 sub={`${fmt(locatedCount)} with location`} />
      </div>

      {/* Unknown bucket notice */}
      {unknownCity && unknownCity.count > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30
                        bg-amber-500/5 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <span className="font-semibold">{fmt(unknownCity.count)}</span> attendee
            {unknownCity.count !== 1 ? "s" : ""}{" "}
            ({unknownCity.percentage}%) haven&apos;t shared their location yet.
            This percentage will decrease over time as more users use the app.
          </p>
        </div>
      )}

      {/* City bar chart */}
      {cityBars.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top Cities
              </p>
            </div>
            <div style={{ height: Math.max(120, cityBars.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityBars} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                         allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false}
                         axisLine={false} width={80} />
                  <Tooltip
                    {...TIP_STYLE}
                    formatter={(v: any, _: any, props: any) => [
                      `${fmt(v)} attendees (${props?.payload?.pct ?? 0}%)`,
                      "Count",
                    ]}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return (
                        <div style={TIP_STYLE.contentStyle} className="px-3 py-2 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{fmt(p.count)} attendees · {p.pct}%</p>
                          {p.name === "Unknown" && (
                            <p className="text-[10px] text-amber-600 max-w-[180px]">
                              Unknown includes attendees who haven&apos;t shared their location yet.
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="Attendees" fill={BRAND} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Country bar chart */}
      {countryBars.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top Countries
              </p>
            </div>
            <div style={{ height: Math.max(120, countryBars.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryBars} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                         allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false}
                         axisLine={false} width={80} />
                  <Tooltip
                    {...TIP_STYLE}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return (
                        <div style={TIP_STYLE.contentStyle} className="px-3 py-2 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{fmt(p.count)} attendees · {p.pct}%</p>
                          {p.name === "Unknown" && (
                            <p className="text-[10px] text-amber-600 max-w-[180px]">
                              Unknown includes attendees who haven&apos;t shared their location yet.
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="Attendees" fill="#c4417a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Accordion wrapper ────────────────────────────────────────────────────────
function AccordionCard({
  id, label, icon, children, defaultOpen = false,
}: {
  id: string; label: string; icon: React.ReactNode;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={`section-${id}`}
      className={cn(
        "rounded-2xl border bg-card transition-all duration-200",
        open ? "border-primary/30 shadow-sm" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left select-none"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors"
          style={{ background: open ? `${BRAND}1a` : "hsl(var(--muted))" }}
        >
          <span style={{ color: open ? BRAND : "hsl(var(--muted-foreground))" }}>
            {icon}
          </span>
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        open ? "opacity-100" : "max-h-0 opacity-0 pointer-events-none",
      )}>
        <div className="border-t border-border/60 px-4 pb-5 pt-3">
          {open && children}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface Props { params: Promise<{ eventId: string }> }

const SECTIONS: {
  id: string;
  label: string;
  icon: React.ReactNode;
  Component: React.ComponentType<{ eventId: string }>;
  defaultOpen?: boolean;
}[] = [
  {
    id: "summary",
    label: "Event Summary",
    icon: <BarChart3 className="h-4 w-4" />,
    Component: EventSummarySection,
    defaultOpen: true,
  },
  {
    id: "revenue",
    label: "Revenue & Tickets",
    icon: <DollarSign className="h-4 w-4" />,
    Component: RevenueSection,
  },
  {
    id: "games",
    label: "Gamification",
    icon: <Gamepad2 className="h-4 w-4" />,
    Component: GamesAnalyticsSection,
  },
  {
    id: "social",
    label: "Social Velocity",
    icon: <Share2 className="h-4 w-4" />,
    Component: SocialSection,
  },
  {
    id: "vibetags",
    label: "Vibe-Tag Engagement",
    icon: <Tag className="h-4 w-4" />,
    Component: VibeTagSection,
  },
  {
    id: "postcards",
    label: "Postcard Performance",
    icon: <ImageIcon className="h-4 w-4" />,
    Component: PostcardSection,
  },
  {
    id: "demographics",
    label: "Audience Demographics",
    icon: <MapPin className="h-4 w-4" />,
    Component: DemographicsSection,
  },
];

export default function EventAnalyticsPage({ params }: Props) {
  const { eventId } = use(params);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
          <Link
            href={`/dashboard/${eventId}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-base font-bold text-foreground leading-tight">
              Event Analytics
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Read-only · real-time telemetry
            </p>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `${BRAND}1a` }}
          >
            <BarChart3 className="h-4 w-4" style={{ color: BRAND }} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-lg px-4 pt-4 space-y-3">
        {SECTIONS.map(({ id, label, icon, Component, defaultOpen }) => (
          <AccordionCard key={id} id={id} label={label} icon={icon} defaultOpen={defaultOpen}>
            <Component eventId={eventId} />
          </AccordionCard>
        ))}
      </div>
    </div>
  );
}
