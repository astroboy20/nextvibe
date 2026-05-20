"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLazyVerifyOrganizerPaymentQuery } from "@/app/provider/api/organizerPaymentApi";

type PollState = "polling" | "success" | "failed" | "timeout" | "missing";

const REDIRECT_DELAY = 3; // seconds before auto-redirect on success

export default function OrganizerPaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");

  const [pollState, setPollState] = useState<PollState>(
    paymentId ? "polling" : "missing"
  );
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  // Incrementing this re-triggers the polling effect (used by "Check again")
  const [retryKey, setRetryKey] = useState(0);

  const [verifyPayment] = useLazyVerifyOrganizerPaymentQuery();
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Polling effect
  useEffect(() => {
    if (!paymentId) return;

    const poll = async () => {
      if (attemptRef.current >= 10) {
        setPollState("timeout");
        return;
      }

      attemptRef.current += 1;

      try {
        const res = await verifyPayment(paymentId).unwrap();
        const status = res.data.status;

        if (status === "completed") {
          setPollState("success");
          return;
        }

        if (status === "failed") {
          setPollState("failed");
          return;
        }

        timerRef.current = setTimeout(poll, 2000);
      } catch {
        timerRef.current = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // retryKey is intentionally included so "Check again" restarts polling
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, verifyPayment, retryKey]);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (pollState !== "success") return;

    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [pollState, countdown, router]);

  if (pollState === "missing") {
    return (
      <VerifyShell
        icon="error"
        title="Invalid link"
        description="No payment ID found in the URL."
      />
    );
  }

  if (pollState === "polling") {
    return (
      <VerifyShell
        icon="loading"
        title="Confirming your payment…"
        description="Please wait while we verify your payment. This usually takes a few seconds."
      />
    );
  }

  if (pollState === "success") {
    return (
      <VerifyShell
        icon="success"
        title="Payment confirmed!"
        description="Your event has been published and is now live."
      >
        <p className="text-xs text-muted-foreground mt-4">
          Redirecting to dashboard in {countdown}s…
        </p>
        <Button
          className="mt-2 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard now
        </Button>
      </VerifyShell>
    );
  }

  if (pollState === "failed") {
    return (
      <VerifyShell
        icon="error"
        title="Payment failed"
        description="Your payment could not be processed. No charge was made."
      >
        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          onClick={() => router.back()}
        >
          Try again
        </Button>
      </VerifyShell>
    );
  }

  // timeout
  return (
    <VerifyShell
      icon="timeout"
      title="Taking longer than expected"
      description="We couldn't confirm your payment yet. If you completed payment, it may still be processing."
    >
      <Button
        variant="outline"
        className="mt-6 gap-2 rounded-xl"
        onClick={() => {
          attemptRef.current = 0;
          setCountdown(REDIRECT_DELAY);
          setPollState("polling");
          setRetryKey((k) => k + 1);
        }}
      >
        <RefreshCw className="h-4 w-4" />
        Check again
      </Button>
    </VerifyShell>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function VerifyShell({
  icon,
  title,
  description,
  children,
}: {
  icon: "loading" | "success" | "error" | "timeout";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-3">
        <Icon type={icon} />
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </div>
  );
}

function Icon({ type }: { type: "loading" | "success" | "error" | "timeout" }) {
  if (type === "loading") {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (type === "success") {
    return (
      <div className="flex justify-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
    </div>
  );
}
