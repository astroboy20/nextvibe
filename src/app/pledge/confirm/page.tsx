"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  ArrowLeft,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLazyVerifyPledgeQuery } from "@/app/provider/api/pledgeApi";

const formatNgn = (v: string | number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(v));

export default function PledgeConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pollCount = useRef(0);

  // pledgeId can come from URL param or sessionStorage (set before redirect)
  const pledgeIdFromUrl = searchParams.get("pledgeId");
  const [pledgeId] = useState(
    () =>
      pledgeIdFromUrl ??
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pendingPledgeId")
        : null) ??
      ""
  );

  const [trigger, { data: statusData, isLoading, error }] =
    useLazyVerifyPledgeQuery();

  const status = statusData?.status;
  const pledge = statusData?.pledge;

  // Initial fetch + poll while PENDING
  useEffect(() => {
    if (!pledgeId) return;
    trigger(pledgeId);
  }, [pledgeId, trigger]);

  useEffect(() => {
    if (!status || status !== "PENDING") return;
    if (pollCount.current >= 15) return;
    const timer = setTimeout(() => {
      pollCount.current += 1;
      trigger(pledgeId);
    }, 2000);
    return () => clearTimeout(timer);
  }, [status, pledgeId, trigger]);

  // Clear sessionStorage once confirmed
  useEffect(() => {
    if (status === "COMPLETED" && typeof window !== "undefined") {
      sessionStorage.removeItem("pendingPledgeId");
    }
  }, [status]);

  const handleShare = async () => {
    const text = `I just backed NextVibe as a ${
      pledge?.tierName ?? "supporter"
    }! 🚀 Join the movement.`;
    if (navigator.share) {
      await navigator
        .share({
          title: "I backed NextVibe!",
          text,
          url: "https://nextvibe.co/pledge",
        })
        .catch(() => {});
    } else {
      await navigator.clipboard
        .writeText(`${text} https://nextvibe.co/pledge`)
        .catch(() => {});
      toast.success("Copied to clipboard!");
    }
  };

  if (!pledgeId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">No pledge found</h1>
        <Button asChild variant="outline">
          <Link href="/pledge">Back to Pledge</Link>
        </Button>
      </div>
    );
  }

  if (isLoading && !statusData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED" || status === "EXPIRED";
  const isPending = !status || status === "PENDING";

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-background px-4 py-10 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 text-muted-foreground"
            asChild
          >
            <Link href="/pledge">
              <ArrowLeft className="h-4 w-4" />
              Back to pledge page
            </Link>
          </Button>

          {/* Status card */}
          <div
            className={cn(
              "rounded-2xl p-8 text-center space-y-4 border",
              isCompleted && "bg-primary/5 border-primary/20",
              isFailed && "bg-destructive/5 border-destructive/20",
              isPending && "bg-amber-500/5 border-amber-500/20"
            )}
          >
            {isPending ? (
              <Loader2 className="h-14 w-14 mx-auto text-amber-500 animate-spin" />
            ) : isCompleted ? (
              <div className="relative inline-block">
                <CheckCircle2 className="h-14 w-14 mx-auto text-primary" />
                <Sparkles className="absolute -top-1 -right-2 h-5 w-5 text-yellow-400" />
              </div>
            ) : (
              <XCircle className="h-14 w-14 mx-auto text-destructive" />
            )}

            <div>
              <h1 className="text-2xl font-bold">
                {isPending
                  ? "Confirming your pledge…"
                  : isCompleted
                  ? "You're a backer! 🎉"
                  : "Pledge failed"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {isPending
                  ? "Hang tight, this usually takes a few seconds."
                  : isCompleted
                  ? "Thank you for believing in NextVibe. You're part of the story."
                  : "Something went wrong. Please try again."}
              </p>
            </div>

            {/* Status badge */}
            <div className="flex justify-center">
              {isCompleted && (
                <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/30">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  Pledge Confirmed
                </Badge>
              )}
              {isFailed && (
                <Badge className="gap-1.5 bg-destructive/10 text-destructive border-destructive/30">
                  <XCircle className="h-3.5 w-3.5" />
                  {status === "EXPIRED" ? "Expired" : "Failed"}
                </Badge>
              )}
              {isPending && (
                <Badge className="gap-1.5 bg-amber-500/10 text-amber-700 border-amber-500/30">
                  <Clock className="h-3.5 w-3.5" />
                  Processing
                </Badge>
              )}
            </div>
          </div>

          {/* Pledge details */}
          {isCompleted && pledge && (
            <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">Tier</span>
                <span className="font-semibold text-sm">{pledge.tierName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="font-semibold text-sm">{pledge.quantity}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">
                  Amount (USD)
                </span>
                <span className="font-semibold text-sm">
                  ${Number(pledge.totalUsd).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">
                  Amount (NGN)
                </span>
                <span className="font-semibold text-sm">
                  {formatNgn(pledge.totalNgn)}
                </span>
              </div>
              {pledge.paidAt && (
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">Paid at</span>
                  <span className="font-semibold text-sm">
                    {format(new Date(pledge.paidAt), "PPP 'at' p")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {isCompleted && (
            <div className="space-y-3">
              <Button className="w-full gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share with friends
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
          )}

          {isFailed && (
            <Button className="w-full" onClick={() => router.push("/pledge")}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Suspense>
  );
}
