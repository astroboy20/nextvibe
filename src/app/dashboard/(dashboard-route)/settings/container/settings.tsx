"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
  Loader2,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogoutMutation } from "@/app/provider/api/authApi";
import Cookies from "js-cookie";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import { useDispatch } from "react-redux";

const Settings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [logout, { isLoading: isSigningOut }] = useLogoutMutation();

  useEffect(() => {
    dispatch(setHideHeader(true));
    return () => {
      dispatch(setHideHeader(false));
    };
  }, [dispatch]);

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch {
    } finally {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      toast.success("See you next time!");
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Settings</h1>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* App Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* <button
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
              onClick={() => router.push("/settings/privacy")}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Privacy Preferences</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button> */}

            <button
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
              onClick={() => router.push("/privacy")}
            >
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Privacy Policy</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => router.push("/contact")}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Help & Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </>
          )}
        </Button>
      </main>
    </div>
  );
};

export default Settings;
