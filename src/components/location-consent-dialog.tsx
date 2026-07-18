"use client";

/**
 * LocationConsentDialog
 *
 * NDPC/NDPA 2023 compliant consent prompt for location access.
 *
 * Shown once before the browser geolocation API is triggered.
 * We only collect city and country — not precise coordinates.
 * The user can accept, decline, or enter their city manually.
 */

import { useState } from "react";
import { useDispatch } from "react-redux";
import { MapPin, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setLocationConsent } from "@/app/provider/slices/consent-slice";
import { setLocation, setLocationSynced } from "@/app/provider/slices/location-slice";
import Link from "next/link";

interface LocationConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LocationConsentDialog({
  open,
  onAccept,
  onDecline,
}: LocationConsentDialogProps) {
  const dispatch = useDispatch();
  const [showManual, setShowManual] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const handleAccept = () => {
    dispatch(setLocationConsent(true));
    onAccept();
  };

  const handleDecline = () => {
    dispatch(setLocationConsent(false));
    onDecline();
  };

  const handleManualSubmit = () => {
    if (!city.trim() && !country.trim()) return;
    dispatch(setLocationConsent(true));
    dispatch(setLocation({ city: city.trim(), country: country.trim() }));
    dispatch(setLocationSynced(true));

    // Sync to backend
    const token =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith("accessToken="))
            ?.split("=")[1]
        : undefined;

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ city: city.trim(), country: country.trim() }),
      }).catch(() => {});
    }

    onDecline(); // close dialog without triggering geolocation
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleDecline()}>
      <DialogContent className="max-w-sm rounded-2xl p-0 gap-0 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#5B1A57] to-[#8B2E84]" />

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B1A57]/10">
                <MapPin className="h-5 w-5 text-[#5B1A57]" />
              </div>
              <DialogTitle className="text-lg font-bold leading-tight">
                Allow Location Access
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              We use your <strong className="text-foreground">city and country</strong> to show
              events near you and help organisers understand their audience.
              <br />
              <br />
              We only collect your general area — never your precise address or
              exact coordinates. You can change this any time in{" "}
              <Link href="/settings/privacy" className="text-[#5B1A57] underline underline-offset-2">
                Privacy Settings
              </Link>
              .
            </DialogDescription>
          </DialogHeader>

          {!showManual ? (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAccept}
                className="w-full bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-xl h-11"
              >
                Allow location access
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManual(true)}
                className="w-full rounded-xl h-11"
              >
                Enter city manually
              </Button>
              <button
                onClick={handleDecline}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
              >
                Not now
              </button>
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                By allowing, you agree to our{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                . Compliant with the Nigeria Data Protection Act 2023.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter your city and country so we can personalise your event feed.
              </p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="consent-city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="consent-city"
                    placeholder="e.g. Lagos"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="consent-country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Input
                    id="consent-country"
                    placeholder="e.g. Nigeria"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 h-10 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowManual(false)}
                  className="flex-1 rounded-xl h-10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={!city.trim() && !country.trim()}
                  className="flex-1 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-xl h-10"
                >
                  Save location
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
