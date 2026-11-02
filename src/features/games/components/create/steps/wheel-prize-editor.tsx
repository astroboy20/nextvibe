"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type PrizeRarity = "COMMON" | "RARE" | "VERY_RARE";

/** One slice of the wheel while the organizer is setting it up. */
export interface WheelPrizeDraft {
  id: string;
  title: string;
  description: string;
  rarity: PrizeRarity;
  /** null = unlimited */
  quantity: number | null;
  isRetry: boolean;
}

export const MIN_WHEEL_SLICES = 2;
export const MAX_WHEEL_SLICES = 12;

const RARITIES: { value: PrizeRarity; label: string; hint: string }[] = [
  { value: "COMMON", label: "Common", hint: "Comes up most" },
  { value: "RARE", label: "Rare", hint: "About 3× less often" },
  { value: "VERY_RARE", label: "Very rare", hint: "About 10× less often" },
];

export const newWheelPrize = (isRetry = false): WheelPrizeDraft => ({
  id: crypto.randomUUID(),
  title: isRetry ? "Retry" : "",
  description: "",
  rarity: "COMMON",
  quantity: isRetry ? null : 1,
  isRetry,
});

/** Error message for the wizard's validation, or "" when the wheel is valid. */
export function validateWheelPrizes(prizes: WheelPrizeDraft[]): string {
  if (prizes.length < MIN_WHEEL_SLICES)
    return `A wheel needs at least ${MIN_WHEEL_SLICES} slices.`;
  if (prizes.length > MAX_WHEEL_SLICES)
    return `A wheel can have at most ${MAX_WHEEL_SLICES} slices.`;
  if (prizes.every((p) => p.isRetry))
    return "Add at least one prize that isn't Retry.";
  if (prizes.some((p) => !p.isRetry && !p.title.trim()))
    return "Every prize needs a name.";
  if (prizes.some((p) => p.quantity !== null && p.quantity < 1))
    return "A limited prize needs a quantity of at least 1.";
  return "";
}

interface WheelPrizeEditorProps {
  roundIndex: number;
  totalRounds: number;
  prizes: WheelPrizeDraft[];
  setPrizes: (prizes: WheelPrizeDraft[]) => void;
}

export default function WheelPrizeEditor({
  roundIndex,
  totalRounds,
  prizes,
  setPrizes,
}: WheelPrizeEditorProps) {
  const update = (id: string, patch: Partial<WheelPrizeDraft>) =>
    setPrizes(prizes.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) => setPrizes(prizes.filter((p) => p.id !== id));
  const add = (isRetry: boolean) => setPrizes([...prizes, newWheelPrize(isRetry)]);
  const full = prizes.length >= MAX_WHEEL_SLICES;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl bg-[#531342]/5 border border-[#531342]/20 px-4 py-3">
        <p className="text-sm font-semibold text-[#531342]">
          Round {roundIndex + 1} of {totalRounds}: prizes on the wheel
        </p>
        <p className="text-xs text-muted-foreground">
          Each checked-in guest spins once. Slices are the same size; rarity
          decides how often each comes up, and rare ones are labelled.
        </p>
      </div>

      <ul className="space-y-3">
        {prizes.map((prize, i) => (
          <li key={prize.id} className="rounded-xl border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Slice {i + 1}
                {prize.isRetry && " · Retry (gives another spin)"}
              </p>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Remove slice"
                onClick={() => remove(prize.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {!prize.isRetry && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Prize</Label>
                  <Input
                    value={prize.title}
                    maxLength={60}
                    onChange={(e) => update(prize.id, { title: e.target.value })}
                    placeholder="Free drink"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Details (optional)</Label>
                  <Input
                    value={prize.description}
                    maxLength={200}
                    onChange={(e) =>
                      update(prize.id, { description: e.target.value })
                    }
                    placeholder="Any drink at the bar"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">How often</Label>
              <div className="grid grid-cols-3 gap-2">
                {RARITIES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update(prize.id, { rarity: r.value })}
                    className={cn(
                      "rounded-lg border-2 px-2 py-1.5 text-left transition-all",
                      prize.rarity === r.value
                        ? "border-[#531342] bg-[#531342]/5"
                        : "border-border hover:border-[#531342]/40",
                    )}
                  >
                    <p className="text-xs font-semibold">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {!prize.isRetry && (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2.5">
                <div>
                  <p className="text-xs font-medium">Limited</p>
                  <p className="text-[10px] text-muted-foreground">
                    Greyed out as &quot;Gone&quot; once they&apos;re all won.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {prize.quantity !== null && (
                    <Input
                      type="number"
                      min={1}
                      className="h-8 w-20"
                      aria-label="How many"
                      value={prize.quantity}
                      onChange={(e) =>
                        update(prize.id, {
                          quantity: Math.max(0, Math.floor(Number(e.target.value))),
                        })
                      }
                    />
                  )}
                  <Switch
                    checked={prize.quantity !== null}
                    onCheckedChange={(on) =>
                      update(prize.id, { quantity: on ? 1 : null })
                    }
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={full} onClick={() => add(false)}>
          <Plus className="mr-1 h-4 w-4" />
          Add prize
        </Button>
        <Button variant="outline" size="sm" disabled={full} onClick={() => add(true)}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Add retry slice
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {prizes.length} of {MAX_WHEEL_SLICES} slices
      </p>
    </div>
  );
}
