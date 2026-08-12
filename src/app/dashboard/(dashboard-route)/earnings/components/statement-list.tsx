"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  ScrollText,
  Clock,
} from "lucide-react";
import { useGetStatementQuery, type LedgerEntryType } from "@/app/provider/api/payoutApi";
import { formatMoney } from "@/utils/money";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

/** Plain-English label for each ledger entry type. */
const ENTRY_LABEL: Record<LedgerEntryType, string> = {
  TICKET_SALE: "Ticket sale",
  TICKET_REFUND: "Refund",
  PROVIDER_FEE: "Processing fee",
  PAYOUT_RESERVED: "Payout requested",
  PAYOUT_REVERSED: "Payout returned",
  ADJUSTMENT_CREDIT: "Adjustment",
  ADJUSTMENT_DEBIT: "Adjustment",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

interface Props {
  currency?: string;
}

export function StatementList({ currency }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetStatementQuery({
    currency,
    page,
    limit: PAGE_SIZE,
  });

  const entries = data?.data?.entries ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Statement</h3>
            <p className="text-xs text-muted-foreground">
              Every movement of your money
            </p>
          </div>
          {pagination && pagination.total > 0 && (
            <span className="text-xs text-muted-foreground">
              {pagination.total} entries
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-6 text-center">
            <ScrollText className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Nothing here yet
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ticket sales and payouts will appear here as they happen.
            </p>
          </div>
        ) : (
          <div className={cn("divide-y divide-border", isFetching && "opacity-60")}>
            {entries.map((entry) => {
              const isCredit = entry.direction === "CREDIT";
              // A credit that hasn't matured yet isn't spendable — mark it so
              // the organizer understands why their available balance is lower.
              const isHeld =
                isCredit &&
                !!entry.availableAt &&
                new Date(entry.availableAt) > new Date();

              return (
                <div key={entry.id} className="flex items-start gap-3 py-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      isCredit
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {ENTRY_LABEL[entry.type] ?? entry.type}
                      </p>
                      <p
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          isCredit ? "text-emerald-600" : "text-foreground",
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {formatMoney(entry.amount, entry.currency)}
                      </p>
                    </div>

                    {entry.description && (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {entry.description}
                      </p>
                    )}

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </span>
                      {isHeld && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                          <Clock className="h-3 w-3" />
                          Available after the event
                        </span>
                      )}
                      {entry.payout && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {entry.payout.reference}
                        </span>
                      )}
                    </div>
                  </div>
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
