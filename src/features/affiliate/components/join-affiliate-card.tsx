"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, TrendingUp, Gift } from "lucide-react";

interface JoinAffiliateCardProps {
  onJoin: () => void;
  isLoading: boolean;
}

const perks = [
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "Refer organizers",
    desc: "Share your link. When they sign up and buy a plan, you earn.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
    title: "10% lifetime commission",
    desc: "On every organizer plan or add-on purchase — forever.",
  },
  {
    icon: <Gift className="h-5 w-5 text-violet-500" />,
    title: "5% discount for referrals",
    desc: "Your referred organizers get an automatic 5% off their first plan.",
  },
];

export function JoinAffiliateCard({ onJoin, isLoading }: JoinAffiliateCardProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Join the Affiliate Program</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Earn commission on every event plan purchased by organizers you refer.
          Free to join, no commitment.
        </p>
      </div>

      <div className="space-y-3">
        {perks.map((perk) => (
          <Card key={perk.title} className="border-border">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="mt-0.5 shrink-0">{perk.icon}</div>
              <div>
                <p className="text-sm font-semibold">{perk.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{perk.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        className="w-full h-11 bg-[#531342] hover:bg-[#531342]/90 text-white rounded-xl"
        onClick={onJoin}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering…
          </>
        ) : (
          "Register Now — It's Free"
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Applies to organizer event plans and add-ons only. Ticket sales are excluded.
      </p>
    </div>
  );
}
