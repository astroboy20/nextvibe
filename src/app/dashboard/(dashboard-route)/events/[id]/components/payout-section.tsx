"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, ArrowRight, Clock, Loader2 } from "lucide-react";
import { useGetBalancesQuery } from "@/app/provider/api/payoutApi";
import { formatMoney, isPositive } from "@/utils/money";

interface PayoutSectionProps {
  /** Ticket tier data, for this event's own sales figure. */
  ticketTiers?: { price: number; quantitySold?: number; currency?: string }[];
}

/**
 * Event-level earnings summary.
 *
 * Replaces the old per-event withdrawal form. Payouts are now made from an
 * organizer-wide balance rather than per event, because the old flow recomputed
 * "your revenue" from scratch on every request and never subtracted what had
 * already been paid — so the same money could be requested repeatedly.
 *
 * Bank details are no longer typed in here either; they're saved payout
 * accounts, entered once on the Earnings page.
 */
export function PayoutSection({ ticketTiers = [] }: PayoutSectionProps) {
  const { data, isLoading } = useGetBalancesQuery();

  const balances = data?.data ?? [];

  // This event's own gross sales, for context only. The authoritative
  // withdrawable figure is the balance, which the server computes.
  const eventCurrency = ticketTiers[0]?.currency ?? "NGN";
  const eventRevenue = ticketTiers.reduce(
    (sum, tier) => sum + tier.price * (tier.quantitySold ?? 0),
    0,
  );

  const matchingBalance = balances.find((b) => b.currency === eventCurrency);
  const hasAvailable = isPositive(matchingBalance?.available);
  const hasPending = isPositive(matchingBalance?.pending);

  return (
    <Card className="border-primary/20">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Banknote className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">Ticket revenue</h3>
            <p className="text-xs text-muted-foreground">
              This event&apos;s ticket sales
            </p>
          </div>
          {eventRevenue > 0 && (
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {formatMoney(eventRevenue, eventCurrency)}
              </p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Available to withdraw
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatMoney(matchingBalance?.available ?? 0, eventCurrency)}
              </span>
            </div>

            {hasPending && (
              <div className="flex items-start gap-1.5 border-t border-border pt-2">
                <Clock className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                <p className="text-[11px] text-muted-foreground">
                  {formatMoney(matchingBalance?.pending, eventCurrency)} becomes
                  available once your events have ended.
                </p>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              Your balance covers all your events, not just this one.
            </p>
          </div>
        )}

        <Button
          asChild
          className="w-full gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Link href="/dashboard/earnings">
            {hasAvailable ? "Withdraw earnings" : "View earnings"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {!hasAvailable && !hasPending && !isLoading && (
          <Badge variant="outline" className="w-full justify-center py-1.5 text-[11px]">
            Nothing available to withdraw yet
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
