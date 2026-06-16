"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/app/provider/api/authApi";

type Step = "idle" | "loading" | "success";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [forgotPasswordMutation] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setStep("loading");
    try {
      await forgotPasswordMutation({ email });
      // Always show success regardless of outcome — prevents email enumeration
    } catch {
      // Intentionally swallowed — still show success
    } finally {
      setStep("success");
    }
  };

  if (step === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold text-gray-800">
            Check your inbox
          </h3>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a password reset link.
            It expires in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-[#5B1A57] hover:underline underline-offset-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-display text-lg font-semibold">
          Forgot your password?
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="email"
            placeholder="you@example.com"
            className="pl-10 h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            disabled={step === "loading"}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
          disabled={step === "loading"}
        >
          {step === "loading" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-[#5B1A57] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
};

export default ForgotPasswordForm;
