"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useResendverificationEmailMutation } from "@/app/provider/api/authApi";

const COOLDOWN_SECONDS = 60;

export default function CheckVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId") ?? "";
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";

  const [cooldown, setCooldown] = useState(0);

  const [resendVerification, { isLoading }] =
    useResendverificationEmailMutation();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    const body = { userId, email, name };
    try {
      await resendVerification(body).unwrap();
      toast.success("A new verification link has been sent to your inbox.");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-5">
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <CardContent className="pt-8 pb-7 px-7 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#FFEBEB] flex items-center justify-center mb-6">
              <Mail className="w-9 h-9 text-[#5B1A57]" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              We&apos;ve sent a verification link to{" "}
              <span className="font-semibold text-gray-700">{email}</span>.
              Please check your inbox and click the link to verify your email
              address.
            </p>

            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={handleResend}
                disabled={isLoading || cooldown > 0}
                className="w-full h-11 rounded-lg bg-[#5B1A57] hover:bg-[#4a1446] text-white font-medium transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend available in ${cooldown}s`
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Resend Verification Email
                  </span>
                )}
              </Button>
            </div>

            <div className="w-full mt-7 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                If you don&apos;t see the email in your inbox, check your spam
                folder or try resending the verification email.
              </p>
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-[#5B1A57] hover:text-[#4a1446] hover:bg-transparent font-medium text-sm gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-400">
          Need help?{" "}
          <a
            href="mailto:hi@nextvibe.com"
            className="text-[#5B1A57] underline underline-offset-2 hover:text-[#4a1446] transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
