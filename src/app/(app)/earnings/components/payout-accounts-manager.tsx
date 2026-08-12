"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2, Trash2, Star, Landmark } from "lucide-react";
import { toast } from "sonner";
import {
  useGetPayoutAccountsQuery,
  useSetDefaultPayoutAccountMutation,
  useDeletePayoutAccountMutation,
  type PayoutAccount,
} from "@/app/provider/api/payoutApi";
import { cn } from "@/lib/utils";

interface Props {
  onAddAccount: () => void;
}

export function PayoutAccountsManager({ onAddAccount }: Props) {
  const { data, isLoading } = useGetPayoutAccountsQuery();
  const [setDefault, { isLoading: isSettingDefault }] =
    useSetDefaultPayoutAccountMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeletePayoutAccountMutation();

  const [pendingDelete, setPendingDelete] = useState<PayoutAccount | null>(null);

  const accounts = data?.data ?? [];

  const handleSetDefault = async (account: PayoutAccount) => {
    try {
      await setDefault(account.id).unwrap();
      toast.success(`Default ${account.currency} account updated`);
    } catch {
      toast.error("Couldn't update the default account");
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAccount(pendingDelete.id).unwrap();
      toast.success("Payout account removed");
      setPendingDelete(null);
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string }; message?: string } };
      // The backend blocks removal while a payout to this account is in flight.
      toast.error(
        e?.data?.error?.message ?? e?.data?.message ?? "Couldn't remove that account",
      );
      setPendingDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Payout accounts</h3>
              <p className="text-xs text-muted-foreground">
                Where we send your money
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={onAddAccount}>
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-6 text-center">
              <Landmark className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No payout accounts yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add one so we know where to send your earnings.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    account.isDefault
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-muted/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {account.label ?? account.railLabel}
                        </span>
                        {account.isDefault && (
                          <Badge variant="outline" className="gap-1 border-primary/30 text-[10px] text-primary">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Default
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {account.currency}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {account.maskedAccount}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {account.accountName} · {account.railLabel} · {account.country}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {!account.isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title="Make default"
                          disabled={isSettingDefault}
                          onClick={() => handleSetDefault(account)}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Remove"
                        onClick={() => setPendingDelete(account)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this payout account?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.maskedAccount} will no longer be available for new
              payouts. Payouts already sent to it stay in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Removing…
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
