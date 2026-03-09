import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumFeature {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
  type: "game" | "vibetag";
}

const premiumFeatures: PremiumFeature[] = [
  { id: "1", name: "Pre-Event VibeTag", price: 1500, enabled: true, type: "vibetag" },
  { id: "2", name: "Main Event VibeTag", price: 1500, enabled: true, type: "vibetag" },
  { id: "3", name: "Pre-Event Trivia (3 rounds)", price: 2000, enabled: true, type: "game" },
  { id: "4", name: "Main Event Games Bundle", price: 3500, enabled: false, type: "game" },
];

export function PaymentModule() {
  const enabledFeatures = premiumFeatures.filter(f => f.enabled);
  const totalDue = enabledFeatures.reduce((sum, f) => sum + f.price, 0);
  const hasUnpaidFeatures = enabledFeatures.length > 0;

  if (!hasUnpaidFeatures) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Activate Premium Features
          </CardTitle>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
            <Lock className="mr-1 h-3 w-3" />
            Locked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pricing Summary */}
        <div className="space-y-2 mb-4">
          {enabledFeatures.map((feature) => (
            <div 
              key={feature.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  feature.type === "vibetag" ? "bg-primary" : "bg-accent"
                )} />
                <span className="text-muted-foreground">{feature.name}</span>
              </div>
              <span className="font-medium">₦{feature.price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Total Due</span>
          <span className="text-2xl font-display font-bold text-primary">
            ₦{totalDue.toLocaleString()}
          </span>
        </div>

        {/* CTA Button */}
        <Button className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white">
          <Sparkles className="mr-2 h-4 w-4" />
          Activate Features
        </Button>

        {/* Note */}
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Your event page is live. Games & VibeTags are locked until payment.
        </p>
      </CardContent>
    </Card>
  );
}
