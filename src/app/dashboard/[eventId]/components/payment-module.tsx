"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Lock,
  Sparkles,
  Tag,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useGetQuoteMutation,
  useInitiatePlanPaymentMutation,
  useLazyVerifyOrganizerPaymentQuery,
  type PlanType,
  type PlanQuote,
} from "@/app/provider/api/organizerPaymentApi";
import {
  useUpdateEventStatusMutation,
  useGetPublishPreviewQuery,
} from "@/app/provider/api/eventApi";

// ─── Plan display helpers ─────────────────────────────────────────────────────

const PLAN_LABELS: Record<PlanType, string> = {
  VIBETAGS_SINGLE: "VibeTags — Single Phase",
  VIBETAGS_BUNDLE: "VibeTags — Full Bundle",
  GAMIFICATION_SINGLE: "Gamification — Single Phase",
  GAMIFICATION_BUNDLE: "Gamification — Full Bundle",
  MEGA_BUNDLE_SINGLE: "Mega Bundle — Single Phase",
  MEGA_BUNDLE_FULL: "Mega Bundle — Full Event",
};

const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
  VIBETAGS_SINGLE: "VibeTags for one event phase",
  VIBETAGS_BUNDLE: "VibeTags across all phases",
  GAMIFICATION_SINGLE: "Games for one event phase",
  GAMIFICATION_BUNDLE: "Games across all phases",
  MEGA_BUNDLE_SINGLE: "Games + VibeTags for one phase",
  MEGA_BUNDLE_FULL: "Games + VibeTags for the full event",
};

// ─── Verify-after-redirect modal ─────────────────────────────────────────────

interface VerifyModalProps {
  paymentId: string;
  onSuccess: () => void;
  onClose: () => void;
}

function VerifyModal({ paymentId, onSuccess, onClose }: VerifyModalProps) {
  const [triggerVerify, { data, isFetching }] =
    useLazyVerifyOrganizerPaymentQuery();
  const [pollCount, setPollCount] = useState(0);

  const poll = useCallback(() => {
    triggerVerify(paymentId);
    setPollCount((c) => c + 1);
  }, [paymentId, triggerVerify]);

  // Auto-poll on mount and every 3s while pending
  useEffect(() => {
    poll();
  }, [poll]);

  useEffect(() => {
    const status = data?.data?.status;
    if (status === "completed" || status === "already_completed") {
      onSuccess();
      return;
    }
    if (status === "pending") {
      const t = setTimeout(poll, 3000);
      return () => clearTimeout(t);
    }
  }, [data, poll, onSuccess]);

  const status = data?.data?.status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl mx-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {(!status || status === "pending" || isFetching) && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-semibold text-foreground">Verifying payment…</p>
            <p className="text-sm text-muted-foreground text-center">
              Checking with Juicyway. This usually takes a few seconds.
            </p>
            <p className="text-xs text-muted-foreground">
              Check #{pollCount}
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-semibold text-foreground">Payment failed</p>
            <p className="text-sm text-muted-foreground text-center">
              Juicyway reported a failed payment. You can retry from the
              dashboard.
            </p>
            <Button className="w-full rounded-xl" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PlanQuote;
  selected: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const hasDiscount =
    plan.volumeDiscountPercent > 0 || plan.couponDiscountAmount > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {PLAN_LABELS[plan.planType]}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {PLAN_DESCRIPTIONS[plan.planType]}
          </p>
          {plan.gamesIncluded != null && plan.gamesIncluded > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Includes {plan.gamesIncluded} game session
              {plan.gamesIncluded !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {hasDiscount && (
            <p className="text-xs text-muted-foreground line-through">
              ₦{plan.baseAmount.toLocaleString()}
            </p>
          )}
          <p className="text-base font-bold text-primary">
            ₦{plan.finalAmount.toLocaleString()}
          </p>
          {plan.volumeDiscountPercent > 0 && (
            <Badge className="mt-0.5 bg-green-500/10 text-green-600 text-[10px]">
              {plan.volumeDiscountPercent}% off
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PaymentModuleProps {
  eventId: string;
  eventStatus?: string;
}

export function PaymentModule({ eventId, eventStatus }: PaymentModuleProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [quotedPlan, setQuotedPlan] = useState<PlanQuote | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

  const {
    data: previewData,
    isLoading: isLoadingPreview,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useGetPublishPreviewQuery(eventId, {
    // Only fetch for DRAFT events — published events don't need the publish flow
    skip: !eventId || (!!eventStatus && eventStatus !== "DRAFT"),
  });

  const [getQuote, { isLoading: isQuoting }] = useGetQuoteMutation();
  const [initiatePlanPayment, { isLoading: isInitiating }] =
    useInitiatePlanPaymentMutation();
  const [updateEventStatus, { isLoading: isPublishing }] =
    useUpdateEventStatusMutation();

  const preview = previewData?.data;

  // Auto-select first plan when preview loads
  useEffect(() => {
    if (preview?.availablePlans?.length && !selectedPlan) {
      setSelectedPlan(preview.availablePlans[0].planType);
    }
  }, [preview, selectedPlan]);

  // Don't render for non-DRAFT events or when there's nothing to show
  if (eventStatus && eventStatus !== "DRAFT") return null;

  if (isLoadingPreview) {
    return (
      <Card className="border-primary/30 overflow-hidden">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isPreviewError) {
    return (
      <Card className="border-destructive/30 overflow-hidden">
        <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Could not load publish options.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full"
            onClick={() => refetchPreview()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No preview data yet (e.g. skipped query)
  if (!preview) return null;

  // ── Free publish path ──────────────────────────────────────────────────────
  if (preview.isFreePublish) {
    return (
      <Card className="border-green-500/30 bg-green-500/5 overflow-hidden">
        <CardContent className="pt-5 pb-5 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <div>
            <p className="font-semibold text-foreground">
              Free Publish Available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No games or VibeTags — your event publishes for free.
            </p>
          </div>
          <Button
            className="w-full rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
            disabled={isPublishing}
            onClick={async () => {
              try {
                await updateEventStatus({
                  eventId,
                  status: "PUBLISHED",
                }).unwrap();
                toast.success("Event published! It's now live.");
              } catch (err: any) {
                toast.error(
                  err?.data?.message ?? "Failed to publish event."
                );
              }
            }}
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </span>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Publish for Free
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Paid publish path ──────────────────────────────────────────────────────
  const plans = preview.availablePlans;
  const activePlan =
    quotedPlan ??
    plans.find((p) => p.planType === selectedPlan) ??
    plans[0] ??
    null;

  const handleApplyCoupon = async () => {
    if (!selectedPlan || !couponInput.trim()) return;
    try {
      const res = await getQuote({
        eventId,
        planType: selectedPlan,
        couponCode: couponInput.trim(),
      }).unwrap();
      setQuotedPlan(res.data);
      setAppliedCoupon(couponInput.trim());
      toast.success("Coupon applied!");
      
      // Refetch publish preview to update pricing
      refetchPreview();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Invalid or expired coupon.");
    }
  };

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType);
    // Reset quote when plan changes — re-apply coupon if one was set
    setQuotedPlan(null);
    if (appliedCoupon) {
      getQuote({ eventId, planType, couponCode: appliedCoupon })
        .unwrap()
        .then((res) => setQuotedPlan(res.data))
        .catch(() => {
          setAppliedCoupon(undefined);
          setCouponInput("");
        });
    }
  };

  const handleActivate = async () => {
    if (!selectedPlan) return;
    try {
      const res = await initiatePlanPayment({
        eventId,
        planType: selectedPlan,
        ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
      }).unwrap();

      // Store paymentId so we can verify on return
      setPendingPaymentId(res.data.paymentId);

      // Redirect to Juicyway checkout
      window.location.href = res.data.checkoutUrl;
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to initiate payment.");
    }
  };

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" />
              Publish Your Event
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-amber-500/10 text-amber-600"
            >
              <Lock className="mr-1 h-3 w-3" />
              Payment Required
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Event summary */}
          <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Tier</span>
              <span className="font-medium text-foreground capitalize">
                {preview.tier.toLowerCase()}
              </span>
            </div>
            {preview.gameSessionCount > 0 && (
              <div className="flex justify-between">
                <span>Game sessions</span>
                <span className="font-medium text-foreground">
                  {preview.gameSessionCount}
                </span>
              </div>
            )}
            {preview.vibetagCount > 0 && (
              <div className="flex justify-between">
                <span>VibeTags</span>
                <span className="font-medium text-foreground">
                  {preview.vibetagCount}
                </span>
              </div>
            )}
          </div>

          {/* Plan selector */}
          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              onClick={() => setIsExpanded((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Choose a Plan
              </span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {isExpanded && (
              <div className="space-y-2">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.planType}
                    plan={plan}
                    selected={selectedPlan === plan.planType}
                    onSelect={() => handlePlanSelect(plan.planType)}
                  />
                ))}
              </div>
            )}

            {/* Show selected plan summary when collapsed */}
            {!isExpanded && activePlan && (
              <PlanCard
                plan={activePlan}
                selected
                onSelect={() => setIsExpanded(true)}
              />
            )}
          </div>

          {/* Coupon */}
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code (optional)"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="h-9 rounded-xl text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyCoupon();
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl shrink-0"
              disabled={!couponInput.trim() || isQuoting}
              onClick={handleApplyCoupon}
            >
              {isQuoting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {appliedCoupon && quotedPlan && (
            <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2 text-xs">
              <span className="text-green-700 font-medium">
                Coupon &quot;{appliedCoupon}&quot; applied
              </span>
              <span className="text-green-700 font-bold">
                −₦{quotedPlan.couponDiscountAmount.toLocaleString()}
              </span>
            </div>
          )}

          {/* Divider + total */}
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-display font-bold text-primary">
              ₦{(activePlan?.finalAmount ?? 0).toLocaleString()}
            </span>
          </div>

          {/* CTA */}
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-[#531342] to-[#7a1d5e] hover:from-[#531342]/90 hover:to-[#7a1d5e]/90 text-white"
            disabled={!selectedPlan || isInitiating}
            onClick={handleActivate}
          >
            {isInitiating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to checkout…
              </span>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Pay & Publish Event
              </>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            You&apos;ll be redirected to Juicyway to complete payment. Your
            event publishes automatically on success.
          </p>
        </CardContent>
      </Card>

      {/* Verify modal — shown when returning from checkout */}
      {pendingPaymentId && (
        <VerifyModal
          paymentId={pendingPaymentId}
          onSuccess={() => {
            setPendingPaymentId(null);
            toast.success("Payment confirmed! Your event is now live.");
            refetchPreview();
          }}
          onClose={() => setPendingPaymentId(null)}
        />
      )}
    </>
  );
}
