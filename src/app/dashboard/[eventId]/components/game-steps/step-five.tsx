"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { DiscountType, RewardTier, RewardType } from "../game-creation-wizard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StepFiveProps {
  rewardTiers: RewardTier[];
  updateRewardTier: (
    id: string,
    field: keyof RewardTier,
    value: string | number
  ) => void;
  priceCurrency: string;
}

const ORDINALS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];

const rankColors: Record<number, string> = {
  1: "bg-yellow-500",
  2: "bg-gray-400",
  3: "bg-amber-600",
};

const REWARD_TYPES: { value: RewardType; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "COUPON", label: "Coupon" },
  { value: "MERCHANDISE", label: "Merch" },
  { value: "FREE_TICKET", label: "Free Ticket" },
  { value: "BADGE", label: "Badge" },
  { value: "POINTS", label: "Points" },
  { value: "OTHER", label: "Other" },
];

const StepFive = ({
  rewardTiers,
  updateRewardTier,
  priceCurrency,
}: StepFiveProps) => (
  <div className="space-y-4 animate-fade-in">
    <div>
      <h3 className="font-semibold">Reward Tiers</h3>
      <p className="text-sm text-muted-foreground">
        Set a prize for each of the {rewardTiers.length} winner
        {rewardTiers.length !== 1 ? "s" : ""}.
      </p>
    </div>

    <div className="space-y-4 max-h-105 overflow-y-auto pr-1">
      {rewardTiers.map((tier) => (
        <Card
          key={tier.id}
          className={cn(
            "overflow-hidden border-2 transition-colors",
            tier.value ? "border-emerald-400/50" : "border-border"
          )}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-white shrink-0",
                  rankColors[tier.rank] ?? "bg-muted-foreground"
                )}
              >
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {ORDINALS[tier.rank - 1] ?? `${tier.rank}th`} Place
                </p>
                <p className="text-xs text-muted-foreground">
                  Rank #{tier.rank}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Reward Type</Label>
              <ToggleGroup
                type="single"
                value={tier.type}
                onValueChange={(v) =>
                  v && updateRewardTier(tier.id, "type", v as RewardType)
                }
                className="flex flex-wrap gap-1 justify-start"
              >
                {REWARD_TYPES.map(({ value, label }) => (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    className="rounded-full h-7 text-xs px-3 data-[state=on]:bg-[#531342] data-[state=on]:text-white"
                  >
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Prize Title</Label>
                <Input
                  value={tier.title}
                  onChange={(e) =>
                    updateRewardTier(tier.id, "title", e.target.value)
                  }
                  className="h-9 text-sm"
                  placeholder={`${
                    ORDINALS[tier.rank - 1] ?? `${tier.rank}th`
                  } Place Winner`}
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={tier.description}
                  onChange={(e) =>
                    updateRewardTier(tier.id, "description", e.target.value)
                  }
                  className="h-9 text-sm"
                  placeholder="Prize for the top performer."
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-xs">
                  {tier.type === "CASH"
                    ? `Cash Amount (${priceCurrency})`
                    : tier.type === "POINTS"
                    ? "Points Amount"
                    : tier.type === "BADGE"
                    ? "Badge Name / ID"
                    : "Value"}
                  {(tier.type === "CASH" || tier.type === "POINTS") && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </Label>
                <Input
                  type={
                    tier.type === "CASH" || tier.type === "POINTS"
                      ? "number"
                      : "text"
                  }
                  min={1}
                  value={tier.value}
                  onChange={(e) =>
                    updateRewardTier(tier.id, "value", e.target.value)
                  }
                  className={cn(
                    "h-9 text-sm",
                    (tier.type === "CASH" || tier.type === "POINTS") &&
                      (!tier.value || Number(tier.value) <= 0) &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder={
                    tier.type === "CASH"
                      ? "e.g. 10000"
                      : tier.type === "POINTS"
                      ? "e.g. 500"
                      : tier.type === "BADGE"
                      ? "e.g. Champion"
                      : tier.type === "FREE_TICKET"
                      ? "e.g. VIP Pass"
                      : tier.type === "MERCHANDISE"
                      ? "e.g. Event T-Shirt"
                      : "Describe the reward"
                  }
                />
              </div>

              {tier.type === "COUPON" && (
                <>
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
                        className="rounded-full h-8 text-xs px-3 data-[state=on]:bg-[#531342] data-[state=on]:text-white"
                      >
                        %
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="FIXED_AMOUNT"
                        className="rounded-full h-8 text-xs px-3 data-[state=on]:bg-[#531342] data-[state=on]:text-white"
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
                      className="h-9 text-sm"
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-1">
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
                      className="h-9 text-sm"
                      placeholder="100"
                    />
                  </div>
                </>
              )}

              {tier.type !== "CASH" && tier.type !== "POINTS" && (
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
                    className="h-9 text-sm"
                    placeholder="1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default StepFive;
