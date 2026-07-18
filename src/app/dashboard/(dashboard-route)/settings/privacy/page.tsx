"use client";

/**
 * Privacy Preferences Page
 *
 * Allows users to manage their data and consent preferences as required by
 * the Nigeria Data Protection Act (NDPA) 2023.
 *
 * Features:
 *  - Location consent toggle (revoke or re-grant at any time)
 *  - Marketing communications opt-out
 *  - Delete account flow
 *  - Data request link
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Trash2,
  FileText,
  Shield,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RootState } from "@/app/provider/store";
import {
  setLocationConsent,
  setMarketingConsent,
  clearConsent,
} from "@/app/provider/slices/consent-slice";
import { clearLocation } from "@/app/provider/slices/location-slice";
import Link from "next/link";
import Cookies from "js-cookie";
import { useLogoutMutation } from "@/app/provider/api/authApi";

export default function PrivacyPreferencesPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const locationConsent = useSelector(
    (s: RootState) => s.consent.locationConsent
  );
  const marketingConsent = useSelector(
    (s: RootState) => s.consent.marketingConsent
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [logout] = useLogoutMutation();

  // ── Location toggle ───────────────────────────────────────────────────────
  const handleLocationToggle = (enabled: boolean) => {
    dispatch(setLocationConsent(enabled));
    if (!enabled) {
      dispatch(clearLocation());
      // Clear location on backend
      const token =
        document.cookie
          .split("; ")
          .find((r) => r.startsWith("accessToken="))
          ?.split("=")[1];
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ city: "", country: "" }),
        }).catch(() => {});
      }
      toast.success("Location data cleared.");
    } else {
      toast.success(
        "Location enabled. It will update next time you visit Events."
      );
    }
  };

  // ── Marketing toggle ──────────────────────────────────────────────────────
  const handleMarketingToggle = (enabled: boolean) => {
    dispatch(setMarketingConsent(enabled));
    toast.success(
      enabled
        ? "You'll now receive event recommendations and updates."
        : "You've opted out of marketing emails."
    );
  };

  // ── Account deletion ──────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirm.toLowerCase() !== "delete") return;
    setIsDeleting(true);
    try {
      const token =
        document.cookie
          .split("; ")
          .find((r) => r.startsWith("accessToken="))
          ?.split("=")[1];

      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || body?.error?.message || "Delete failed"
        );
      }

      // Clear all local state and cookies
      dispatch(clearConsent());
      dispatch(clearLocation());
      try { await logout().unwrap(); } catch { /* ignore */ }
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      toast.success("Your account has been deleted. We're sorry to see you go.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(
        err?.message || "Something went wrong. Please email privacy@nextvibe.app."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold">Privacy Preferences</h1>
            <p className="text-xs text-muted-foreground">
              NDPA 2023 compliant — you control your data
            </p>
          </div>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Info banner */}
        <div className="flex gap-3 rounded-xl bg-[#5B1A57]/5 border border-[#5B1A57]/15 p-4">
          <Shield className="h-5 w-5 text-[#5B1A57] shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Under the{" "}
            <strong className="text-foreground">
              Nigeria Data Protection Act 2023
            </strong>
            , you have the right to control how your data is used. Manage your
            preferences below or{" "}
            <a
              href="mailto:privacy@nextvibe.app"
              className="text-[#5B1A57] underline underline-offset-2"
            >
              contact us
            </a>{" "}
            to request a copy of your data.
          </p>
        </div>

        {/* Data consent settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            {/* Location */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Location (City & Country)</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    We use your city and country to show nearby events. We never
                    store precise coordinates.
                  </p>
                </div>
              </div>
              <Switch
                checked={locationConsent === true}
                onCheckedChange={handleLocationToggle}
                aria-label="Toggle location consent"
                className="shrink-0 data-[state=checked]:bg-[#5B1A57]"
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Marketing Communications</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Receive event recommendations, news, and updates from
                    NextVibe. You&apos;ll still get transactional emails (tickets,
                    RSVPs) regardless.
                  </p>
                </div>
              </div>
              <Switch
                checked={marketingConsent === true}
                onCheckedChange={handleMarketingToggle}
                aria-label="Toggle marketing consent"
                className="shrink-0 data-[state=checked]:bg-[#5B1A57]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data rights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Data Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <a
              href="mailto:privacy@nextvibe.app?subject=Data%20Request%20-%20NextVibe"
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Request My Data</p>
                  <p className="text-xs text-muted-foreground">
                    Get a copy of all data we hold on you
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>

            <Link
              href="/privacy"
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Privacy Policy</p>
                  <p className="text-xs text-muted-foreground">
                    How we collect, use, and protect your data
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Danger zone — account deletion */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 mb-4">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deleting your account is permanent. Your profile, events,
                postcards, and all data will be removed. Backups are purged
                within 30 days as per our Privacy Policy.
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Delete account confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Account</DialogTitle>
            </div>
            <DialogDescription className="leading-relaxed">
              This will permanently delete your account and all associated data.
              This action <strong>cannot be undone</strong>.
              <br />
              <br />
              Type{" "}
              <span className="font-mono font-semibold text-foreground">
                delete
              </span>{" "}
              to confirm.
            </DialogDescription>
          </DialogHeader>

          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "delete" to confirm'
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-destructive focus:ring-1 focus:ring-destructive"
            aria-label="Type delete to confirm account deletion"
          />

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirm("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleteConfirm.toLowerCase() !== "delete" || isDeleting
              }
              className="flex-1"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
