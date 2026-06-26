"use client";

/**
 * AuthBottomSheet
 *
 * A lightweight slide-up sheet that lets the user log in or register
 * without navigating away from the current page. Used by the PostcardCreator
 * so users don't lose their in-progress media when auth is required.
 *
 * On successful auth the `onSuccess` callback is invoked so the caller can
 * immediately continue with the action that triggered the gate.
 */

import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoginMutation, useRegisterMutation } from "@/app/provider/api/authApi";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUser } from "@/app/provider/slices/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AuthBottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called after the user successfully authenticates */
  onSuccess: () => void;
  /** Optional hint shown above the form explaining why auth is needed */
  prompt?: string;
}

type Mode = "login" | "register";

export function AuthBottomSheet({
  open,
  onClose,
  onSuccess,
  prompt,
}: AuthBottomSheetProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const isLoading = isLoggingIn || isRegistering;

  const storeTokens = async (
    accessToken: string,
    refreshToken: string,
    isAdmin = false
  ) => {
    await fetch("/api/auth/store-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken, isAdmin }),
    });
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    try {
      const res = await loginMutation({
        email: loginEmail,
        password: loginPassword,
      }).unwrap();

      await storeTokens(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user?.role === "SUPER_ADMIN" || res.data.user?.role === "ADMIN"
      );

      dispatch(setIsAuthenticated(true));
      dispatch(setUser({ ...res.data.user }));
      toast.success("Signed in!");
      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? err?.message ?? "Login failed. Check your credentials."
      );
    }
  };

  const handleRegister = async () => {
    if (!regName || !regUsername || !regEmail || !regPassword) return;
    try {
      const res = await registerMutation({
        displayName: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        acceptedTerms: true,
      } as any).unwrap();

      await storeTokens(res.data.accessToken, res.data.refreshToken, false);

      dispatch(setIsAuthenticated(true));
      dispatch(setUser({ ...res.data.user }));
      toast.success("Account created!");
      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? err?.message ?? "Registration failed. Please try again."
      );
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200000] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[200001] bg-background rounded-t-2xl shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="font-semibold text-base">
              {mode === "login" ? "Sign in to continue" : "Create an account"}
            </h2>
            {prompt && (
              <p className="text-xs text-muted-foreground mt-0.5">{prompt}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mx-4 mt-4 p-1 bg-muted rounded-xl">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                mode === m
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <div className="px-4 py-4 space-y-3">
          {mode === "login" ? (
            <>
              <Input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                className="w-full h-11 bg-[#531342] hover:bg-[#531342]/90 text-white rounded-xl"
                onClick={handleLogin}
                disabled={isLoading || !loginEmail || !loginPassword}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign in"
                )}
              </Button>
            </>
          ) : (
            <>
              <Input
                placeholder="Display name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="h-11"
              />
              <Input
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="h-11"
              />
              <Input
                type="email"
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                className="w-full h-11 bg-[#531342] hover:bg-[#531342]/90 text-white rounded-xl"
                onClick={handleRegister}
                disabled={isLoading || !regName || !regUsername || !regEmail || !regPassword}
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create account"
                )}
              </Button>
            </>
          )}
        </div>

        {/* Safe area spacer for mobile */}
        <div className="h-6" />
      </div>
    </>
  );
}
