"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useGetPayoutAccountsQuery,
  useRequestPayoutMutation,
  type CurrencyBalance,
} from "@/app/provider/api/payoutApi";
import { formatMoney, toNumber, getCurrencyDecimals } from "@/utils/money";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The currency balance being withdrawn from. */
  balance: CurrencyBalance | null;
  onAddAccount: () => void;
}

export function RequestPayoutDialog({
  open,
  onOpenChange,
  balance,
  onAddAccount,
}: Props) {
  const currency = balance?.currency ?? "";

  // Only accounts matching this currency can receive it — the backend rejects
  // a mismatch, so don't offer the choice in the first place.
  const { data: accountsData, isLoading: loadingAccounts } =
    useGetPayoutAccountsQuery({ currency }, { skip: !open || !currency });
  const [requestPayout, { isLoading: isSubmitting }] = useRequestPayoutMutation();

  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const accounts = useMemo(() => accountsData?.data ?? [], [accountsData]);
  const available = toNumber(balance?.available);

  /**
   * The default account is *derived*, not synced into state by an effect —
   * `accountId` only holds an explicit user choice. This avoids the cascading
   * render an effect-based "preselect" causes, and still preselects on first
   * paint once the accounts land.
   */
  const selectedAccountId =
    accountId ||
    (accounts.find((a) => a.isDefault) ?? accounts[0])?.id ||
    "";

  const resetForm = () => {
    setAmount("");
    setNotes("");
    setAccountId("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const requested = toNumber(amount);
  const exceedsBalance = requested > available;
  const canSubmit =
    !!selectedAccountId && requested > 0 && !exceedsBalance && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !balance) return;

    try {
      const result = await requestPayout({
        payoutAccountId: selectedAccountId,
        currency: balance.currency,
        amount: requested,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success(
        `Payout requested — ${result.data.reference}`,
        { description: "We'll review it and send the transfer shortly." },
      );
      handleOpenChange(false);
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string }; message?: string } };
      toast.error(
        e?.data?.error?.message ?? e?.data?.message ?? "Couldn't request that payout",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a payout</DialogTitle>
          <DialogDescription>
            {balance
              ? `${formatMoney(balance.available, balance.currency)} available`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {loadingAccounts ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                You don&apos;t have a {currency} payout account yet. Add one to
                withdraw this balance.
              </p>
            </div>
            <Button
              className="w-full gap-2 rounded-xl"
              onClick={() => {
                handleOpenChange(false);
                onAddAccount();
              }}
            >
              <Plus className="h-4 w-4" />
              Add a {currency} account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Send to</Label>
              <Select value={selectedAccountId} onValueChange={setAccountId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label ?? a.railLabel} — {a.maskedAccount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="text-xs font-medium">
                  Amount
                </Label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-primary hover:underline"
                  onClick={() => setAmount(String(available))}
                >
                  Withdraw all
                </button>
              </div>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step={1 / 10 ** getCurrencyDecimals(currency)}
                min={0}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl"
              />
              {exceedsBalance && (
                <p className="text-[11px] text-destructive">
                  That&apos;s more than your available balance of{" "}
                  {formatMoney(balance?.available, currency)}.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">
                Note (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Anything the reviewer should know"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
                maxLength={500}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">
                This amount is held as soon as you request it, so it won&apos;t
                show as available again unless the request is declined.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Requesting…
                  </>
                ) : (
                  "Request payout"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
