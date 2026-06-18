import { useEffect, useState, Suspense } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUser } from "@/app/provider/slices/user";
import { useGoogleLoginMutation } from "@/app/provider/api/authApi";
import { Loader2 } from "lucide-react";
import { useAnonMerge } from "@/hooks/use-anon-merge";
import { AnonymousMergeDialog } from "@/components/anonymous-merge-dialog";

interface GoogleLoginButtonProps {
  onLoadingChange?: (loading: boolean) => void;
}

const GoogleLoginButtonInner = ({ onLoadingChange }: GoogleLoginButtonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  // Middleware uses encodeURIComponent, so decode before checking
  const decodedFrom = rawFrom
    ? (() => { try { return decodeURIComponent(rawFrom); } catch { return rawFrom; } })()
    : null;
  const validFrom =
    decodedFrom && decodedFrom.startsWith("/") && !decodedFrom.startsWith("/auth")
      ? decodedFrom
      : null;
  const router = useRouter();
  const pathname = usePathname();
  const successMessage =
    pathname === "/auth/login"
      ? "Logged in successfully"
      : "Account created successfully";
  const { pendingSessions, showDialog, isLoading: isMerging, handlePostAuth, confirmMerge, skipMerge } = useAnonMerge();

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).google) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  if (isLoading) return <Loader2 className="animate-spin mx-auto mb-4" />;
  if (!isLoaded) return null;

  return (
    <>
      {showDialog && (
        <AnonymousMergeDialog
          sessions={pendingSessions}
          isLoading={isMerging}
          onConfirm={(ids) => confirmMerge(ids, () => router.replace(validFrom ?? "/events"))}
          onSkip={() => skipMerge(() => router.replace(validFrom ?? "/events"))}
        />
      )}
      <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const res = await googleLogin({
          idToken: credentialResponse.credential as string,
        }).unwrap();

        const isSuperAdmin =
          res?.data?.user?.role === "SUPER_ADMIN" ||
          res?.data?.user?.role === "ADMIN";

        // Use the same store-token API route as regular login so cookies get the
        // correct 7-day expiry and the "accessToken" name that useSocket expects.
        // (Direct Cookies.set was using expires: 1/96 = 15 minutes, breaking sockets.)
        await fetch("/api/auth/store-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: res?.data?.accessToken,
            refreshToken: res?.data?.refreshToken,
            isAdmin: isSuperAdmin,
          }),
        });

        dispatch(setUser({ ...res.data.user }));
        dispatch(setIsAuthenticated(true));
        toast.success(res.message || successMessage);

        await new Promise((resolve) => setTimeout(resolve, 50));

        const destination = isSuperAdmin ? (validFrom ?? "/admin") : (validFrom ?? "/events");
        await handlePostAuth(() => router.replace(destination));
      }}
      logo_alignment="center"
      size="large"
      onError={() => {
        toast.error("Login Failed. Please try again");
      }}
    />
    </>
  );
};

const GoogleLoginButton = ({ onLoadingChange }: GoogleLoginButtonProps) => (
  <Suspense fallback={null}>
    <GoogleLoginButtonInner onLoadingChange={onLoadingChange} />
  </Suspense>
);

export default GoogleLoginButton;