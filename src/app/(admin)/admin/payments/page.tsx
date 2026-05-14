"use client";

import { useState } from "react";
import { useGetPaymentsQuery, useGetPaymentStatsQuery } from "@/app/provider/api/admin";
import { StatsCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, CreditCard, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 20;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

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
    case "completed": case "success": return "default";
    case "pending": return "secondary";
    case "failed": case "refunded": return "destructive";
    default: return "outline";
  }
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading: paymentsLoading, isError: paymentsError } = useGetPaymentsQuery({ page, limit: PAGE_SIZE });
  const { data: paymentStats, isLoading: statsLoading } = useGetPaymentStatsQuery();

  // Real API: { totalRevenue, completedPurchases, byStatus[], byMethod[] }
  const totalRevenue = paymentStats?.totalRevenue ?? 0;
  const completedPurchases = paymentStats?.completedPurchases ?? 0;
  const byStatus: { status: string; count: number }[] = paymentStats?.byStatus ?? [];
  const failedCount = byStatus.find((s) => s.status?.toLowerCase() === "failed")?.count ?? 0;
  const totalTransactions = byStatus.reduce((sum, s) => sum + (s.count ?? 0), 0);

  const payments = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All ticket purchases and payment statistics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`₦${Number(totalRevenue).toLocaleString()}`}
          icon={DollarSign}
          loading={statsLoading}
          accent="plum"
        />
        <StatsCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          icon={Receipt}
          loading={statsLoading}
          accent="cyan"
        />
        <StatsCard
          title="Completed"
          value={completedPurchases.toLocaleString()}
          icon={TrendingUp}
          loading={statsLoading}
          accent="pink"
        />
        <StatsCard
          title="Failed"
          value={failedCount.toLocaleString()}
          icon={CreditCard}
          loading={statsLoading}
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Transactions</CardTitle>
          {!paymentsLoading && (
            <span className="text-sm text-muted-foreground">{total.toLocaleString()} total</span>
          )}
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <TableSkeleton />
          ) : paymentsError ? (
            <p className="text-center text-muted-foreground py-8">Failed to load payments.</p>
          ) : payments.length === 0 ? (
            <EmptyState title="No payments yet" description="Ticket purchases will appear here." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
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
                        <td className="py-3 pr-4 max-w-[180px] truncate">
                          {payment.event?.name ?? payment.event?.title ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          ₦{Number(payment.amount ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {fmtDate(payment.createdAt)}
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-2">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
