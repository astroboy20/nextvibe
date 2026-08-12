"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Lock, ArrowUpRight, Wallet } from "lucide-react";
import { formatMoney, isPositive } from "@/utils/money";
import type { CurrencyBalance } from "@/app/provider/api/payoutApi";

interface Props {
  balance: CurrencyBalance;
  onRequestPayout: (balance: CurrencyBalance) => void;
}

/**
 * One card per currency.
 *
 * Deliberately never combined into a single "total" — there is no correct way
 * to add ₦100,000 and $100, and showing one number would mean silently picking
 * an exchange rate that changes hourly.
 */
export function BalanceCard({ balance, onRequestPayout }: Props) {
  const canWithdraw = isPositive(balance.available);
  const hasPending = isPositive(balance.pending);
  const hasReserved = isPositive(balance.reserved);

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {balance.currency} available
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
              {formatMoney(balance.available, balance.currency)}
            </p>
          </div>
        </div>

        {/* Pending and reserved explain why "available" may be less than what
            the organizer thinks they earned. Only shown when non-zero. */}
        {(hasPending || hasReserved) && (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3">
            {hasPending && (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Pending</span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {formatMoney(balance.pending, balance.currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Becomes available once those events end
                  </p>
                </div>
              </div>
            )}

            {hasReserved && (
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Being paid out</span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {formatMoney(balance.reserved, balance.currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Held for a payout you&apos;ve already requested
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>
            Earned all time:{" "}
            <span className="font-medium text-foreground">
              {formatMoney(balance.lifetimeEarned, balance.currency)}
            </span>
          </span>
          <span>
            Paid out:{" "}
            <span className="font-medium text-foreground">
              {formatMoney(balance.paidOut, balance.currency)}
            </span>
          </span>
        </div>

        <Button
          className="w-full gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={!canWithdraw}
          onClick={() => onRequestPayout(balance)}
        >
          <ArrowUpRight className="h-4 w-4" />
          {canWithdraw
            ? `Withdraw ${balance.currency}`
            : "Nothing available yet"}
        </Button>
      </CardContent>
    </Card>
  );
}
