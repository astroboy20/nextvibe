"use client";

import { useState } from "react";
import {
  IGame,
  ScheduleType,
  EventGamificationType,
  GameType,
} from "@/types/game.type";
import { ChevronRight, ChevronLeft, Trophy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameContentGenerator } from "./game-content-generator";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────────
const GAME_TYPE_OPTIONS: { value: GameType; label: string; description: string }[] = [
  { value: "trivia",          label: "Trivia",            description: "Multiple-choice questions" },
  { value: "wordPuzzle",      label: "Word Puzzle",       description: "Find hidden words in a grid" },
  { value: "thisOrThat",      label: "This or That",      description: "Pick between two options" },
  { value: "twoTruthsOneLie", label: "Two Truths One Lie", description: "Spot the lie" },
];

const ORDINALS = ["1st", "2nd", "3rd", "4th"];

// ── Types ──────────────────────────────────────────────────────────────────────
interface WinnerPrize {
  rank: number;       // 1-based
  title: string;
  description: string;
  value: string;      // cash amount as string
}

interface RoundConfig {
  title: string;
  description: string;
  gameType: GameType;
  data: any;          // questions / puzzle data
}

interface SimplifiedGamificationFormProps {
  eventGamificationType: EventGamificationType;
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  eventStartDate?: string;
  eventEndDate?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function SimplifiedGamificationForm({
  eventGamificationType,
  onNext,
  onBack,
  initialData,
  eventStartDate,
  eventEndDate,
}: SimplifiedGamificationFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // ── Step 1 state ───────────────────────────────────────────────────────────
  const [title, setTitle]           = useState(initialData?.title ?? "");
  const [schedule, setSchedule]     = useState<ScheduleType>(initialData?.schedule ?? "concurrent");
  const [startsAt, setStartsAt]     = useState<Date | null>(
    initialData?.startsAt ? new Date(initialData.startsAt) : eventStartDate ? new Date(eventStartDate) : null
  );
  const [endsAt, setEndsAt]         = useState<Date | null>(
    initialData?.endsAt ? new Date(initialData.endsAt) : eventEndDate ? new Date(eventEndDate) : null
  );
  const [repetitions, setRepetitions]   = useState<number>(initialData?.repetitions ?? 1);
  const [gameDuration, setGameDuration] = useState<number>(initialData?.gameDuration ?? 30);
  const [basePrice, setBasePrice]       = useState<number>(initialData?.basePrice ?? 0);
  const [perRoundPrice, setPerRoundPrice] = useState<number>(initialData?.perRoundPrice ?? 0);
  const [priceCurrency, setPriceCurrency] = useState(initialData?.priceCurrency ?? "NGN");
  const [maxWinners, setMaxWinners]     = useState<number>(initialData?.maxWinners ?? 1);
  const [numberOfRounds, setNumberOfRounds] = useState<number>(
    initialData?.rounds?.length ?? 1
  );
  const [activityTiming, setActivityTiming] = useState(initialData?.activityTiming ?? "DURING_EVENT");

  // ── Step 2 state ───────────────────────────────────────────────────────────
  // Rounds — one entry per round, user picks game type + sets questions
  const [rounds, setRounds] = useState<RoundConfig[]>(() => {
    if (initialData?.rounds?.length) {
      return initialData.rounds.map((r: any) => ({
        title: r.title ?? "",
        description: r.description ?? "",
        gameType: (r.gameType?.toLowerCase() ?? "trivia") as GameType,
        data: r.config ?? [],
      }));
    }
    return Array.from({ length: initialData?.rounds?.length ?? 1 }, (_, i) => ({
      title: `Round ${i + 1}`,
      description: "",
      gameType: "trivia" as GameType,
      data: [],
    }));
  });

  // Winner prizes — one cash prize per winner
  const [prizes, setPrizes] = useState<WinnerPrize[]>(() => {
    if (initialData?.rewardTiers?.length) {
      return initialData.rewardTiers.map((t: any, i: number) => ({
        rank: t.rank ?? i + 1,
        title: t.title ?? `${ORDINALS[i]} Place Winner`,
        description: t.description ?? "",
        value: t.value ?? "",
      }));
    }
    return Array.from({ length: initialData?.maxWinners ?? 1 }, (_, i) => ({
      rank: i + 1,
      title: `${ORDINALS[i] ?? `${i + 1}th`} Place Winner`,
      description: "",
      value: "",
    }));
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const syncRoundsToCount = (count: number) => {
    setRounds((prev) => {
      if (count > prev.length) {
        const extra = Array.from({ length: count - prev.length }, (_, i) => ({
          title: `Round ${prev.length + i + 1}`,
          description: "",
          gameType: "trivia" as GameType,
          data: [],
        }));
        return [...prev, ...extra];
      }
      return prev.slice(0, count);
    });
  };

  const syncPrizesToWinners = (count: number) => {
    setPrizes(
      Array.from({ length: count }, (_, i) => ({
        rank: i + 1,
        title: `${ORDINALS[i] ?? `${i + 1}th`} Place Winner`,
        description: prizes[i]?.description ?? "",
        value: prizes[i]?.value ?? "",
      }))
    );
  };

  const updateRound = (idx: number, field: keyof RoundConfig, value: any) => {
    setRounds((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const updatePrize = (idx: number, field: keyof WinnerPrize, value: any) => {
    setPrizes((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // ── Step 1 → Step 2 ────────────────────────────────────────────────────────
  const handleStep1Next = () => {
    if (!title.trim()) { toast.error("Game title is required."); return; }
    if (!startsAt)      { toast.error("Start date & time is required."); return; }
    if (!endsAt)        { toast.error("End date & time is required."); return; }
    if (numberOfRounds < 1 || numberOfRounds > 4) {
      toast.error("Number of rounds must be between 1 and 4.");
      return;
    }
    if (maxWinners < 1) { toast.error("At least 1 winner is required."); return; }

    syncRoundsToCount(numberOfRounds);
    syncPrizesToWinners(maxWinners);
    setStep(2);
  };

  // ── Final save ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    // Validate every round has questions
    for (let i = 0; i < rounds.length; i++) {
      const d = rounds[i].data;
      const empty =
        !d ||
        (Array.isArray(d) && d.length === 0) ||
        (typeof d === "object" && !Array.isArray(d) && Object.keys(d).length === 0);
      if (empty) {
        toast.error(`Round ${i + 1} has no questions. Please add or generate content.`);
        return;
      }
    }

    // Validate every winner has a cash amount
    for (let i = 0; i < prizes.length; i++) {
      if (!prizes[i].value || Number(prizes[i].value) <= 0) {
        toast.error(`Set a cash prize amount for the ${ORDINALS[i] ?? `${i + 1}th`} place winner.`);
        return;
      }
    }

    // Build payload matching the API structure
    const payload = {
      title,
      scheduleType: schedule === "concurrent" ? "ALL_AT_ONCE" : schedule.toUpperCase(),
      priceCurrency,
      repetitions,
      startsAt: startsAt!.toISOString(),
      endsAt: endsAt!.toISOString(),
      activityTiming,
      maxWinners,
      gameDuration,
      basePrice,
      perRoundPrice,
      rounds: rounds.map((r, i) => ({
        title: r.title,
        description: r.description,
        gameType: r.gameType.toUpperCase().replace(/([A-Z])/g, (m, c, o) =>
          o > 0 ? "_" + c : c
        ),
        config: Array.isArray(r.data) ? { questions: r.data } : r.data,
        orderIndex: i,
        rewardTiers: prizes.map((p) => ({
          rank: p.rank,
          type: "CASH",
          title: p.title,
          description: p.description,
          value: p.value,
          quantity: 1,
        })),
      })),
      rewardTiers: prizes.map((p) => ({
        rank: p.rank,
        type: "CASH",
        title: p.title,
        description: p.description,
        value: p.value,
        quantity: 1,
      })),
      // legacy fields kept for compatibility
      eventGamificationType,
      schedule,
      startDay: startsAt,
      endDay: endsAt,
      maxNoOfWinners: maxWinners,
      games: rounds.map((r) => ({
        gameType: r.gameType,
        state: "active",
        duration: gameDuration * 60,
        name: r.title,
        description: r.description,
        data: r.data,
      })) as IGame[],
    };

    onNext(payload);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => s < step && setStep(s as 1 | 2)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                step === s
                  ? "bg-[#5B1A57] border-[#5B1A57] text-white"
                  : step > s
                  ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer"
                  : "border-gray-300 text-gray-400"
              )}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </button>
            {s < 2 && <div className="h-px w-10 bg-gray-200" />}
          </div>
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          {step === 1 ? "Basic Settings" : "Rounds & Prizes"}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — Basic Settings
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <>
          <Card>
            <CardHeader><CardTitle>Game Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Title */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label>Game Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nextvibe Trivia Night"
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Schedule */}
              <div className="flex flex-col gap-1.5">
                <Label>Schedule Type</Label>
                <Select value={schedule} onValueChange={(v) => setSchedule(v as ScheduleType)}>
                  <SelectTrigger className="h-10 rounded-lg w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concurrent">All at Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Timing */}
              <div className="flex flex-col gap-1.5">
                <Label>Activity Timing</Label>
                <Select value={activityTiming} onValueChange={setActivityTiming}>
                  <SelectTrigger className="h-10 rounded-lg w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRE_EVENT">Pre-Event</SelectItem>
                    <SelectItem value="DURING_EVENT">During Event</SelectItem>
                    <SelectItem value="POST_EVENT">Post-Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Starts At */}
              <div className="flex flex-col gap-1.5">
                <Label>Starts At</Label>
                <DateTimePicker value={startsAt} onChange={setStartsAt} />
              </div>

              {/* Ends At */}
              <div className="flex flex-col gap-1.5">
                <Label>Ends At</Label>
                <DateTimePicker value={endsAt} onChange={setEndsAt} />
              </div>

              {/* Repetitions */}
              <div className="flex flex-col gap-1.5">
                <Label>Repetitions</Label>
                <Input
                  type="number" min={1}
                  value={repetitions}
                  onChange={(e) => setRepetitions(Number(e.target.value))}
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Game Duration */}
              <div className="flex flex-col gap-1.5">
                <Label>Game Duration <span className="text-xs text-muted-foreground">(minutes)</span></Label>
                <Input
                  type="number" min={1}
                  value={gameDuration}
                  onChange={(e) => setGameDuration(Number(e.target.value))}
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Number of Rounds */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  Number of Rounds{" "}
                  <span className="text-xs text-muted-foreground">(1 – 4)</span>
                </Label>
                <Input
                  type="number" min={1} max={4}
                  value={numberOfRounds}
                  onChange={(e) => {
                    const v = Math.min(4, Math.max(1, Number(e.target.value)));
                    setNumberOfRounds(v);
                  }}
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Max Winners */}
              <div className="flex flex-col gap-1.5">
                <Label>Number of Winners</Label>
                <Input
                  type="number" min={1}
                  value={maxWinners}
                  onChange={(e) => setMaxWinners(Math.max(1, Number(e.target.value)))}
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Base Price */}
              <div className="flex flex-col gap-1.5">
                <Label>Base Price</Label>
                <div className="flex gap-2">
                  <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                    <SelectTrigger className="h-10 rounded-lg w-24 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number" min={0}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="h-10 rounded-lg flex-1"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Per Round Price */}
              <div className="flex flex-col gap-1.5">
                <Label>Per Round Price</Label>
                <Input
                  type="number" min={0}
                  value={perRoundPrice}
                  onChange={(e) => setPerRoundPrice(Number(e.target.value))}
                  className="h-10 rounded-lg"
                  placeholder="0"
                />
              </div>

            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-11 rounded-lg" onClick={onBack}>
              Back
            </Button>
            <Button
              className="flex-1 h-11 rounded-lg bg-[#5B1A57] hover:bg-[#4a1446]"
              onClick={handleStep1Next}
            >
              Next — Set Up Rounds <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — Rounds & Prizes
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <>
          {/* ── Rounds ── */}
          <Card>
            <CardHeader>
              <CardTitle>Game Rounds ({rounds.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible defaultValue="round-0" className="divide-y">
                {rounds.map((round, i) => (
                  <AccordionItem key={i} value={`round-${i}`} className="border-0">
                    <AccordionTrigger className="px-5 py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-[#5B1A57]/10 text-[#5B1A57] text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-sm">
                          {round.title || `Round ${i + 1}`}
                        </span>
                        {round.data && (Array.isArray(round.data) ? round.data.length > 0 : Object.keys(round.data).length > 0) && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            ✓ Content set
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 space-y-4">
                      {/* Round title & description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Round Title</Label>
                          <Input
                            value={round.title}
                            onChange={(e) => updateRound(i, "title", e.target.value)}
                            placeholder={`Round ${i + 1} — General Knowledge`}
                            className="h-10 rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Textarea
                            value={round.description}
                            onChange={(e) => updateRound(i, "description", e.target.value)}
                            rows={2}
                            className="resize-none rounded-lg"
                            placeholder="Answer as fast as you can!"
                          />
                        </div>
                      </div>

                      {/* Game type picker */}
                      <div className="flex flex-col gap-2">
                        <Label>Choose Game Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {GAME_TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                updateRound(i, "gameType", opt.value);
                                updateRound(i, "data", []); // reset data on type change
                              }}
                              className={cn(
                                "flex flex-col items-start gap-0.5 rounded-xl border-2 p-3 text-left transition-all",
                                round.gameType === opt.value
                                  ? "border-[#5B1A57] bg-[#5B1A57]/5"
                                  : "border-gray-200 hover:border-[#5B1A57]/40"
                              )}
                            >
                              <span className="text-sm font-semibold">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content generator for selected type */}
                      <GameContentGenerator
                        selectedGame={round.gameType}
                        gameType={round.gameType}
                        gameName={round.title}
                        initialData={round.data}
                        onGenerated={(data) => updateRound(i, "data", data)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* ── Winner Prizes ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#5B1A57]" />
                Cash Prizes for {maxWinners} Winner{maxWinners !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prizes.map((prize, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border p-4">
                  {/* Rank badge */}
                  <div className="h-9 w-9 rounded-full bg-[#5B1A57]/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#5B1A57]">{ORDINALS[i] ?? `${i + 1}th`}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Prize Title</Label>
                      <Input
                        value={prize.title}
                        onChange={(e) => updatePrize(i, "title", e.target.value)}
                        className="h-9 rounded-lg text-sm"
                        placeholder={`${ORDINALS[i]} Place Winner`}
                      />
                    </div>

                    {/* Cash Amount */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">
                        Cash Amount <span className="text-muted-foreground">({priceCurrency})</span>
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={prize.value}
                        onChange={(e) => updatePrize(i, "value", e.target.value)}
                        className={cn(
                          "h-9 rounded-lg text-sm",
                          (!prize.value || Number(prize.value) <= 0) && "border-destructive"
                        )}
                        placeholder="e.g. 10000"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Description <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        value={prize.description}
                        onChange={(e) => updatePrize(i, "description", e.target.value)}
                        className="h-9 rounded-lg text-sm"
                        placeholder="Prize for the top performer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Actions ── */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-lg"
              onClick={() => setStep(1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 h-11 rounded-lg bg-[#5B1A57] hover:bg-[#4a1446]"
              onClick={handleSave}
            >
              Save & Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
