"use client";

import { useEffect, useState } from "react";
import { Lock, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SESSION_KEY_PREFIX = "private_event_access_";

interface PrivateEventGuardProps {
  eventId: string;
  eventName?: string;
  /** The correct access key from the already-fetched event payload */
  correctAccessKey: string;
  children: React.ReactNode;
}

/**
 * Wraps private event content. Compares the user's input directly against the
 * accessKey already present in the event API response — no extra round-trip needed.
 */
export function PrivateEventGuard({
  eventId,
  eventName,
  correctAccessKey,
  children,
}: PrivateEventGuardProps) {
  const sessionKey = `${SESSION_KEY_PREFIX}${eventId}`;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");

  // Restore from sessionStorage so the user doesn't re-type after a page refresh
  useEffect(() => {
    const cached = sessionStorage.getItem(sessionKey);
    if (cached && cached === correctAccessKey) setIsUnlocked(true);
  }, [sessionKey, correctAccessKey]);

  const handleVerify = () => {
    const trimmed = inputKey.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your access key.");
      return;
    }

    if (trimmed === correctAccessKey.toUpperCase()) {
      sessionStorage.setItem(sessionKey, trimmed);
      setIsUnlocked(true);
      toast.success("Access granted! Welcome to this private event.");
    } else {
      setError("Invalid access key. Please check and try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="relative min-h-screen w-full">
      {/* Blurred backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-sm brightness-50 opacity-50"
      >
        {children}
      </div>

      {/* Overlay modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl border border-border">
          {/* Icon + heading */}
          <div className="mb-5 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Private Event
              </h2>
              {eventName && (
                <p className="mt-0.5 text-sm font-medium text-primary truncate">
                  {eventName}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                This is a private event. Please enter your access key to view
                details and RSVP.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-3">
            <Input
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value.toUpperCase());
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="VIBE-XXXX"
              className={cn(
                "font-mono tracking-widest uppercase text-center h-12 text-base",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              maxLength={16}
              autoComplete="off"
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleVerify}
              disabled={!inputKey.trim()}
            >
              Unlock Event
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have a code? Contact the event organizer.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Organizer access-key display ─────────────────────────────────────────────

interface AccessKeyDisplayProps {
  accessKey: string;
  eventId: string;
  className?: string;
}

export function AccessKeyDisplay({
  accessKey,
  eventId,
  className,
}: AccessKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const eventUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${eventId}`
      : `/events/${eventId}`;

  const inviteText = `You're invited to a private event!\n\nEvent Link: ${eventUrl}\nAccess Key: ${accessKey}\n\nEnter the access key when prompted to view event details and RSVP.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      toast.success("Invite link & code copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground">
          Private Event Access Key
        </span>
      </div>

      <div className="rounded-lg border border-border bg-background px-4 py-3 text-center">
        <span className="font-mono text-xl font-bold tracking-widest text-primary select-all">
          {accessKey}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Share this key with your invited guests. Only people with this code can
        view event details and RSVP.
      </p>

      <Button
        variant="outline"
        className="w-full gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Invite Link &amp; Code
          </>
        )}
      </Button>
    </div>
  );
}
