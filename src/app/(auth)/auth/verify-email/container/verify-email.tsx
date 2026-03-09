"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Mail,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/provider/slices/user";
import {
  useResendverificationEmailMutation,
  useVerifyEmailMutation,
} from "@/app/provider/api/authApi";

type VerificationStatus = "loading" | "success" | "expired" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "elementary221b@gmail.com";

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [countdown, setCountdown] = useState(5);
  const [verifyEmailMutation, { isLoading }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: resendLoading }] =
    useResendverificationEmailMutation();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) return;
      try {
        const res = await verifyEmailMutation(token).unwrap();
        dispatch(setUser({ ...res.data.user, token: res.data.token }));
        const redirectPath =
          localStorage.getItem("redirect_after_auth") || "/interests";

        router.push(redirectPath);

        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [dispatch, router, token, verifyEmailMutation]);

  async function handleRequestNewLink() {
    if (!token) return;
    await resendVerification(token).unwrap;
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-pink-50 to-purple-50">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {status === "loading" && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Loader2 size={32} className="text-purple-900 animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. Redirecting to
                dashboard in {countdown} seconds...
              </p>
              <Button
                className="w-full rounded-full bg-purple-900 text-white"
                onClick={() => router.push("/")}
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {(status === "expired" || status === "error") && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={32} className="text-amber-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {status === "expired" ? "Link Expired" : "Verification Failed"}
              </h1>
              <p className="text-gray-600 mb-6">
                {status === "expired"
                  ? "The verification link has expired or already been used."
                  : "We couldn't verify your email. Please try again."}
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full rounded-full bg-purple-900 text-white flex items-center justify-center gap-2"
                  onClick={handleRequestNewLink}
                >
                  <Mail size={16} />
                  Send New Verification Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-purple-900 text-purple-900"
                  onClick={() => router.push("/auth/login")}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
