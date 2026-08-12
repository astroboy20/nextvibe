"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Wallet } from "lucide-react";
import {
  useGetBalancesQuery,
  type CurrencyBalance,
} from "@/app/provider/api/payoutApi";
import { BalanceCard } from "./components/balance-card";
import { PayoutAccountsManager } from "./components/payout-accounts-manager";
import { PayoutHistory } from "./components/payout-history";
import { StatementList } from "./components/statement-list";
import { AddPayoutAccountDialog } from "./components/add-payout-account-dialog";
import { RequestPayoutDialog } from "./components/request-payout-dialog";

export default function EarningsPage() {
  const { data, isLoading, isError } = useGetBalancesQuery();

  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addAccountCurrency, setAddAccountCurrency] = useState<string | undefined>();
  const [payoutTarget, setPayoutTarget] = useState<CurrencyBalance | null>(null);

  const balances = data?.data ?? [];

  const openAddAccount = (currency?: string) => {
    setAddAccountCurrency(currency);
    setAddAccountOpen(true);
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Earnings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          What you&apos;ve made, and getting it paid out.
        </p>
      </div>

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="balance" className="rounded-lg text-xs">
            Balance
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-lg text-xs">
            Payouts
          </TabsTrigger>
          <TabsTrigger value="statement" className="rounded-lg text-xs">
            Statement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Couldn&apos;t load your balance. Pull down to try again.
            </p>
          ) : balances.length === 0 ? (
            <EmptyState
              title="No earnings yet"
              description="Once people buy tickets to your events, your balance shows up here."
              icon={<Wallet className="h-10 w-10 text-muted-foreground" />}
            />
          ) : (
            <>
              {/* One card per currency — deliberately never totalled together. */}
              {balances.map((balance) => (
                <BalanceCard
                  key={balance.currency}
                  balance={balance}
                  onRequestPayout={setPayoutTarget}
                />
              ))}
              {balances.length > 1 && (
                <p className="px-1 text-[11px] text-muted-foreground">
                  Balances are kept separate per currency and paid out separately.
                </p>
              )}
            </>
          )}

          <PayoutAccountsManager onAddAccount={() => openAddAccount()} />
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <PayoutHistory />
        </TabsContent>

        <TabsContent value="statement" className="mt-4">
          <StatementList />
        </TabsContent>
      </Tabs>

      <AddPayoutAccountDialog
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        defaultCurrency={addAccountCurrency}
      />

      <RequestPayoutDialog
        open={!!payoutTarget}
        onOpenChange={(open) => !open && setPayoutTarget(null)}
        balance={payoutTarget}
        onAddAccount={() => openAddAccount(payoutTarget?.currency)}
      />
    </div>
  );
}
