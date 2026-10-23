"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Wallet, Clock, Users, UserCheck, BadgeDollarSign } from "lucide-react";
import type { AffiliateMetrics } from "@/features/affiliate/api/affiliate-api";

const NAIRA = "₦";

function fmt(amount: number) {
  return `${NAIRA}${amount.toLocaleString()}`;
}

interface MetricsGridProps {
  metrics: AffiliateMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const items = [
    {
      label: "Total Earned",
      value: fmt(metrics.totalEarnings),
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-500/10",
    },
    {
      label: "Available",
      value: fmt(metrics.availableBalance),
      icon: <Wallet className="h-5 w-5 text-primary" />,
      bg: "bg-primary/10",
    },
    {
      label: "Pending",
      value: fmt(metrics.pendingBalance),
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      bg: "bg-amber-500/10",
    },
    {
      label: "Paid Out",
      value: fmt(metrics.paidOutBalance),
      icon: <BadgeDollarSign className="h-5 w-5 text-sky-500" />,
      bg: "bg-sky-500/10",
    },
    {
      label: "Total Referrals",
      value: String(metrics.totalReferrals),
      icon: <Users className="h-5 w-5 text-violet-500" />,
      bg: "bg-violet-500/10",
    },
    {
      label: "Converted",
      value: String(metrics.convertedReferrals),
      icon: <UserCheck className="h-5 w-5 text-fuchsia-600" />,
      bg: "bg-fuchsia-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="border-border">
          <CardContent className="p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg} mb-3`}>
              {item.icon}
            </div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-4">
            <Skeleton className="h-9 w-9 rounded-xl mb-3" />
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
