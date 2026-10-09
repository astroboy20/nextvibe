"use client";
import { apiErrorMessage } from "@/shared/lib/error-handler";

import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteAccountMutation,
  useGetDeletionCheckQuery,
} from "@/features/profile/api/users-api";

const CONFIRM_WORD = "DELETE";

/**
 * Delete account, as Apple and Google require it to be reachable in-app.
 *
 * The check runs when the dialog opens, so a blocked account (upcoming
 * events, unpaid earnings) is told why up front instead of failing on submit.
 */
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [needsFreshSignIn, setNeedsFreshSignIn] = useState(false);

  const { data: check, isFetching: checking } = useGetDeletionCheckQuery(
    undefined,
    { skip: !open, refetchOnMountOrArgChange: true }
  );
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  const blocked = !!check && !check.canDelete;
  const ready =
    !!check &&
    check.canDelete &&
    confirmText.trim().toUpperCase() === CONFIRM_WORD &&
    (!check.needsPassword || password.length > 0);

  const signOutTo = (path: string) => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    // Hard navigation, so no cached data from this account survives.
    window.location.href = path;
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(
        check?.needsPassword ? { password } : {}
      ).unwrap();
      toast.success("Your account has been deleted.");
      signOutTo("/");
    } catch (err: any) {
      const message: string =
        apiErrorMessage(err) ??
        "Could not delete your account. Please try again.";
      // OAuth-only accounts must have signed in recently; offer the way out.
      if (err?.status === 401 && !check?.needsPassword) {
        setNeedsFreshSignIn(true);
      }
      toast.error(typeof message === "string" ? message : "Could not delete your account.");
    }
  };

  const reset = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setPassword("");
      setConfirmText("");
      setNeedsFreshSignIn(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => reset(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete account
      </Button>

      <AlertDialog open={open} onOpenChange={reset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p>This can&apos;t be undone. We will delete:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>your profile, photo and sign-in details</li>
                  <li>your postcards, likes, comments and follows</li>
                  <li>RSVPs to upcoming events</li>
                </ul>
                <p>
                  Records of payments and tickets are kept for accounting, but
                  no longer show your name. You&apos;ll lose access to any
                  tickets in your account.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {checking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking your account…
            </div>
          )}

          {blocked && (
            <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" /> Not yet:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {check!.blockers.map((b) => (
                  <li key={b.code}>{b.message}</li>
                ))}
              </ul>
            </div>
          )}

          {check?.canDelete && (
            <div className="space-y-3">
              {check.needsPassword && (
                <Input
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              <Input
                placeholder={`Type ${CONFIRM_WORD} to confirm`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
              {needsFreshSignIn && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signOutTo("/auth/login?from=/settings")}
                >
                  Sign in again, then come back here
                </Button>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!ready || deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete my account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
