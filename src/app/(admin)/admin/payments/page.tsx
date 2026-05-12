"use client";

import { useGetPaymentsQuery, useGetPaymentStatsQuery } from "@/app/provider/api/admin";
import { StatsCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react";

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "completed":
    case "success":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

export default function PaymentsPage() {
  const { data: payments, isLoading: paymentsLoading, isError: paymentsError } = useGetPaymentsQuery();
  const { data: paymentStats, isLoading: statsLoading } = useGetPaymentStatsQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All ticket purchases and payment statistics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={paymentStats?.total_revenue ? `$${Number(paymentStats.total_revenue).toLocaleString()}` : "$0"}
          icon={DollarSign}
          loading={statsLoading}
        />
        <StatsCard
          title="Total Transactions"
          value={paymentStats?.total_transactions ?? 0}
          icon={Receipt}
          loading={statsLoading}
        />
        <StatsCard
          title="Successful Payments"
          value={paymentStats?.successful_payments ?? 0}
          icon={TrendingUp}
          loading={statsLoading}
        />
        <StatsCard
          title="Failed Payments"
          value={paymentStats?.failed_payments ?? 0}
          icon={CreditCard}
          loading={statsLoading}
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <TableSkeleton />
          ) : paymentsError ? (
            <p className="text-center text-muted-foreground py-8">Failed to load payments.</p>
          ) : !payments || payments.length === 0 ? (
            <EmptyState title="No payments yet" description="Ticket purchases will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 pr-4 font-medium">User</th>
                    <th className="text-left py-3 pr-4 font-medium">Event</th>
                    <th className="text-left py-3 pr-4 font-medium">Amount</th>
                    <th className="text-left py-3 pr-4 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{payment.user?.displayName ?? payment.user?.username ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{payment.user?.email}</div>
                      </td>
                      <td className="py-3 pr-4 max-w-[200px] truncate">{payment.event?.title ?? "—"}</td>
                      <td className="py-3 pr-4 font-medium">${Number(payment.amount ?? 0).toLocaleString()}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3">
                        <Badge variant={statusVariant(payment.status)}>
                          {payment.status ?? "unknown"}
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
    </div>
  );
}
