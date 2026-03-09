import { Suspense, useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/provider/slices/user";
import { useGoogleLoginMutation } from "@/app/provider/api/authApi";

const GoogleLoginButton = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();

  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/events";
  //   const defaultRole = searchParams.get("DEFAULT_ROLE") || "";

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).google) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);
  const router = useRouter();
  return (
    <div>
      <Suspense fallback={null}>
        {isLoaded ? (
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const res = await googleLogin(
                credentialResponse.credential as string
              ).unwrap();
              dispatch(setUser({ ...res.data.user }));
              toast.success(res.message || "Logged in successfully");
              router.replace(from);
            }}
            logo_alignment="center"
            size="large"
            onError={() => {
              // console.error("Login Failed");
              toast.error("Login Failed \n Please try again");
            }}
          />
        ) : (
          <div>Loading...</div>
        )}
        {isLoading && <p>Signing you in...</p>}
      </Suspense>
    </div>
  );
};

export default GoogleLoginButton;
