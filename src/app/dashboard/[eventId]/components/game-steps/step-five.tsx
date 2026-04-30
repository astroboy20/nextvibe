import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Plus, Trophy, Trash2, DollarSign } from "lucide-react";
import { DiscountType, RewardTier, RewardType } from "../game-creation-wizard";

interface StepFiveProps {
  rewardTiers: RewardTier[];
  addRewardTier: () => void;
  removeRewardTier: (id: string) => void;
  updateRewardTier: (
    id: string,
    field: keyof RewardTier,
    value: string | number
  ) => void;
  priceCurrency: string;
}
const StepFive = ({
  rewardTiers,
  addRewardTier,
  removeRewardTier,
  updateRewardTier,
  priceCurrency,
}: StepFiveProps) => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Reward Tiers ({rewardTiers.length})</h3>
        <p className="text-sm text-muted-foreground">
          Set prizes for top-ranking players
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={addRewardTier}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Tier
      </Button>
    </div>

    <div className="space-y-4 max-h-105 overflow-y-auto pr-1">
      {rewardTiers.map((tier: any) => (
        <Card key={tier.id} className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold",
                    tier.rank === 1
                      ? "bg-yellow-500"
                      : tier.rank === 2
                      ? "bg-gray-400"
                      : tier.rank === 3
                      ? "bg-amber-600"
                      : "bg-muted-foreground"
                  )}
                >
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Rank #{tier.rank}</span>
              </div>
              {rewardTiers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => removeRewardTier(tier.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={tier.title}
                  onChange={(e) =>
                    updateRewardTier(tier.id, "title", e.target.value)
                  }
                  className="h-8 text-sm"
                  placeholder="1st Place Winner"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Reward Type</Label>
                <ToggleGroup
                  type="single"
                  value={tier.type}
                  onValueChange={(v) =>
                    v && updateRewardTier(tier.id, "type", v as RewardType)
                  }
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="CASH"
                    className="rounded-full h-8 text-xs px-3"
                  >
                    Cash
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="VOUCHER"
                    className="rounded-full h-8 text-xs px-3"
                  >
                    Voucher
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="GIFT"
                    className="rounded-full h-8 text-xs px-3"
                  >
                    Gift
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                value={tier.description}
                onChange={(e) =>
                  updateRewardTier(tier.id, "description", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="Describe the prize..."
              />
            </div>

            {/* Value row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {tier.type === "CASH"
                    ? `Value (${priceCurrency})`
                    : "Voucher Value"}
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={tier.value}
                  onChange={(e) =>
                    updateRewardTier(tier.id, "value", e.target.value)
                  }
                  className="h-8 text-sm"
                  placeholder="10000"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={tier.quantity}
                  onChange={(e) =>
                    updateRewardTier(
                      tier.id,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Voucher-specific fields */}
            {tier.type === "VOUCHER" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Discount Type</Label>
                  <ToggleGroup
                    type="single"
                    value={tier.discountType}
                    onValueChange={(v) =>
                      v &&
                      updateRewardTier(
                        tier.id,
                        "discountType",
                        v as DiscountType
                      )
                    }
                    className="justify-start"
                  >
                    <ToggleGroupItem
                      value="PERCENTAGE"
                      className="rounded-full h-8 text-xs px-3"
                    >
                      %
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="FIXED"
                      className="rounded-full h-8 text-xs px-3"
                    >
                      Fixed
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Discount Value</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tier.discountValue}
                    onChange={(e) =>
                      updateRewardTier(
                        tier.id,
                        "discountValue",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Usage Limit</Label>
                  <Input
                    type="number"
                    min={1}
                    value={tier.usageLimit}
                    onChange={(e) =>
                      updateRewardTier(
                        tier.id,
                        "usageLimit",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Expiry */}
            <div className="space-y-1">
              <Label className="text-xs">Expiry Date (optional)</Label>
              <Input
                type="datetime-local"
                value={tier.expiryDate}
                onChange={(e) =>
                  updateRewardTier(tier.id, "expiryDate", e.target.value)
                }
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default StepFive;
