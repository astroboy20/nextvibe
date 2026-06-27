/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Ticket,
  Download,
  ArrowLeft,
  Loader2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useGetPurchaseSummaryQuery } from "@/app/provider/api/paymentApi";
import { cn } from "@/lib/utils";

const formatNgn = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED")
    return (
      <Badge className="gap-1.5 bg-green-500/10 text-green-700 border-green-500/30">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Payment Confirmed
      </Badge>
    );
  if (status === "FAILED")
    return (
      <Badge className="gap-1.5 bg-destructive/10 text-destructive border-destructive/30">
        <XCircle className="h-3.5 w-3.5" />
        Payment Failed
      </Badge>
    );
  return (
    <Badge className="gap-1.5 bg-amber-500/10 text-amber-700 border-amber-500/30">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </Badge>
  );
}

export default function PurchaseConfirmation({
  purchaseId,
}: {
  purchaseId: string;
}) {
  const router = useRouter();
  const pollCount = useRef(0);

  const { data, isLoading, error, refetch } = useGetPurchaseSummaryQuery(
    purchaseId,
    { skip: !purchaseId }
  );

  const summary = data?.data;

  // Poll while payment is still PENDING (up to ~30s)
  useEffect(() => {
    if (!summary || summary.paymentStatus !== "PENDING") return;
    if (pollCount.current >= 15) return; // max 15 polls × 2s = 30s
    const timer = setTimeout(() => {
      pollCount.current += 1;
      refetch();
    }, 2000);
    return () => clearTimeout(timer);
  }, [summary, refetch]);

  const handleShare = async () => {
    const text = `I just got tickets to ${summary?.event.name} on NextVibe! 🎉`;
    if (navigator.share) {
      await navigator.share({ title: summary?.event.name, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      toast.success("Copied to clipboard!");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !summary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Purchase not found</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          We couldn&apos;t find this purchase. It may have expired or the ID is
          incorrect.
        </p>
        <Button variant="outline" asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  const isPending = summary.paymentStatus === "PENDING";
  const isCompleted = summary.paymentStatus === "COMPLETED";
  const isFailed = summary.paymentStatus === "FAILED";

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" asChild>
          <Link href={`/events/${summary.event.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </Link>
        </Button>

        {/* Status header */}
        <div
          className={cn(
            "rounded-2xl p-6 text-center space-y-3 border",
            isCompleted && "bg-green-500/5 border-green-500/20",
            isFailed && "bg-destructive/5 border-destructive/20",
            isPending && "bg-amber-500/5 border-amber-500/20"
          )}
        >
          {isPending ? (
            <Loader2 className="h-12 w-12 mx-auto text-amber-500 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
          )}

          <div>
            <h1 className="text-xl font-bold">
              {isPending
                ? "Confirming payment…"
                : isCompleted
                ? "You're going! 🎉"
                : "Payment failed"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isPending
                ? "This usually takes a few seconds."
                : isCompleted
                ? `Tickets sent to ${summary.customerName}`
                : "Please try purchasing again."}
            </p>
          </div>

          <StatusBadge status={summary.paymentStatus} />

          {isCompleted && summary.paidAt && (
            <p className="text-xs text-muted-foreground">
              Paid {format(new Date(summary.paidAt), "PPP 'at' p")}
            </p>
          )}
        </div>

        {/* Event card */}
        <div className="rounded-2xl border border-border overflow-hidden">
          {summary.event.flierUrl && (
            <img
              src={summary.event.flierUrl}
              alt={summary.event.name}
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-4 space-y-3">
            <h2 className="font-semibold text-lg leading-snug">
              {summary.event.name}
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {format(new Date(summary.event.startsAt), "EEEE, MMMM d yyyy")}
                  {" · "}
                  {format(new Date(summary.event.startsAt), "h:mm a")}
                  {summary.event.endsAt && (
                    <>{" – "}{format(new Date(summary.event.endsAt), "h:mm a")}</>
                  )}
                </span>
              </div>
              {summary.event.locationName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>{summary.event.locationName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {summary.tickets.length} ticket{summary.tickets.length !== 1 ? "s" : ""}
              </span>
              <span className="font-semibold">
                {formatNgn(summary.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Tickets */}
        {isCompleted && summary.tickets.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Your Tickets
            </h3>
            {summary.tickets.map((ticket, i) => (
              <div
                key={ticket.ticketNumber}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Ticket header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Ticket className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {ticket.tierName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {ticket.ticketNumber}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      ticket.status === "VALID" &&
                        "border-green-500/40 text-green-600 bg-green-500/5"
                    )}
                  >
                    {ticket.status}
                  </Badge>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 px-4 py-5">
                  {ticket.qrCode ? (
                    <img
                      src={ticket.qrCode}
                      alt={`QR for ${ticket.ticketNumber}`}
                      className="w-44 h-44 rounded-xl border border-border"
                    />
                  ) : (
                    <div className="w-44 h-44 rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                      QR unavailable
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Show this QR at the door. Ticket #{i + 1} of {summary.tickets.length}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Failed state CTA */}
        {isFailed && (
          <Button
            className="w-full"
            onClick={() => router.push(`/events/${summary.event.id}`)}
          >
            Try Again
          </Button>
        )}

        {/* Actions */}
        {isCompleted && (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/profile">
                <Download className="h-4 w-4" />
                My Tickets
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
