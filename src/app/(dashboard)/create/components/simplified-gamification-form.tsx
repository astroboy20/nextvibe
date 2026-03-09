"use client";

import { useState } from "react";

import { useCreateCouponMutation } from "@/app/provider/api/couponApi";
import {
  GamePrize,
  IGame,
  ScheduleType,
  EventGamificationType,
  GameType,
} from "@/types/game.type";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { GameContentGenerator } from "./game/game-content-generator";

interface SimplifiedGamificationFormProps {
  eventGamificationType: EventGamificationType;
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  eventStartDate?: string;
  eventEndDate?: string;
}

export function SimplifiedGamificationForm({
  eventGamificationType,
  onNext,
  onBack,
  initialData,
  eventStartDate,
  eventEndDate,
}: SimplifiedGamificationFormProps) {
  const [schedule, setSchedule] = useState<ScheduleType>(
    initialData?.schedule || "concurrent"
  );
  const [startDay, setStartDay] = useState<Date | null>(
    initialData?.startDay
      ? new Date(initialData.startDay)
      : eventStartDate
      ? new Date(eventStartDate)
      : null
  );
  const [endDay, setEndDay] = useState<Date | null>(
    initialData?.endDay
      ? new Date(initialData.endDay)
      : eventEndDate
      ? new Date(eventEndDate)
      : null
  );
  const [startTime, setStartTime] = useState(initialData?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initialData?.endTime || "18:00");
  const [numberOfRepetitions, setNumberOfRepetitions] = useState(
    initialData?.numberOfRepetitions || 1
  );
  const [maxNoOfWinners, setMaxNoOfWinners] = useState(
    initialData?.maxNoOfWinners || 10
  );
  const [prizes, setPrizes] = useState<GamePrize[]>(initialData?.prizes || []);
  const [games, setGames] = useState<IGame[]>(initialData?.games || []);
  const [selectedGame, setSelectedGame] = useState<GameType>("trivia");
  const [gameName, setGameName] = useState("");
  const [createCoupon] = useCreateCouponMutation();

  const addPrize = () => {
    setPrizes([
      ...prizes,
      {
        position: prizes.length + 1,
        prizeType: "coupon",
        prize: "",
        couponConfig: {
          discountType: "percentage",
          discountValue: 10,
          expiresAt: "",
          usageLimit: 1,
        },
      },
    ]);
  };

  const updatePrize = (
    index: number,
    field: keyof GamePrize | "couponConfig",
    value: any
  ) => {
    const updated = [...prizes];
    if (field === "couponConfig") {
      updated[index] = {
        ...updated[index],
        couponConfig: { ...updated[index].couponConfig, ...value },
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPrizes(updated);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const addGame = () => {
    setGames([
      ...games,
      {
        gameType: "trivia",
        state: "active",
        duration: 300,
        startDay: startDay || new Date(),
        startTime: "00:00",
        name: "",
        description: "",
        data: [],
      },
    ]);
  };

  const updateGame = (index: number, field: keyof IGame, value: any) => {
    const updated = [...games];
    updated[index] = { ...updated[index], [field]: value };
    setGames(updated);
  };

  const removeGame = (index: number) => {
    setGames(games.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!startDay || !endDay) {
      toast.error("Start and end dates are required");
      return;
    }
    if (!startTime || !endTime) {
      toast.error("Start and end times are required");
      return;
    }
    if (games.length === 0) {
      toast.error("At least one game is required");
      return;
    }

    for (let i = 0; i < games.length; i++) {
      const gameData = games[i].data;
      const isEmpty =
        !gameData ||
        (Array.isArray(gameData) && gameData.length === 0) ||
        (typeof gameData === "object" && Object.keys(gameData).length === 0);
      if (isEmpty) {
        toast.error(
          `Game ${i + 1} is missing content. Please generate content.`
        );
        return;
      }
    }

    const updatedPrizes = await Promise.all(
      prizes.map(async (prize) => {
        if (prize.prizeType === "coupon" && prize.couponConfig) {
          try {
            const couponInput = {
              discountType: prize.couponConfig.discountType as
                | "fixed"
                | "percentage",
              discountValue: Number(prize.couponConfig.discountValue),
              expiresAt: prize.couponConfig.expiresAt,
              usageLimit: Number(prize.couponConfig.usageLimit),
            };
            const res = await createCoupon(couponInput).unwrap();
            return { ...prize, prize: res.data.code };
          } catch (e) {
            toast.error("Failed to create coupon");
            return prize;
          }
        }
        return prize;
      })
    );

    const gameData = {
      eventGamificationType,
      schedule,
      startDay,
      endDay,
      startTime,
      endTime,
      numberOfRepetitions,
      maxNoOfWinners,
      prizes: updatedPrizes,
      games,
    };
    onNext(gameData);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Basic Settings ── */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schedule Type */}
          <div className="flex flex-col gap-1.5">
            <Label>Schedule Type</Label>
            <Select
              value={schedule}
              onValueChange={(v) => setSchedule(v as ScheduleType)}
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concurrent">
                  Concurrent (All games at once)
                </SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Repetitions */}
          <div className="flex flex-col gap-1.5">
            <Label>Number of Repetitions</Label>
            <Input
              type="number"
              min={1}
              value={numberOfRepetitions}
              onChange={(e) => setNumberOfRepetitions(Number(e.target.value))}
              className="h-10 rounded-lg"
            />
          </div>

          {/* Start Date & Time */}
          <div className="flex flex-col gap-1.5">
            <Label>Start Date & Time</Label>
            <DateTimePicker value={startDay} onChange={setStartDay} />
          </div>

          {/* End Date & Time */}
          <div className="flex flex-col gap-1.5">
            <Label>End Date & Time</Label>
            <DateTimePicker value={endDay} onChange={setEndDay} />
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-1.5">
            <Label>Start Time (HH:mm)</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col gap-1.5">
            <Label>End Time (HH:mm)</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>

          {/* Max Winners */}
          <div className="flex flex-col gap-1.5">
            <Label>Max Number of Winners</Label>
            <Input
              type="number"
              min={1}
              value={maxNoOfWinners}
              onChange={(e) => setMaxNoOfWinners(Number(e.target.value))}
              className="h-10 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Prizes ── */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Prizes</CardTitle>
          <Button size="sm" variant="outline" onClick={addPrize}>
            <Plus size={16} className="mr-1.5" />
            Add Prize
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {prizes.length === 0 && (
            <p className="text-gray-400 text-sm">No prizes added yet.</p>
          )}
          {prizes.map((prize, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-3 rounded-lg"
            >
              {/* Position */}
              <div className="md:col-span-1 flex flex-col gap-1.5">
                <Label>Position</Label>
                <Input
                  type="number"
                  min={1}
                  value={prize.position}
                  onChange={(e) =>
                    updatePrize(i, "position", Number(e.target.value))
                  }
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Prize Type */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label>Prize Type</Label>
                <Select
                  value={prize.prizeType}
                  onValueChange={(v) => updatePrize(i, "prizeType", v)}
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Coupon config */}
              {prize.prizeType === "coupon" && (
                <div className="md:col-span-6 flex flex-wrap gap-2">
                  {/* Discount Type */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Discount Type</Label>
                    <Select
                      value={prize.couponConfig?.discountType || "percentage"}
                      onValueChange={(v) =>
                        updatePrize(i, "couponConfig", { discountType: v })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-lg w-36">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Discount Value */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      min={1}
                      value={prize.couponConfig?.discountValue || 10}
                      onChange={(e) =>
                        updatePrize(i, "couponConfig", {
                          discountValue: Number(e.target.value),
                        })
                      }
                      className="h-10 rounded-lg w-24"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Expiry Date</Label>
                    <DateTimePicker
                      value={
                        prize.couponConfig?.expiresAt
                          ? new Date(prize.couponConfig.expiresAt)
                          : new Date()
                      }
                      onChange={(d) =>
                        updatePrize(i, "couponConfig", {
                          expiresAt: d ? d.toISOString() : "",
                        })
                      }
                    />
                  </div>

                  {/* Usage Limit */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Usage Limit</Label>
                    <Input
                      type="number"
                      min={1}
                      value={prize.couponConfig?.usageLimit || 1}
                      onChange={(e) =>
                        updatePrize(i, "couponConfig", {
                          usageLimit: Number(e.target.value),
                        })
                      }
                      className="h-10 rounded-lg w-24"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label>Description</Label>
                <Input
                  value={prize.prize}
                  onChange={(e) => updatePrize(i, "prize", e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Remove */}
              <div className="md:col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removePrize(i)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Game Rounds ── */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Game Rounds</CardTitle>
          <Button size="sm" variant="outline" onClick={addGame}>
            <Plus size={16} className="mr-1.5" />
            Add Game Round
          </Button>
        </CardHeader>
        <CardContent>
          {games.length === 0 && (
            <p className="text-gray-400 text-sm">No games added yet.</p>
          )}
          <Accordion type="single" collapsible className="space-y-2">
            {games.map((game, i) => (
              <AccordionItem key={i} value={`game-${i}`}>
                <AccordionTrigger>
                  Game {i + 1}: {game.name || "Unnamed"}
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Game Name */}
                    <div className="flex flex-col gap-1.5">
                      <Label>Game Name</Label>
                      <Input
                        value={game.name}
                        onChange={(e) => {
                          setGameName(e.target.value);
                          updateGame(i, "name", e.target.value);
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>

                    {/* Game Type */}
                    <div className="flex flex-col gap-1.5">
                      <Label>Game Type</Label>
                      <Select
                        value={game.gameType}
                        onValueChange={(v) => {
                          updateGame(i, "gameType", v);
                          updateGame(i, "data", []);
                          setSelectedGame(v as GameType);
                        }}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue placeholder="Select game type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trivia">Trivia</SelectItem>
                          <SelectItem value="wordPuzzle">
                            Word Puzzle
                          </SelectItem>
                          <SelectItem value="thisOrThat">
                            This or That
                          </SelectItem>
                          <SelectItem value="twoTruthsOneLie">
                            Two Truths One Lie
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={game.description}
                        onChange={(e) =>
                          updateGame(i, "description", e.target.value)
                        }
                        rows={3}
                        className="resize-none rounded-lg"
                      />
                    </div>
                  </div>

                  <GameContentGenerator
                    selectedGame={selectedGame}
                    gameType={game.gameType}
                    gameName={game.name}
                    initialData={game.data}
                    onGenerated={(data) => updateGame(i, "data", data)}
                  />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeGame(i)}
                    className="gap-1.5"
                  >
                    <Trash2 size={14} />
                    Remove Game
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-2">
        <Button
          className="flex-1 bg-[#5B1A57] hover:bg-[#4a1446] h-11 rounded-lg"
          onClick={handleSave}
        >
          Save & Continue
        </Button>
        <Button
          className="flex-1 h-11 rounded-lg"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
