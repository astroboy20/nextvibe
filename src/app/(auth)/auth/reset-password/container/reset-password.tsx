"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/app/provider/api/authApi";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

type Step = "idle" | "loading" | "success" | "error:expired" | "error:no-token";

// Simple show/hide password input — avoids coupling to the register-specific PasswordField
function PasswordInput({
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete="new-password"
        className="h-11 rounded-lg border-gray-300 pr-10 focus-visible:ring-[#5B1A57]"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("idle");
  const [resetPasswordMutation] = useResetPasswordMutation();

  // Read token from URL once on mount, then remove it from the address bar
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setStep("error:no-token");
      return;
    }

    setToken(t);
    // Clear token from URL bar — prevents reuse attempts from browser history
    window.history.replaceState({}, document.title, "/auth/reset-password");
  }, []);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setStep("error:no-token");
      return;
    }

    setStep("loading");
    try {
      await resetPasswordMutation({
        token,
        newPassword: values.newPassword,
      }).unwrap();

      setStep("success");
      // Redirect to login with success flag after 3 seconds
      setTimeout(() => {
        router.push("/auth/login?reset=success");
      }, 3000);
    } catch (error: any) {
      const status = error?.status ?? error?.data?.statusCode;
      if (status === 400) {
        setStep("error:expired");
      } else {
        // Reset back to idle so they can try again
        setStep("idle");
        form.setError("root", {
          message: "Something went wrong. Please try again.",
        });
      }
    }
  };

  // ── No token in URL ───────────────────────────────────────────────────────
  if (step === "error:no-token") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold text-gray-800">
            Invalid reset link
          </h3>
          <p className="text-sm text-muted-foreground">
            This link is missing a reset token. It may have been copied incorrectly.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#5B1A57] hover:underline underline-offset-2"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  // ── Expired / already used token ────────────────────────────────────────
  if (step === "error:expired") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold text-gray-800">
            This link has expired
          </h3>
          <p className="text-sm text-muted-foreground">
            Password reset links are only valid for 1 hour. Please request a new one.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#5B1A57] hover:underline underline-offset-2"
        >
          Request a new reset link →
        </Link>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
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
            Password updated!
          </h3>
          <p className="text-sm text-muted-foreground">
            Your password has been reset successfully. All your other sessions have been
            logged out.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  // ── Idle / loading — show the form ────────────────────────────────────────
  const isSubmitting = step === "loading";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-display text-lg font-semibold">
          Reset your password
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  New password
                </FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Min. 8 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Confirm new password
                </FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Repeat your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive text-center">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
