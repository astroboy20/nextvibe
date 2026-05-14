import { useEffect, useState, Suspense } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUser } from "@/app/provider/slices/user";
import { useGoogleLoginMutation } from "@/app/provider/api/authApi";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  onLoadingChange?: (loading: boolean) => void;
}

const GoogleLoginButtonInner = ({ onLoadingChange }: GoogleLoginButtonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard/events";
  const router = useRouter();
  const pathname = usePathname();
  const successMessage =
    pathname === "/auth/login"
      ? "Logged in successfully"
      : "Account created successfully";

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).google) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Notify parent whenever loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  if (isLoading) return <Loader2 className="animate-spin mx-auto mb-4" />;
  if (!isLoaded) return null;

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const res = await googleLogin({
          idToken: credentialResponse.credential as string,
        }).unwrap();
        Cookies.set("accessToken", res?.data?.accessToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 1 / 96,
        });
        Cookies.set("refreshToken", res?.data?.refreshToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 7,
        });
        dispatch(setUser({ ...res.data.user }));
        dispatch(setIsAuthenticated(true));
        toast.success(res.message || successMessage);
        router.replace(from);
      }}
      logo_alignment="center"
      size="large"
      onError={() => {
        toast.error("Login Failed. Please try again");
      }}
    />
  );
};

const GoogleLoginButton = ({ onLoadingChange }: GoogleLoginButtonProps) => (
  <Suspense fallback={null}>
    <GoogleLoginButtonInner onLoadingChange={onLoadingChange} />
  </Suspense>
);

export default GoogleLoginButton;
