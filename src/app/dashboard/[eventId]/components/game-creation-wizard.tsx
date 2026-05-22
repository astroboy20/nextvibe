/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  HelpCircle,
  Puzzle,
  MessageSquare,
  Zap,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import StepOne from "./game-steps/step-one";
import StepTwo from "./game-steps/step-two";
import StepThree from "./game-steps/step-three";
import StepFour from "./game-steps/step-four";
import StepFive from "./game-steps/step-five";
import StepSix from "./game-steps/step-six";
import { useCreateGameMutation } from "@/app/provider/api/eventApi";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useBeforeUnload } from "@/hooks/use-before-unload";

export type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
export type GameTypeOrEmpty = "" | GameType;
export type ApiGameType = "TRIVIA" | "WORD_PUZZLE" | "TWO_TRUTHS_ONE_LIE" | "THIS_OR_THAT";
export type EventPhase = "pre-event" | "main-event" | "post-event" | "both";
type ContentMode = "ai" | "manual";
export type ScheduleMode = "daily" | "weekly" | "concurrent";
export type RewardType =
  | "CASH"
  | "COUPON"
  | "MERCHANDISE"
  | "FREE_TICKET"
  | "BADGE"
  | "POINTS"
  | "OTHER";
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface RewardTier {
  id: string;
  rank: number;
  type: RewardType;
  title: string;
  description: string;
  value: string;
  discountType: DiscountType;
  discountValue: number;
  usageLimit: number;
  expiryDate: string;
  quantity: number;
}

export interface Question {
  id: string;
  // TRIVIA / TWO_TRUTHS / THIS_OR_THAT
  question: string;
  options?: string[];
  correctIndex?: number; // TRIVIA: index of correct option; TWO_TRUTHS: index of the lie
  correctAnswer?: string; // derived from options[correctIndex] on submit
  // WORD_PUZZLE
  clue?: string; // the hint shown to players
  // shared
  points?: number;
  timeLimitSecs: number;
}

export interface RoundData {
  gameType: GameType;
  title: string;
  description: string;
  questions: Question[];
}

const PHASE_TO_API: Record<EventPhase, string> = {
  "pre-event": "PRE_EVENT",
  "main-event": "DURING_EVENT",
  "post-event": "POST_EVENT",
  both: "BOTH",
};

const SCHEDULE_TO_API: Record<ScheduleMode, string> = {
  concurrent: "ALL_AT_ONCE",
  daily: "DAILY",
  weekly: "WEEKLY",
};

const GAMETYPE_TO_API: Record<GameType, ApiGameType> = {
  trivia: "TRIVIA",
  "word-puzzle": "WORD_PUZZLE",
  "two-truths": "TWO_TRUTHS_ONE_LIE",
  "this-or-that": "THIS_OR_THAT",
};

export const gameTypeConfig: Record<
  GameType,
  { icon: React.ReactNode; label: string; description: string }
> = {
  trivia: {
    icon: <HelpCircle className="h-5 w-5" />,
    label: "Trivia",
    description: "Multiple choice questions",
  },
  "word-puzzle": {
    icon: <Puzzle className="h-5 w-5" />,
    label: "Word Puzzle",
    description: "Find words from letters",
  },
  "two-truths": {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "2 Truths & 1 Lie",
    description: "Guess the lie",
  },
  "this-or-that": {
    icon: <Zap className="h-5 w-5" />,
    label: "This or That",
    description: "Choose between options",
  },
};

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

const STORAGE_KEY = "gameWizardState";
const clearSaved = () => {
  if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
};

interface GameCreationWizardProps {
  onComplete: (game: any) => void;
  onCancel: () => void;
  eventId: string;
  eventName: string;
  eventStartsAt?: string;
}

export function GameCreationWizard({
  onCancel,
  eventId,
  eventName,
  eventStartsAt,
}: GameCreationWizardProps) {
  const totalSteps = 6;
  const [createGame] = useCreateGameMutation();

  const gameEndsAt = eventStartsAt
    ? new Date(new Date(eventStartsAt).getTime() - 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : "";
  const maxStartsAt = gameEndsAt;

  const [step, setStep] = useState<number>(1);
  const [gameName, setGameName] = useState<string>("");
  const [numberOfRounds, setNumberOfRounds] = useState<number>(1);
  const [phase, setPhase] = useState<EventPhase>("main-event");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("concurrent");
  const [startsAt, setStartsAt] = useState<string>("");
  const [gameDuration, setGameDuration] = useState<number>(30);
  const [repetitions, setRepetitions] = useState<number>(1);
  const [maxWinners, setMaxWinners] = useState<number>(3);
  const [priceCurrency] = useState("NGN");
  const [activeRoundIdx, setActiveRoundIdx] = useState<number>(0);
  const [contentMode, setContentMode] = useState<ContentMode>("ai");
  const [aiPrompt, setAiPrompt] = useState<{
    topic: string;
    count: number | null;
    gameType: ApiGameType | "";
    difficulty: string;
    activityTiming: "" | "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH";
    eventName: string;
  }>({
    topic: "",
    count: null,
    gameType: "TRIVIA",
    difficulty: "",
    activityTiming: "",
    eventName,
  });
  const [roundsData, setRoundsData] = useState<RoundData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);

  const accessToken = Cookies.get("accessToken");
  const progress = (step / totalSteps) * 100;
  const [validationError, setValidationError] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useBeforeUnload(!isDone && (step > 1 || gameName.trim().length > 0));

  // Current round being configured
  const currentRound: RoundData | undefined = roundsData[activeRoundIdx];

  // ── Helpers ────────────────────────────────────────────────────────────────
  const buildInitialRoundsData = (): RoundData[] =>
    Array.from({ length: numberOfRounds }, (_, i) => ({
      gameType: roundsData[i]?.gameType ?? "trivia",
      title: roundsData[i]?.title ?? `Round ${i + 1}`,
      description: roundsData[i]?.description ?? "",
      questions: roundsData[i]?.questions ?? [],
    }));

  const updateRoundGameType = (idx: number, type: GameType) => {
    setRoundsData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], gameType: type, questions: [] };
      return next;
    });
    setAiPrompt((prev) => ({ ...prev, gameType: GAMETYPE_TO_API[type] }));
  };

  const updateRoundMeta = (
    idx: number,
    field: "title" | "description",
    value: string
  ) => {
    setRoundsData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const setRoundQuestions = (idx: number, questions: Question[]) => {
    setRoundsData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], questions };
      return next;
    });
  };

  const buildRewardTiers = (count: number): RewardTier[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `tier-${i + 1}`,
      rank: i + 1,
      type: "CASH" as RewardType,
      title:
        rewardTiers[i]?.title ?? `${ORDINALS[i] ?? `${i + 1}th`} Place Winner`,
      description:
        rewardTiers[i]?.description ?? "Prize for the top performer.",
      value: rewardTiers[i]?.value ?? "",
      discountType: "PERCENTAGE" as DiscountType,
      discountValue: rewardTiers[i]?.discountValue ?? 0,
      usageLimit: rewardTiers[i]?.usageLimit ?? 100,
      expiryDate: rewardTiers[i]?.expiryDate ?? "",
      quantity: rewardTiers[i]?.quantity ?? 1,
    }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep = (s: number): string => {
    switch (s) {
      case 1:
        if (!gameName.trim()) return "Please enter a game name.";
        if (numberOfRounds < 1 || numberOfRounds > 10)
          return "Rounds must be between 1 and 10.";
        return "";
      case 2:
        if (!startsAt) return "Please set a start date and time.";
        if (gameEndsAt && new Date(startsAt) >= new Date(gameEndsAt))
          return "Game must start before the event begins.";
        if (gameDuration <= 0) return "Please select a game duration.";
        if (maxWinners <= 0) return "Please set the number of winners.";
        return "";
      case 3:
        if (contentMode === "ai") {
          if (!aiPrompt.topic.trim())
            return "Please enter a topic for AI generation.";
          if (!aiPrompt.count || aiPrompt.count <= 0)
            return "Please enter a valid question count.";
          if (!aiPrompt.gameType) return "Please select a game type.";
          if (!aiPrompt.difficulty) return "Please select a difficulty level.";
          // activityTiming is always derived from phase — no need to validate it here
        }
        return "";
      case 4:
        // Only validate the current round being edited
        if (!roundsData[activeRoundIdx]?.questions?.length)
          return `Round ${
            activeRoundIdx + 1
          } has no questions. Please add or generate content.`;
        for (const q of roundsData[activeRoundIdx].questions) {
          if (!q.question.trim())
            return `Round ${activeRoundIdx + 1}: all questions must have text.`;
          if (q.options?.some((o) => !o.trim()))
            return `Round ${
              activeRoundIdx + 1
            }: all answer options must be filled in.`;
        }
        return "";
      case 5:
        for (const tier of rewardTiers) {
          if (!tier.title.trim())
            return `Reward tier #${tier.rank} needs a title.`;
          if (!tier.value)
            return `Set a prize value for the ${
              ORDINALS[tier.rank - 1] ?? `${tier.rank}th`
            } place winner.`;
          if (
            (tier.type === "CASH" || tier.type === "POINTS") &&
            Number(tier.value) <= 0
          )
            return `${
              ORDINALS[tier.rank - 1] ?? `${tier.rank}th`
            } place: enter a valid amount.`;
        }
        return "";
      default:
        return "";
    }
  };

  // ── AI generation ──────────────────────────────────────────────────────────
  const generateQuestionsWithAI = async (roundIdx: number = activeRoundIdx) => {
    // Always derive activityTiming from the selected phase — don't rely on aiPrompt state
    const timingMap: Record<EventPhase, string> = {
      "pre-event": "PRE_EVENT",
      "main-event": "DURING_EVENT",
      "post-event": "POST_EVENT",
      both: "BOTH",
    };
    const resolvedTiming = timingMap[phase] as
      | "PRE_EVENT"
      | "DURING_EVENT"
      | "POST_EVENT"
      | "BOTH";
    const promptToSend = { ...aiPrompt, activityTiming: resolvedTiming };

    // Validate with the resolved prompt
    const validationErrors: string[] = [];
    if (!promptToSend.topic.trim())
      validationErrors.push("Please enter a topic for AI generation.");
    if (!promptToSend.count || promptToSend.count <= 0)
      validationErrors.push("Please enter a valid question count.");
    if (!promptToSend.gameType)
      validationErrors.push("Please select a game type.");
    if (!promptToSend.difficulty)
      validationErrors.push("Please select a difficulty level.");
    if (validationErrors.length) {
      const err = validationErrors[0];
      toast.error(err);
      setValidationError(err);
      return;
    }
    setValidationError("");
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/games/ai/generate-draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(promptToSend),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.message || "AI generation failed");

      // Actual response shape:
      // { success, data: { success, data: { suggestedTitle, suggestedDescription, rounds: [{ title, questions: [...] }] } } }
      const inner = data?.data?.data ?? data?.data ?? data;

      // Questions can be at inner.questions (flat) or inner.rounds[roundIdx].questions (nested)
      const rawQuestions: any[] =
        inner?.rounds?.[0]?.questions ?? inner?.questions ?? [];

      if (!rawQuestions.length)
        throw new Error("AI returned no questions. Try a different topic.");

      const gameType = roundsData[roundIdx]?.gameType ?? "trivia";

      const generated: Question[] = rawQuestions.map((q: any, i: number) => {
        const base = {
          id: `q-${roundIdx}-${i + 1}`,
          timeLimitSecs: q.timeLimitSecs ?? 15,
          points: q.points ?? 10,
        };

        if (gameType === "word-puzzle") {
          return {
            ...base,
            question: q.clue ?? q.text ?? q.question ?? "",
            clue: q.clue ?? q.text ?? q.question ?? "",
            correctAnswer: q.correctAnswer ?? q.answer ?? "",
            options: undefined,
          };
        }

        if (gameType === "two-truths") {
          const options: string[] = q.options ?? [];
          // Backend now returns correctAnswerIndex directly (references the lie)
          const lieIndex =
            q.correctAnswerIndex ??
            options.findIndex(
              (o) =>
                o.toLowerCase().trim() ===
                (q.correctAnswer ?? q.answer ?? "").toLowerCase().trim()
            );
          const resolvedLieIndex = lieIndex >= 0 ? lieIndex : 0;
          return {
            ...base,
            question: q.text ?? q.question ?? "",
            options,
            correctIndex: resolvedLieIndex,
            correctAnswer: options[resolvedLieIndex] ?? q.correctAnswer ?? "",
          };
        }

        // THIS_OR_THAT — opinion poll, no correct answer
        if (gameType === "this-or-that") {
          return {
            ...base,
            question: q.text ?? q.question ?? "",
            options: q.options ?? [],
            correctIndex: undefined,
            correctAnswer: undefined,
          };
        }

        // TRIVIA — backend now returns correctAnswerIndex (0–3) directly
        const options: string[] = q.options ?? [];
        const correctAnswerIndex =
          q.correctAnswerIndex ??
          options.findIndex(
            (o) =>
              o.toLowerCase().trim() ===
              (q.correctAnswer ?? "").toLowerCase().trim()
          );
        const correctIdx = correctAnswerIndex >= 0 ? correctAnswerIndex : 0;
        return {
          ...base,
          question: q.text ?? q.question ?? "",
          options,
          correctIndex: correctIdx,
          correctAnswer: options[correctIdx] ?? q.correctAnswer ?? "",
        };
      });
      setRoundQuestions(roundIdx, generated);
      setStep(4);
    } catch (err: any) {
      toast.error(err?.message || "AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQuestion = async (id: string) => {
    const q = currentRound?.questions.find((q) => q.id === id);
    if (!q) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/games/ai/generate-draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ ...aiPrompt, count: 1 }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message);
      const inner = data?.data?.data ?? data?.data ?? data;
      const rawQuestions: any[] =
        inner?.rounds?.[0]?.questions ?? inner?.questions ?? [];
      const replacement = rawQuestions[0];
      if (!replacement) throw new Error("No replacement question returned.");
      setRoundQuestions(
        activeRoundIdx,
        currentRound!.questions.map((q) =>
          q.id === id
            ? {
                ...q,
                question:
                  replacement?.question ?? replacement?.text ?? q.question,
                clue: replacement?.clue ?? replacement?.text ?? q.clue,
                correctAnswer: replacement?.correctAnswer ?? q.correctAnswer,
                options: replacement?.options ?? q.options,
                correctIndex:
                  replacement?.correctAnswerIndex ??
                  replacement?.correctIndex ??
                  q.correctIndex,
                timeLimitSecs: replacement?.timeLimitSecs ?? q.timeLimitSecs,
              }
            : q
        )
      );
    } catch {
      toast.error("Could not regenerate question. Please edit it manually.");
    }
  };

  const handleQuestionEdit = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setRoundsData((prev) => {
      const next = [...prev];
      const current = next[activeRoundIdx];
      next[activeRoundIdx] = {
        ...current,
        questions: current.questions.map((q) => {
          if (q.id !== id) return q;
          if (field === "question")
            return { ...q, question: value as string, clue: value as string };
          if (field === "clue")
            return { ...q, clue: value as string, question: value as string };
          if (field === "correctAnswer")
            return { ...q, correctAnswer: value as string };
          if (field === "correctIndex") {
            // Keep correctAnswer in sync with the selected option
            const newIdx = value as number;
            const newAnswer = q.options?.[newIdx] ?? "";
            return { ...q, correctIndex: newIdx, correctAnswer: newAnswer };
          }
          if (field === "timeLimitSecs")
            return { ...q, timeLimitSecs: value as number };
          if (field === "points") return { ...q, points: value as number };
          return q;
        }),
      };
      return next;
    });
  };

  const handleOptionEdit = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setRoundsData((prev) => {
      const next = [...prev];
      const current = next[activeRoundIdx];
      next[activeRoundIdx] = {
        ...current,
        questions: current.questions.map((q) => {
          if (q.id !== questionId || !q.options) return q;
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          // Keep correctAnswer in sync if the correct option text changed
          const newCorrectAnswer =
            newOptions[q.correctIndex ?? 0] ?? q.correctAnswer;
          return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
        }),
      };
      return next;
    });
  };

  const updateRewardTier = (
    id: string,
    field: keyof RewardTier,
    value: string | number
  ) => {
    setRewardTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const rewardTierPayload = rewardTiers.map(({ id: _id, ...tier }) => ({
        rank: tier.rank,
        type: tier.type,
        title:
          tier.title ||
          `${
            tier.rank === 1
              ? "1st"
              : tier.rank === 2
              ? "2nd"
              : tier.rank === 3
              ? "3rd"
              : `${tier.rank}th`
          } Place Winner`,
        description: tier.description || "Prize for the top performer.",
        value: tier.value,
        ...(tier.type === "COUPON" && {
          discountType: tier.discountType,
          discountValue: tier.discountValue,
          usageLimit: tier.usageLimit,
          expiryDate: tier.expiryDate
            ? new Date(tier.expiryDate).toISOString()
            : undefined,
        }),
        quantity: tier.quantity,
      }));

      const payload = {
        title: gameName,
        scheduleType: SCHEDULE_TO_API[scheduleMode],
        priceCurrency,
        repetitions,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: gameEndsAt ? new Date(gameEndsAt).toISOString() : undefined,
        activityTiming: PHASE_TO_API[phase],
        maxWinners,
        gameDuration,
        basePrice: 0,
        perRoundPrice: 0,
        rewardTiers: rewardTierPayload,
        rounds: roundsData.map((r, i) => {
          // Build the config.questions array in the shape the backend expects
          const configQuestions = r.questions.map((q) => {
            if (r.gameType === "word-puzzle") {
              return {
                text: q.clue ?? q.question,
                correctAnswer: q.correctAnswer ?? "",
                points: q.points ?? 10,
                timeLimitSecs: q.timeLimitSecs,
              };
            }
            // TRIVIA / TWO_TRUTHS_ONE_LIE / THIS_OR_THAT
            // Backend uses correctIndex (number) for index-based scoring
            const options: string[] = q.options ?? [];
            const correctIndex =
              q.correctIndex !== undefined
                ? q.correctIndex
                : options.findIndex(
                    (o) =>
                      o.toLowerCase().trim() ===
                      (q.correctAnswer ?? "").toLowerCase().trim()
                  );
            return {
              text: q.question,
              options,
              correctIndex: correctIndex >= 0 ? correctIndex : 0,
              points: q.points ?? 10,
              timeLimitSecs: q.timeLimitSecs,
            };
          });

          return {
            title: r.title || `Round ${i + 1}`,
            description: r.description,
            gameType: GAMETYPE_TO_API[r.gameType],
            orderIndex: i,
            config: { questions: configQuestions },
            rewardTiers: rewardTierPayload,
          };
        }),
      };

      await createGame({ eventId, body: payload }).unwrap();

      toast.success("Game created successfully!");
      setIsDone(true);
      clearSaved();
      onCancel();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      setValidationError(err);
      return;
    }
    setValidationError("");

    if (step === 1) {
      // Initialise rounds data when moving from step 1
      setRoundsData(buildInitialRoundsData());
      setActiveRoundIdx(0);
      setStep(2);
      return;
    }

    if (step === 2) {
      // Initialise reward tiers based on maxWinners
      setRewardTiers(buildRewardTiers(maxWinners));
      // Sync activityTiming and gameType from current round so AI prompt is pre-filled
      const timingMap: Record<EventPhase, string> = {
        "pre-event": "PRE_EVENT",
        "main-event": "DURING_EVENT",
        "post-event": "POST_EVENT",
        both: "BOTH",
      };
      const firstRoundType = roundsData[0]?.gameType ?? "trivia";
      setAiPrompt((prev) => ({
        ...prev,
        activityTiming: timingMap[phase] as any,
        gameType: GAMETYPE_TO_API[firstRoundType],
      }));
      setStep(3);
      return;
    }

    if (step === 3 && contentMode === "ai") {
      generateQuestionsWithAI(activeRoundIdx);
      return;
    }

    if (step === 3 && contentMode === "manual") {
      // Only initialize empty questions if none exist yet for this round
      if (!roundsData[activeRoundIdx]?.questions?.length) {
        setRoundQuestions(activeRoundIdx, []);
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      // If there are more rounds to configure, stay on steps 3+4 for next round
      const nextRound = activeRoundIdx + 1;
      if (nextRound < numberOfRounds) {
        setActiveRoundIdx(nextRound);
        // Sync aiPrompt gameType to next round's type — keep activityTiming from phase
        const nextType = roundsData[nextRound]?.gameType ?? "trivia";
        setAiPrompt((prev) => ({
          ...prev,
          gameType: GAMETYPE_TO_API[nextType],
          topic: "",
          count: null,
          difficulty: "",
        }));
        setStep(3);
        return;
      }
      // All rounds done → go to prizes
      setStep(5);
      return;
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setValidationError("");
    if (step === 4 && activeRoundIdx > 0) {
      // Go back to previous round's questions
      setActiveRoundIdx((i) => i - 1);
      setStep(4);
      return;
    }
    if (step === 3 && activeRoundIdx > 0) {
      setActiveRoundIdx((i) => i - 1);
      setStep(4);
      return;
    }
    setStep((s) => s - 1);
  };

  const stepLabel = [
    "Basic Info",
    "Schedule & Pricing",
    `Round ${activeRoundIdx + 1} of ${numberOfRounds} — Content`,
    `Round ${activeRoundIdx + 1} of ${numberOfRounds} — Questions`,
    "Cash Prizes",
    "Preview",
  ][step - 1];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step} of {totalSteps}
          </span>
          <span className="text-muted-foreground">{stepLabel}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {validationError}
        </div>
      )}

      {/* Steps */}
      {step === 1 && (
        <StepOne
          gameName={gameName}
          setGameName={setGameName}
          numberOfRounds={numberOfRounds}
          setNumberOfRounds={setNumberOfRounds}
        />
      )}
      {step === 2 && (
        <StepTwo
          phase={phase}
          setPhase={setPhase}
          startsAt={startsAt}
          setStartsAt={setStartsAt}
          maxStartsAt={maxStartsAt}
          gameEndsAt={gameEndsAt}
          repetitions={repetitions}
          setRepetitions={setRepetitions}
          gameDuration={gameDuration}
          setGameDuration={setGameDuration}
          maxWinners={maxWinners}
          setMaxWinners={setMaxWinners}
          scheduleMode={scheduleMode}
          setScheduleMode={setScheduleMode}
        />
      )}
      {step === 3 && (
        <StepThree
          roundIndex={activeRoundIdx}
          totalRounds={numberOfRounds}
          roundTitle={roundsData[activeRoundIdx]?.title ?? ""}
          roundDescription={roundsData[activeRoundIdx]?.description ?? ""}
          onRoundTitleChange={(v) =>
            updateRoundMeta(activeRoundIdx, "title", v)
          }
          onRoundDescriptionChange={(v) =>
            updateRoundMeta(activeRoundIdx, "description", v)
          }
          selectedGameType={roundsData[activeRoundIdx]?.gameType ?? "trivia"}
          onGameTypeChange={(type) => updateRoundGameType(activeRoundIdx, type)}
          contentMode={contentMode}
          setContentMode={(v) => setContentMode(v as ContentMode)}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
        />
      )}
      {step === 4 && (
        <StepFour
          roundIndex={activeRoundIdx}
          totalRounds={numberOfRounds}
          roundTitle={roundsData[activeRoundIdx]?.title ?? ""}
          contentMode={contentMode}
          questions={currentRound?.questions ?? []}
          generateQuestionsWithAI={() =>
            generateQuestionsWithAI(activeRoundIdx)
          }
          editingQuestion={editingQuestion}
          handleQuestionEdit={handleQuestionEdit}
          handleOptionEdit={handleOptionEdit}
          setEditingQuestion={setEditingQuestion}
          regenerateQuestion={regenerateQuestion}
          gameType={currentRound?.gameType ?? "trivia"}
          setQuestions={(
            qs: Question[] | ((prev: Question[]) => Question[])
          ) => {
            setRoundsData((prev) => {
              const next = [...prev];
              const current = next[activeRoundIdx] ?? {
                gameType: "trivia",
                title: "",
                description: "",
                questions: [],
              };
              const resolved =
                typeof qs === "function" ? qs(current.questions) : qs;
              next[activeRoundIdx] = { ...current, questions: resolved };
              return next;
            });
          }}
        />
      )}
      {step === 5 && (
        <StepFive
          rewardTiers={rewardTiers}
          updateRewardTier={updateRewardTier}
          priceCurrency={priceCurrency}
        />
      )}
      {step === 6 && (
        <StepSix
          gameName={gameName}
          phase={phase}
          startsAt={startsAt}
          endsAt={gameEndsAt}
          rounds={numberOfRounds}
          roundsData={roundsData}
          gameDuration={gameDuration}
          maxWinners={maxWinners}
          priceCurrency={priceCurrency}
          scheduleMode={scheduleMode}
          contentMode={contentMode}
          repetitions={repetitions}
          rewardTiers={rewardTiers}
          handleComplete={handleComplete}
          isLoading={isLoading}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-border">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setIsDone(true);
              clearSaved();
              onCancel();
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        )}

        {step < totalSteps && (
          <Button
            onClick={handleNext}
            disabled={isGenerating}
            className="flex-1 gap-1.5 bg-[#531342] hover:bg-[#531342]/90 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : step === 3 && contentMode === "ai" ? (
              <>
                <Sparkles className="h-4 w-4" /> Generate Questions
              </>
            ) : step === 4 && activeRoundIdx + 1 < numberOfRounds ? (
              <>
                Next Round <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
