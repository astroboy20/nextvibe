"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLazyVerifyBirthdayPaymentQuery } from "@/app/provider/api/campaignApi";

export default function BirthdayVerify() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paymentId =
        searchParams.get("paymentId") ??
        (typeof window !== "undefined"
            ? localStorage.getItem("bday_paymentId")
            : null);

    const [status, setStatus] = useState<"pending" | "completed" | "failed">(
        paymentId ? "pending" : "failed"
    );
    const [code, setCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const attemptsRef = useRef(0);
    const MAX_ATTEMPTS = 10;

    const [triggerVerify] = useLazyVerifyBirthdayPaymentQuery();

    useEffect(() => {
        if (!paymentId) {
            setStatus("failed");
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            try {
                const result = await triggerVerify(paymentId, false).unwrap();
                if (result.status === "completed") {
                    setStatus("completed");
                    setCode(result.redemptionCode ?? null);
                    localStorage.removeItem("bday_paymentId");
                    return;
                }
                if (result.status === "failed") {
                    setStatus("failed");
                    localStorage.removeItem("bday_paymentId");
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
    }, [paymentId, triggerVerify]);

    const copyCode = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
            {/* Logo */}
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
                {/* ── Pending ── */}
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
                            {["Verifying with Ercaspay", "Reserving your spot", "Generating your code"].map(
                                (step, i) => (
                                    <div key={step} className="flex items-center gap-2.5">
                                        <div
                                            className={`flex size-4 shrink-0 items-center justify-center rounded-full ${i === 0
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
                                            className={`text-xs ${i === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                                }`}
                                        >
                                            {step}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* ── Failed ── */}
                {status === "failed" && (
                    <div className="flex flex-col items-center gap-5 py-6 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5">
                            <AlertCircle className="size-7 text-destructive" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold">Payment not confirmed</h1>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                We couldn&apos;t confirm your payment. If you were charged, check your email —
                                your confirmation and redemption code will be there.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-2.5">
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push("/birthday")}
                            >
                                Try again
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/auth/register")}
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

                {/* ── Completed ── */}
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
                            <h1 className="text-lg font-bold">Your spot is secured! 🎉</h1>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                Your deposit is confirmed. Save the redemption code below — you&apos;ll use it
                                to publish your event for free on NextVibe.
                            </p>
                        </div>

                        {code && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="w-full rounded-lg border border-primary/20 bg-primary/5 p-4"
                            >
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Your redemption code
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-lg font-bold tracking-widest text-primary">
                                        {code}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={copyCode}
                                    >
                                        {copied ? (
                                            <Check className="size-3.5" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                </div>
                                <p className="mt-2 text-[10px] text-muted-foreground">
                                    Also sent to your email — check your inbox and spam folder.
                                </p>
                            </motion.div>
                        )}

                        <div className="w-full space-y-2.5 rounded-lg border border-border bg-secondary/20 p-4 text-left">
                            <p className="text-xs font-semibold">What happens next?</p>
                            {[
                                "You'll receive a confirmation email with your code",
                                "Create your NextVibe account when you're ready",
                                "Use the code at checkout to publish your event free",
                                "We'll reach out to help you set up your VibeTag",
                            ].map((step) => (
                                <div key={step} className="flex items-start gap-2">
                                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Check className="size-2.5" />
                                    </div>
                                    <p className="text-xs leading-relaxed text-muted-foreground">{step}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex w-full flex-col gap-2.5">
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push("/auth/register")}
                            >
                                Create my NextVibe account
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/birthday")}
                            >
                                Back to birthday page
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            <p className="mt-6 text-center text-[10px] text-muted-foreground">
                NextVibe · Secure checkout powered by Ercaspay
            </p>
        </div>
    );
}
