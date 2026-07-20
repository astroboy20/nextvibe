"use client";

/**
 * AuthBottomSheet
 *
 * A lightweight slide-up sheet for login / register / vibe-selection.
 * Used by the PostcardCreator so users don't lose in-progress media.
 *
 * Flow:
 *   login  → onSuccess()              (straight through)
 *   register (email or Google) → vibe-select → onSuccess()
 */

import { useState } from "react";
import { X, Loader2, Eye, EyeOff, Tag, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
} from "@/app/provider/api/authApi";
import {
  useGetVibeTagsQuery,
  useSaveUserVibesMutation,
  type VibeTag,
} from "@/app/provider/api/discoverApi";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUser } from "@/app/provider/slices/user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GoogleLogin } from "@react-oauth/google";
import {
  Laptop, Music, PartyPopper, Mic2, Heart, Cake, Users, Presentation,
} from "lucide-react";

// ── Icon / colour helpers (mirrors InterestSelector) ─────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  tech: Laptop, technology: Laptop,
  music: Music, rave: Music,
  festival: PartyPopper, party: PartyPopper,
  concert: Mic2, wedding: Heart,
  birthday: Cake, hangout: Users, social: Users,
  conference: Presentation,
};
const COLOR_CYCLE = [
  "bg-vibe-cyan/10 text-vibe-cyan",
  "bg-vibe-purple/10 text-vibe-purple",
  "bg-vibe-pink/10 text-vibe-pink",
  "bg-primary/10 text-primary",
];
const getIcon = (name: string): React.ElementType =>
  ICON_MAP[name.toLowerCase()] ?? Tag;
const getColor = (i: number) => COLOR_CYCLE[i % COLOR_CYCLE.length];

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prompt?: string;
}

type Step = "auth" | "vibe-select";
type Mode = "login" | "register";

// ── Component ─────────────────────────────────────────────────────────────────
export function AuthBottomSheet({
  open,
  onClose,
  onSuccess,
  prompt,
}: AuthBottomSheetProps) {
  const dispatch = useDispatch();

  // ── Step / mode state ────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("auth");
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  // ── Auth form fields ─────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // ── Vibe selection state ─────────────────────────────────────────────────
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  // ── API hooks ────────────────────────────────────────────────────────────
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [googleLoginMutation, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [saveVibes, { isLoading: isSavingVibes }] = useSaveUserVibesMutation();
  const {
    data: vibeTags = [],
    isLoading: isLoadingVibes,
    isError: isVibesError,
    refetch: refetchVibes,
  } = useGetVibeTagsQuery(undefined, { skip: step !== "vibe-select" });

  const isAuthLoading = isLoggingIn || isRegistering || isGoogleLoading;

  // ── Helpers ──────────────────────────────────────────────────────────────
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

  const finaliseAuth = (user: any) => {
    dispatch(setIsAuthenticated(true));
    dispatch(setUser({ ...user }));
  };

  /** After any successful registration, go to vibe selection */
  const goToVibeSelect = () => {
    setStep("vibe-select");
  };

  // ── Auth handlers ────────────────────────────────────────────────────────
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

      finaliseAuth(res.data.user);
      toast.success("Signed in!");
      onSuccess(); // login skips vibe step
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
      finaliseAuth(res.data.user);
      toast.success("Account created!");
      goToVibeSelect(); // new user → select vibes
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? err?.message ?? "Registration failed. Please try again."
      );
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const res = await googleLoginMutation({ idToken }).unwrap();

      const isAdmin =
        res?.data?.user?.role === "SUPER_ADMIN" ||
        res?.data?.user?.role === "ADMIN";

      await storeTokens(res.data.accessToken, res.data.refreshToken, isAdmin);
      finaliseAuth(res.data.user);

      // isNew flag from the API tells us this is a fresh account
      const isNewUser = res?.data?.isNew ?? false;
      if (isNewUser) {
        toast.success("Account created!");
        goToVibeSelect();
      } else {
        toast.success("Signed in with Google!");
        onSuccess();
      }
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ??
          err?.data?.message ??
          err?.message ??
          "Google sign-in failed. Please try again."
      );
    }
  };

  // ── Vibe step handler ────────────────────────────────────────────────────
  const handleVibesDone = async (skip = false) => {
    if (!skip) {
      if (selectedVibes.length === 0) {
        toast.error("Pick at least one vibe to continue.");
        return;
      }
      try {
        await saveVibes({ tagIds: selectedVibes }).unwrap();
        toast.success("Vibes saved! Your feed is personalised 🎉");
      } catch {
        // Non-fatal — let the user continue even if saving fails
        toast.error("Couldn't save vibes right now, but you're all set!");
      }
    }
    onSuccess();
  };

  const toggleVibe = (id: string) =>
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200000] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[200001] bg-background rounded-t-2xl shadow-2xl animate-slide-up max-h-[92dvh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* ── STEP: auth ─────────────────────────────────────────────────── */}
        {step === "auth" && (
          <>
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
              {/* Google button */}
              <div className="flex justify-center">
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in with Google…
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={(cr) =>
                      cr.credential && handleGoogleLogin(cr.credential)
                    }
                    onError={() =>
                      toast.error("Google sign-in failed. Please try again.")
                    }
                    logo_alignment="center"
                    size="large"
                    text={mode === "login" ? "signin_with" : "signup_with"}
                  />
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  or continue with email
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Login form */}
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
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    className="w-full h-11 bg-[#531342] hover:bg-[#531342]/90 text-white rounded-xl"
                    onClick={handleLogin}
                    disabled={isAuthLoading || !loginEmail || !loginPassword}
                  >
                    {isLoggingIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </>
              ) : (
                /* Register form */
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
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    className="w-full h-11 bg-[#531342] hover:bg-[#531342]/90 text-white rounded-xl"
                    onClick={handleRegister}
                    disabled={
                      isAuthLoading ||
                      !regName ||
                      !regUsername ||
                      !regEmail ||
                      !regPassword
                    }
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
          </>
        )}

        {/* ── STEP: vibe-select ───────────────────────────────────────────── */}
        {step === "vibe-select" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h2 className="font-semibold text-base">What&apos;s your vibe?</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick your interests to personalise your feed
                </p>
              </div>
              {/* No close button here — user should pick vibes or skip */}
            </div>

            <div className="px-4 py-4">
              {/* Loading */}
              {isLoadingVibes && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* Error */}
              {!isLoadingVibes && (isVibesError || vibeTags.length === 0) && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Sparkles className="h-10 w-10 text-primary/30" />
                  <p className="text-sm font-medium">Couldn&apos;t load vibes</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => refetchVibes()}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Tag grid */}
              {!isLoadingVibes && vibeTags.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {vibeTags.map((tag: VibeTag, index: number) => {
                    const Icon = getIcon(tag.name);
                    const colorClass = getColor(index);
                    const [bgColor, textColor] = colorClass.split(" ");
                    const isSelected = selectedVibes.includes(tag.id);

                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleVibe(tag.id)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-150",
                          isSelected
                            ? "border-primary bg-primary/5 scale-[1.02]"
                            : "border-transparent bg-card shadow-sm hover:border-border"
                        )}
                      >
                        {tag.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tag.imageUrl}
                            alt={tag.name}
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg",
                              isSelected ? "bg-primary/10" : bgColor
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                isSelected ? "text-primary" : textColor
                              )}
                            />
                          </div>
                        )}
                        <span className="text-xs font-semibold leading-tight text-center line-clamp-1">
                          {tag.name}
                        </span>

                        {/* Checkmark */}
                        {isSelected && (
                          <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <svg
                              className="h-2.5 w-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 space-y-2">
                <Button
                  className="w-full h-11 bg-[#531342] hover:bg-[#531342]/90 text-white rounded-xl"
                  disabled={selectedVibes.length === 0 || isSavingVibes}
                  onClick={() => handleVibesDone(false)}
                >
                  {isSavingVibes ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <>
                      Continue
                      {selectedVibes.length > 0 && (
                        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                          {selectedVibes.length} selected
                        </span>
                      )}
                    </>
                  )}
                </Button>

                <button
                  onClick={() => handleVibesDone(true)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </>
        )}

        {/* Safe area spacer */}
        <div className="h-6" />
      </div>
    </>
  );
}
