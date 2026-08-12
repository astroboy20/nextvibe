"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { useState } from "react";
import { useGetMyPayoutsQuery } from "@/app/provider/api/payoutApi";
import { PAYOUT_STATUS_CONFIG } from "./payout-status";
import { formatMoney } from "@/utils/money";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function PayoutHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetMyPayoutsQuery({
    page,
    limit: PAGE_SIZE,
  });

  const payouts = data?.data?.payouts ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Payouts</h3>
          {pagination && pagination.total > 0 && (
            <span className="text-xs text-muted-foreground">
              {pagination.total} total
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-6 text-center">
            <Receipt className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">No payouts yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your withdrawal requests will show up here.
            </p>
          </div>
        ) : (
          <div className={cn("space-y-2", isFetching && "opacity-60")}>
            {payouts.map((payout) => {
              const cfg = PAYOUT_STATUS_CONFIG[payout.status];
              return (
                <div
                  key={payout.id}
                  className="space-y-2 rounded-xl border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {formatMoney(payout.amount, payout.currency)}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {payout.reference}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 gap-1 text-[10px]", cfg.className)}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="space-y-0.5 text-[11px] text-muted-foreground">
                    <p>
                      To {payout.destination.accountName}
                      {payout.destination.maskedAccount
                        ? ` · ${payout.destination.maskedAccount}`
                        : ""}
                    </p>
                    {payout.event && <p>Event: {payout.event.name}</p>}
                    <p>Requested {formatDate(payout.requestedAt)}</p>
                    {payout.paidAt && <p>Sent {formatDate(payout.paidAt)}</p>}
                    {payout.externalReference && (
                      <p>
                        Bank ref:{" "}
                        <span className="font-mono text-foreground/80">
                          {payout.externalReference}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Only surface the explanation when something went wrong —
                      a successful payout doesn't need a paragraph. */}
                  {(payout.status === "REJECTED" || payout.status === "FAILED") &&
                    payout.failureReason && (
                      <p className="rounded-lg bg-destructive/5 p-2 text-[11px] text-destructive">
                        {payout.failureReason}
                      </p>
                    )}

                  {payout.status === "PAID" && (
                    <p className="text-[11px] text-muted-foreground">
                      {cfg.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1.5">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={page === 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
