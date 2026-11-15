"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLazyVerifyChristmasPaymentQuery } from "@/features/campaigns/api/campaign-api";

interface Props {
  paymentId: string;
}

export default function ChristmasVerify({ paymentId }: Props) {
  const cleanId = paymentId.split("?")[0];
  const [status, setStatus] = useState<"pending" | "completed" | "failed">(
    cleanId ? "pending" : "failed"
  );
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 20;

  const [triggerVerify] = useLazyVerifyChristmasPaymentQuery();

  useEffect(() => {
    if (!cleanId) {
      setStatus("failed");
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await triggerVerify(cleanId, false).unwrap();
        if (result.status === "completed") {
          setStatus("completed");
          sessionStorage.removeItem("xmas_paymentId");
          return;
        }
        if (result.status === "failed") {
          setStatus("failed");
          sessionStorage.removeItem("xmas_paymentId");
          return;
        }
        attemptsRef.current += 1;
        if (attemptsRef.current < MAX_ATTEMPTS) {
          timer = setTimeout(poll, 3000);
        } else {
          setStatus("failed");
        }
      } catch {
        attemptsRef.current += 1;
        if (attemptsRef.current < MAX_ATTEMPTS) {
          timer = setTimeout(poll, 3000);
        } else {
          setStatus("failed");
        }
      }
    };

    poll();
    return () => clearTimeout(timer);
  }, [cleanId, triggerVerify]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-10">
        <Image
          src="/logos/new/logo_black_text.png"
          alt="NextVibe"
          width={120}
          height={48}
          className="h-10 w-auto"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
      >
        {/* Pending */}
        {status === "pending" && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-border bg-secondary/40">
              <Loader2 className="size-7 animate-spin text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold">Confirming your payment</h1>
              <p className="mt-1.5 text-xs text-muted-foreground">
                This usually takes a few seconds. Please don&apos;t close this tab.
              </p>
            </div>
            <div className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-secondary/20 p-4">
              {[
                "Verifying with Bachs",
                "Reserving your Christmas spot",
                "Sending your XMAS- code by email",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-2.5">
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background"
                    }`}
                  >
                    {i === 0 ? (
                      <Loader2 className="size-2.5 animate-spin" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-border" />
                    )}
                  </div>
                  <p
                    className={`text-xs ${
                      i === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-base font-bold">Payment not confirmed</h1>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                We couldn&apos;t confirm your payment. If you were charged, check
                your email — your XMAS- code will arrive as soon as it clears.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5">
              <Button
                size="sm"
                className="w-full"
                onClick={() => (window.location.href = "/christmas")}
              >
                Try again
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/auth/register")}
              >
                Create my account anyway
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Need help?{" "}
              <a
                href="mailto:hello@mynextvibe.com"
                className="font-medium text-primary underline underline-offset-2"
              >
                hello@mynextvibe.com
              </a>
            </p>
          </div>
        )}

        {/* Completed */}
        {status === "completed" && (
          <div className="flex flex-col items-center gap-5 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/5"
            >
              <CheckCircle2 className="size-8 text-primary" />
            </motion.div>

            <div>
              <h1 className="text-lg font-bold">
                Your Christmas spot is secured! 🎄
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Your XMAS- redemption code has been sent to your email. Check
                your inbox and spam folder. Use it at the plan-payment step when
                you publish your event.
              </p>
            </div>

            <div className="w-full space-y-2.5 rounded-lg border border-border bg-secondary/20 p-4 text-left">
              <p className="text-xs font-semibold">What happens next?</p>
              {[
                "Check your email for your XMAS- redemption code",
                "Create your NextVibe account when you are ready",
                "Create your event and select MEGA_BUNDLE_FULL at the plan-payment step",
                "Enter the XMAS- code — your event publishes free",
              ].map((step) => (
                <div key={step} className="flex items-start gap-2">
                  <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-[8px] font-bold">✓</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <Button
                size="sm"
                className="w-full"
                onClick={() => (window.location.href = "/auth/register")}
              >
                Create my NextVibe account
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/christmas")}
              >
                Back to Christmas page
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        NextVibe · Secure checkout powered by Bachs
      </p>
    </div>
  );
}
