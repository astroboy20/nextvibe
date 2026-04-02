"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/app/provider/api/authApi";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [forgotpasswordMutation, { isLoading }] = useForgotPasswordMutation();

  const onBack = () => {
    router.push("/auth/login");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email required, Please enter your email address");
      return;
    }

    try {
      const res = await forgotpasswordMutation({ email }).unwrap();
      if (res?.success) {
        router.push("/auth/login");
      }
      toast.success(res?.data?.message || "Reset link sent successfully");
    } catch (error: any) {
      toast.error("Something went wrong", error);
    }
  };

  // if (isSent) {
  //   return (
  //     <div className="space-y-4 text-center">
  //       <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
  //         <Mail className="h-6 w-6 text-primary" />
  //       </div>
  //       <div>
  //         <h3 className="font-display text-lg font-semibold">
  //           Check your email
  //         </h3>
  //         <p className="text-sm text-muted-foreground mt-1">
  //           We sent a reset link to <strong>{email}</strong>. Click the link in
  //           the email to set a new password.
  //         </p>
  //       </div>
  //       <Button variant="ghost" className="gap-2" onClick={onBack}>
  //         <ArrowLeft className="h-4 w-4" />
  //         Back to sign in
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-display text-lg font-semibold">
          Forgot your password?
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-[#5B1A57] hover:bg-[#5B1A57]/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-white hover:bg-[#5B1A57]/90 transition-colors gap-1 inline-flex items-center"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
