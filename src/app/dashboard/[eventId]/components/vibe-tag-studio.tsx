"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Loader2, Info, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Vibetags from "./vibetag/vibetags";
import {
  useGetVibeTagsQuery,
  useGetEventDetailsQuery,
} from "@/app/provider/api/eventApi";
import { useInitiateVibeTagAddonPaymentMutation } from "@/app/provider/api/organizerPaymentApi";
import { useDispatch } from "react-redux";
import { setView, setTemplate } from "@/app/provider/slices/canvas-slice";
import { toast } from "sonner";
import { setHideHeader } from "@/app/provider/slices/ui-slice";

type ActivityTiming = "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH";

const TIMING_TABS: { value: ActivityTiming; label: string }[] = [
  { value: "PRE_EVENT", label: "Pre-Event" },
  { value: "DURING_EVENT", label: "Main Event" },
  { value: "POST_EVENT", label: "Post-Event" },
  { value: "BOTH", label: "Both" },
];

interface VibeTagStudioContentProps {
  eventId: string;
  name?: string;
  vibeTag?: any;
  eventPlan?: {
    vibetagsEnabled: boolean;
    vibetagPhases: string[];
    isQuotaExhausted: boolean;
  } | null;
}

const VibeTagStudioContent = ({ eventId, name, eventPlan }: VibeTagStudioContentProps) => {
  const dispatch = useDispatch();
  const [activeTiming, setActiveTiming] = useState<ActivityTiming>("PRE_EVENT");
  const [open, setOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [pendingUnlockVibeTagId, setPendingUnlockVibeTagId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    const eventStatus = eventDetails?.data?.status;
    const isPublished = eventStatus === "PUBLISHED" || eventStatus === "LIVE";

    // Use eventPlan from the parent (most up-to-date) if available,
    // otherwise fall back to the event details query.
    const plan = eventPlan ?? eventDetails?.data?.eventPlan ?? null;

    // On a DRAFT event: always free, payment happens at publish time.
    if (!isPublished) {
      dispatch(setView("start"));
      dispatch(setTemplate(null));
      setOpen(true);
      return;
    }

    // On a PUBLISHED/LIVE event:
    // - No plan at all → need to buy addon
    // - Plan exists but vibetagsEnabled is false → need to buy addon
    // - Plan covers this phase (vibetagPhases includes activeTiming) → free to create
    // - Plan exists but phase not covered → need to buy addon for this phase
    const phaseEnabled =
      plan?.vibetagsEnabled &&
      (plan.vibetagPhases?.includes(activeTiming) ||
        plan.vibetagPhases?.includes("BOTH"));

    if (!phaseEnabled) {
      setShowPaymentDialog(true);
      return;
    }

    // Phase is covered — open creator directly
    dispatch(setView("start"));
    dispatch(setTemplate(null));
    setOpen(true);
  };

  const { data, isLoading, refetch } = useGetVibeTagsQuery(
    { eventId },
    { skip: !eventId, refetchOnMountOrArgChange: true }
  );

  const { data: eventDetails, refetch: refetchEvent } = useGetEventDetailsQuery(
    eventId,
    { skip: !eventId }
  );
  const [initiateVibeTagAddon, { isLoading: isInitiatingPayment }] =
    useInitiateVibeTagAddonPaymentMutation();

  const allVibeTags: any[] = (data?.data ?? []).filter(
    (t: any) => t.eventId === eventId
  );

  const hasPreEvent = allVibeTags.some((t) => t.activityTiming === "PRE_EVENT");
  const hasDuringEvent = allVibeTags.some(
    (t) => t.activityTiming === "DURING_EVENT"
  );

  // "Both" covers PRE_EVENT + DURING_EVENT — if the user already has both
  // individual tags, creating a BOTH tag is redundant, so disable it.
  const isBothDisabled = hasPreEvent && hasDuringEvent;

  // Find the tag that matches the currently active timing exactly
  const existingTag =
    allVibeTags.find((t: any) => t.activityTiming === activeTiming) ?? null;

  const handleCreated = (meta?: { paymentRequired: boolean; vibeTagId?: string }) => {
    setOpen(false);
    refetch();
    refetchEvent();
    if (meta?.paymentRequired) {
      setPendingUnlockVibeTagId(meta.vibeTagId ?? null);
      setShowPaymentDialog(true);
    }
  };

  const handlePayForVibeTags = async (bundle: boolean) => {
    try {
      const res = await initiateVibeTagAddon({
        eventId,
        bundle,
        ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
        ...(pendingUnlockVibeTagId ? { vibeTagId: pendingUnlockVibeTagId } : {}),
      }).unwrap();

      const { status, checkoutUrl } = res.data;

      if (status === "COMPLETED" || !checkoutUrl) {
        toast.success("VibeTags unlocked! You can now create VibeTags.");
        setShowPaymentDialog(false);
        setCouponCode("");
        setPendingUnlockVibeTagId(null);
        refetchEvent();
        // Only open the creator if this was triggered from the "no plan yet" gate,
        // not from a post-creation unlock (where the tag already exists).
        if (!pendingUnlockVibeTagId) {
          dispatch(setView("start"));
          dispatch(setTemplate(null));
          setOpen(true);
        }
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to initiate VibeTags payment.");
    }
  };
  useEffect(() => {
    dispatch(setHideHeader(open));
    return () => {
      // Always restore header on unmount regardless of open state
      dispatch(setHideHeader(false));
    };
  }, [dispatch, open]);

  return (
    <>
      {/* Timing tabs */}
      <Tabs
        value={activeTiming}
        onValueChange={(v) => setActiveTiming(v as ActivityTiming)}
        className="mb-4"
      >
        <TabsList className="w-full grid grid-cols-4 h-9">
          {TIMING_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-[11px]">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Both tab — explain it's covered by the two individual tags */}
      {activeTiming === "BOTH" && isBothDisabled && (
        <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-2 mb-3">
          <Info className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
            You already have Pre-Event &amp; Main Event VibeTags — those cover
            both phases, so a separate <span className="font-medium">Both</span>{" "}
            tag isn&apos;t needed.
          </p>
        </div>
      )}

      {/* Plan quota banner — shown when this phase isn't covered by the plan */}
      {(() => {
        const plan = eventPlan ?? eventDetails?.data?.eventPlan ?? null;
        const eventStatus = eventDetails?.data?.status;
        const isPublished = eventStatus === "PUBLISHED" || eventStatus === "LIVE";
        if (!isPublished || !plan) return null;
        const phaseEnabled =
          plan.vibetagsEnabled &&
          (plan.vibetagPhases?.includes(activeTiming) || plan.vibetagPhases?.includes("BOTH"));
        if (phaseEnabled) return null;
        return (
          <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-2 mb-3">
            <Lock className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
              VibeTags for <span className="font-medium">{TIMING_TABS.find(t => t.value === activeTiming)?.label}</span> aren&apos;t included in your plan. Creating one will prompt a payment to unlock it.
            </p>
          </div>
        );
      })()}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : existingTag ? (
          /* ── Existing tag for this timing ── */
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="h-12 w-10 rounded-lg shrink-0 overflow-hidden bg-muted border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingTag.imageUrl}
                alt={existingTag.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate">
                  {existingTag.name}
                </h4>
                <Badge
                  variant="outline"
                  className="border-[#531342]/50 text-[#531342] text-[10px]"
                >
                  {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Applied to postcards for this phase
              </p>
            </div>
          </div>
        ) : (
          /* ── No tag yet for this timing ── */
          <>
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                No VibeTag for{" "}
                <span className="font-medium">
                  {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
                </span>{" "}
                yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Create one to stamp this phase&apos;s identity on every postcard
              </p>
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
              onClick={handleOpenCreate}
              disabled={activeTiming === "BOTH" && isBothDisabled}
            >
              <Tag className="h-3.5 w-3.5" />
              Create VibeTag for{" "}
              {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
            </Button>
          </>
        )}
      </div>

      {/* VibeTags Creator Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg h-screen overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>
              Create VibeTag —{" "}
              {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
            </DialogTitle>
          </DialogHeader>
          <Vibetags
            onClose={handleCreated}
            activityTiming={activeTiming}
            eventId={eventId}
            eventName={name}
          />
        </DialogContent>
      </Dialog>

      {/* VibeTags Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(v) => {
          setShowPaymentDialog(v);
          if (!v) { setCouponCode(""); setPendingUnlockVibeTagId(null); }
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              {pendingUnlockVibeTagId ? "Unlock This VibeTag" : "Unlock VibeTags"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {pendingUnlockVibeTagId
                ? "This VibeTag is over your plan quota. Pay to unlock it for attendees."
                : "Your event is published. To add VibeTags, choose a plan:"}
            </p>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3 px-4"
                onClick={() => handlePayForVibeTags(false)}
                disabled={isInitiatingPayment}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">Single Phase</p>
                  <p className="text-xs text-muted-foreground">
                    VibeTags for one phase
                  </p>
                </div>
                <p className="font-bold text-primary">
                  {isInitiatingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Pay Now"
                  )}
                </p>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3 px-4"
                onClick={() => handlePayForVibeTags(true)}
                disabled={isInitiatingPayment}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">Full Bundle</p>
                  <p className="text-xs text-muted-foreground">
                    VibeTags for both phases
                  </p>
                </div>
                <p className="font-bold text-primary">
                  {isInitiatingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Pay Now"
                  )}
                </p>
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Coupon Code (optional)
              </label>
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Pricing is based on your event tier. Payment opens inline.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VibeTagStudioContent;
