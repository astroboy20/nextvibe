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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoleToggle } from "../../components/role-toggle";

type UserRole = "attendee" | "organizer";

export const useAuth = () => {
  const signOut = async () => {
    console.log("User signed out (mock)");
  };

  return {
    user: {
      id: "demo-user-id",
      email: "demo@email.com",
    },

    profile: {
      role: "attendee" as UserRole,
    },

    isAuthenticated: true,

    isLoading: false,

    signOut,

    refetchProfile: async () => {
      console.log("Refetch profile (mock)");
    },
  };
};

const Settings =()=> {
  const router = useRouter();
  const { signOut, isLoading: authLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    country: string;
  } | null>(null);

  // Load stored preferences
  useEffect(() => {
    const storedInterests = localStorage.getItem("nextvibe_interests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }

    const storedLocation = localStorage.getItem("nextvibe_location");
    if (storedLocation) {
      setUserLocation(JSON.parse(storedLocation));
    }
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("See you next time! ");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Please try again");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleUpdateInterests = () => {
    // Clear the onboarding complete flag to allow re-selecting interests
    localStorage.removeItem("nextvibe_onboarding_complete");
    toast.success(
      "Your interests have been reset. Refresh the page to update your feed."
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
        {/* Role Toggle */}
        <RoleToggle />

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>Personalize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Interests */}
            <button
              onClick={handleUpdateInterests}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Interests</p>
                  <p className="text-sm text-muted-foreground">
                    {userInterests.length > 0
                      ? `${userInterests.length} selected`
                      : "Not set"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Location */}
            <button
              onClick={handleUpdateInterests}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {userLocation
                      ? `${userLocation.city}, ${userLocation.country}`
                      : "Not set"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Notifications</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Appearance</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Privacy & Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors">
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
}

export default Settings;