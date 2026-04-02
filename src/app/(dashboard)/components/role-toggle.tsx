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
  Loader2,
  Users,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSwitchRoleMutation } from "@/app/provider/api/userApi";




interface RoleToggleProps {
  compact?: boolean;
  profile: any;
}

export function RoleToggle({ compact = false, profile }: RoleToggleProps) {
  const router = useRouter();

  const isOrganizer = profile?.data?.role === "organizer";

  const [switchRoleMutation, { isLoading }] = useSwitchRoleMutation();

  const handleRoleSwitch = async () => {
    const newRole = isOrganizer ? "attendee" : "organizer";
    try {
      const res = await switchRoleMutation(newRole).unwrap();
      console.log(res);
      if (res?.data?.currentRole === "organizer") {
        router.push("/dashboard");
        toast(
          "Switched to Organizer Mode! You can now create and manage events."
        );
      } else if (res?.data?.currentRole === "attendee") {
        router.push("/events");
        toast("Switched to Attendee Mode! You're now browsing as an attendee.");
      }
    } catch (error:any) {
      toast.error("Something went wrong", error);
    }
  };
  if (compact) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isOrganizer ? "bg-primary/20" : "bg-accent/20"
                )}
              >
                {isOrganizer ? (
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                ) : (
                  <Users className="h-5 w-5 text-accent" />
                )}
              </div>

              <div>
                <p className="font-medium text-foreground">
                  {isOrganizer ? "Organizer Mode" : "Attendee Mode"}
                </p>

                <p className="text-xs text-muted-foreground">
                  Tap to switch roles
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={handleRoleSwitch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Switch
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Account Mode
        </CardTitle>

        <CardDescription>
          Switch between attendee and organizer experiences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Attendee */}
          <button
            // onClick={() => handleRoleChange("attendee")}
            disabled={isLoading}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
              !isOrganizer
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full",
                !isOrganizer ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Users className="h-7 w-7" />
            </div>

            <div className="text-center">
              <p
                className={cn(
                  "font-semibold",
                  !isOrganizer ? "text-primary" : "text-muted-foreground"
                )}
              >
                Attendee
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Discover, RSVP & play
              </p>
            </div>

            {!isOrganizer && (
              <span className="text-xs font-medium text-primary">Active</span>
            )}
          </button>

          {/* Organizer */}
          <button
            // onClick={() => handleRoleChange("organizer")}
            disabled={isLoading}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
              isOrganizer
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full",
                isOrganizer ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <LayoutDashboard className="h-7 w-7" />
            </div>

            <div className="text-center">
              <p
                className={cn(
                  "font-semibold",
                  isOrganizer ? "text-primary" : "text-muted-foreground"
                )}
              >
                Organizer
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Create & manage events
              </p>
            </div>

            {isOrganizer && (
              <span className="text-xs font-medium text-primary">Active</span>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Switching roles...
          </div>
        )}

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {isOrganizer
              ? "As an Organizer, you can:"
              : "As an Attendee, you can:"}
          </p>

          <ul className="text-xs text-muted-foreground space-y-1">
            {isOrganizer ? (
              <>
                <li>• Create and manage events</li>
                <li>• Set up tickets and gamification</li>
                <li>• Track RSVPs and analytics</li>
                <li>• Design custom VibeTags</li>
              </>
            ) : (
              <>
                <li>• Discover events near you</li>
                <li>• RSVP and purchase tickets</li>
                <li>• Play games and compete</li>
                <li>• Create postcards and share</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
