"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { apiErrorMessage } from "@/shared/lib/error-handler";
import {
  useGetAffiliateStatusQuery,
  useRegisterAffiliateMutation,
  useGetAffiliateDashboardQuery,
  useGetAffiliateReferralsQuery,
  useGetAffiliateEarningsQuery,
  type AffiliateEarningStatus,
} from "@/features/affiliate/api/affiliate-api";
import { MetricsGrid, MetricsGridSkeleton } from "@/features/affiliate/components/metrics-grid";
import { ReferralLinkCard } from "@/features/affiliate/components/referral-link-card";
import { JoinAffiliateCard } from "@/features/affiliate/components/join-affiliate-card";
import { EarningStatusBadge } from "@/features/affiliate/components/earnings-status-badge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(amount: number) {
  return `₦${Number(amount).toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const EARNING_STATUSES: { label: string; value: AffiliateEarningStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid Out", value: "PAID_OUT" },
];

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ affiliateCode }: { affiliateCode: string }) {
  const { data: raw, isLoading } = useGetAffiliateDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <MetricsGridSkeleton />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // Backend wraps: { success, data: { profile, metrics, recentEarnings, recentReferrals } }
  const dashboard = raw?.data;
  if (!dashboard) return null;

  const { metrics, recentEarnings, recentReferrals } = dashboard;

  return (
    <div className="space-y-5">
      <ReferralLinkCard affiliateCode={affiliateCode} />
      <MetricsGrid metrics={metrics} />

      {/* Recent Earnings */}
      {recentEarnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Recent Earnings</p>
          {recentEarnings.slice(0, 3).map((earning) => (
            <Card key={earning.id} className="border-border">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    {earning.eventName ?? earning.planType ?? "Commission"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(earning.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-bold text-emerald-600 tabular-nums">
                    +{formatAmount(earning.amount)}
                  </span>
                  <EarningStatusBadge status={earning.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Referrals */}
      {recentReferrals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Recent Referrals</p>
          {recentReferrals.slice(0, 3).map((ref) => (
            <Card key={ref.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={ref.organizer.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {ref.organizer.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {ref.organizer.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{ref.organizer.username} · joined {formatDate(ref.organizer.joinedAt)}
                  </p>
                </div>
                {ref.completedPurchasesCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-emerald-500/10 text-emerald-600 text-[10px]"
                  >
                    {ref.completedPurchasesCount} purchase
                    {ref.completedPurchasesCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Referrals tab ────────────────────────────────────────────────────────────

function ReferralsTab() {
  const [page, setPage] = useState(1);
  const { data: raw, isLoading, isFetching } = useGetAffiliateReferralsQuery({ page, limit: 20 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Backend wraps: { success, data: { data: [...], meta: {...} } }
  const referrals = raw?.data?.data ?? [];
  const meta = raw?.data?.meta;

  if (referrals.length === 0) {
    return (
      <EmptyState
        title="No referrals yet"
        description="Share your referral link. Every organizer who signs up via your link appears here."
        icon={<Users className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {referrals.map((ref) => (
        <Card key={ref.id} className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={ref.organizer.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {ref.organizer.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {ref.organizer.displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                @{ref.organizer.username} · {formatDate(ref.organizer.joinedAt)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">Purchases</p>
              <p
                className={
                  ref.completedPurchasesCount > 0
                    ? "text-sm font-bold text-emerald-600"
                    : "text-sm font-semibold text-muted-foreground"
                }
              >
                {ref.completedPurchasesCount}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={page >= meta.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Earnings tab ─────────────────────────────────────────────────────────────

function EarningsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AffiliateEarningStatus | "ALL">("ALL");

  const { data: raw, isLoading, isFetching } = useGetAffiliateEarningsQuery({
    page,
    limit: 20,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
  });

  // Backend wraps: { success, data: { data: [...], meta: {...} } }
  const earnings = raw?.data?.data ?? [];
  const meta = raw?.data?.meta;

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {EARNING_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              statusFilter === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : earnings.length === 0 ? (
        <EmptyState
          title="No earnings yet"
          description="You'll see your commission history here once organizers you referred make purchases."
          icon={<TrendingUp className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="space-y-3">
          {earnings.map((earning) => (
            <Card key={earning.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {earning.eventName ?? earning.planType ?? "Commission"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(earning.createdAt)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <EarningStatusBadge status={earning.status} />
                      {earning.planType && (
                        <span className="text-[10px] text-muted-foreground">
                          {earning.planType.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600 tabular-nums">
                      +{formatAmount(earning.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {(Number(earning.rateApplied) * 100).toFixed(0)}% of{" "}
                      {formatAmount(earning.baseAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page === 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page >= meta.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Next"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page container ──────────────────────────────────────────────────────

export default function AffiliatesContainer() {
  const router = useRouter();
  const { data: statusRaw, isLoading: isCheckingStatus } = useGetAffiliateStatusQuery();
  const [registerAffiliate, { isLoading: isRegistering }] = useRegisterAffiliateMutation();

  // Backend wraps: { success, data: { isAffiliate, profile } }
  const statusData = statusRaw?.data;

  const handleJoin = async () => {
    try {
      await registerAffiliate().unwrap();
      toast.success("Welcome to the affiliate program!");
    } catch (err: any) {
      toast.error(apiErrorMessage(err) ?? "Could not register. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold">Affiliate Program</h1>
            {statusData?.isAffiliate && statusData.profile && (
              <p className="text-xs text-muted-foreground">
                Code: {statusData.profile.affiliateCode}
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {isCheckingStatus ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <MetricsGridSkeleton />
          </div>
        ) : !statusData?.isAffiliate ? (
          <JoinAffiliateCard onJoin={handleJoin} isLoading={isRegistering} />
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl mb-5">
              <TabsTrigger value="overview" className="rounded-lg text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="referrals" className="rounded-lg text-xs">
                Referrals
              </TabsTrigger>
              <TabsTrigger value="earnings" className="rounded-lg text-xs">
                Earnings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab affiliateCode={statusData.profile!.affiliateCode} />
            </TabsContent>

            <TabsContent value="referrals">
              <ReferralsTab />
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsTab />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
