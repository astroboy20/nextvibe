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

// "" is excluded from the non-empty type used in maps/configs
export type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
export type GameTypeOrEmpty = "" | GameType;
export type EventPhase = "pre-event" | "main-event" | "post-event" | "both";
type ContentMode = "ai" | "manual";
export type ScheduleMode = "daily" | "weekly" | "concurrent";
export type RewardType =
  | "CASH"
  | "COUPON"
  | "FREE_TICKET"
  | "BADGE"
  | "POINTS"
  | "OTHERS";
export type DiscountType = "PERCENTAGE" | "FIXED";

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
  question: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
  timeLimitSecs: number;
}

const PHASE_TO_API: Record<EventPhase, string> = {
  "pre-event":  "PRE_EVENT",
  "main-event": "DURING_EVENT",
  "post-event": "POST_EVENT",
  both:         "BOTH",
};

const SCHEDULE_TO_API: Record<ScheduleMode, string> = {
  concurrent: "ALL_AT_ONCE",
  daily: "DAILY",
  weekly: "WEEKLY",
};

const GAMETYPE_TO_API: Record<GameType, string> = {
  trivia: "TRIVIA",
  "word-puzzle": "WORD_PUZZLE",
  "two-truths": "TWO_TRUTHS",
  "this-or-that": "THIS_OR_THAT",
};

// Map wizard hyphenated keys → StepThree underscored keys for AI prompt
const GAMETYPE_TO_AI_KEY: Record<GameType, GameTypeOrEmpty> = {
  trivia: "trivia",
  "word-puzzle": "word-puzzle",
  "two-truths": "two-truths",
  "this-or-that": "this-or-that",
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

interface GameCreationWizardProps {
  onComplete: (game: any) => void;
  onCancel: () => void;
  eventId: string;
  eventName: string;
  eventStartsAt?: string; // ISO string from the event — used to constrain game dates
}

export function GameCreationWizard({
  onCancel,
  eventId,
  eventName,
  eventStartsAt,
}: GameCreationWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Derive the game's hard end time: 1 minute before the event starts
  const gameEndsAt = eventStartsAt
    ? new Date(new Date(eventStartsAt).getTime() - 60 * 1000)
        .toISOString()
        .slice(0, 16) // "YYYY-MM-DDTHH:mm" for datetime-local
    : "";

  // The latest the game can start: also before the event (same ceiling)
  const maxStartsAt = gameEndsAt;

  // Step 1 — Basic Info
  const [gameName, setGameName] = useState("");
  const [gameType, setGameType] = useState<GameType>("trivia");

  // Step 2 — Schedule & Pricing
  const [phase, setPhase] = useState<EventPhase>("main-event");
  const [rounds, setRounds] = useState(3);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("concurrent");
  const [startsAt, setStartsAt] = useState("");
  const [gameDuration, setGameDuration] = useState(30);
  const [maxWinners, setMaxWinners] = useState(3);
  const [basePrice, setBasePrice] = useState(0);
  const [perRoundPrice, setPerRoundPrice] = useState(0);
  const [priceCurrency] = useState("NGN");

  // Step 3 — Content Mode
  const [contentMode, setContentMode] = useState<ContentMode>("ai");
  const [aiPrompt, setAiPrompt] = useState<{
    topic: string;
    count: number | null;
    gameType: GameTypeOrEmpty;
    difficulty: string;
    activityTiming: "" | "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH";
    eventName: string;
  }>({
    topic: "",
    count: null as number | null,
    gameType: GAMETYPE_TO_AI_KEY[gameType],
    difficulty: "",
    activityTiming: "" as "" | "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH",
    eventName,
  });

  // Step 4 — Questions
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  // Step 5 — Reward Tiers
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);

  const [createGameMutation, { isLoading }] = useCreateGameMutation();
  const progress = (step / totalSteps) * 100;
  const accessToken = Cookies.get("accessToken");

  // ─── Validation per step ────────────────────────────────────────────────────
  const [validationError, setValidationError] = useState("");

  const validateStep = (s: number): string => {
    switch (s) {
      case 1:
        if (!gameName.trim()) return "Please enter a game name.";
        if (!gameType) return "Please select a game type.";
        return "";
      case 2:
        if (!startsAt) return "Please set a start date and time.";
        if (gameEndsAt && new Date(startsAt) >= new Date(gameEndsAt))
          return "Game must start before the event begins.";
        if (gameDuration <= 0) return "Please select a game duration.";
        if (maxWinners <= 0) return "Please select the number of max winners.";
        return "";
      case 3:
        if (contentMode === "ai") {
          if (!aiPrompt.topic.trim()) return "Please enter a topic for AI generation.";
          if (!aiPrompt.count || aiPrompt.count <= 0)
            return "Please enter a valid question count.";
          if (!aiPrompt.gameType) return "Please select a game type for AI.";
          if (!aiPrompt.difficulty) return "Please select a difficulty level.";
          if (!aiPrompt.activityTiming) return "Please select an activity timing.";
        }
        return "";
      case 4:
        if (questions.length === 0) return "Please add at least one question.";
        for (const q of questions) {
          if (!q.question.trim()) return "All questions must have text.";
          if (q.options) {
            if (q.options.some((o) => !o.trim()))
              return "All answer options must be filled in.";
          }
        }
        return "";
      case 5:
        for (const tier of rewardTiers) {
          if (!tier.title.trim()) return `Reward tier #${tier.rank} needs a title.`;
          if (!tier.value || Number(tier.value) <= 0)
            return `Reward tier #${tier.rank} needs a valid value.`;
        }
        return "";
      default:
        return "";
    }
  };

  // ─── AI generation ──────────────────────────────────────────────────────────
  const generateQuestionsWithAI = async () => {
    const err = validateStep(3);
    if (err) {
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
          body: JSON.stringify(aiPrompt),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "AI generation failed");
      }

      const raw =
        data.content?.find((b: { type: string }) => b.type === "text")?.text ??
        "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      const generated: Question[] = parsed.map(
        (
          q: {
            text: string;
            options: string[];
            correctIndex: number;
            timeLimitSecs: number;
          },
          i: number
        ) => ({
          id: `q-${i + 1}`,
          question: q.text,
          options: q.options,
          correctIndex: q.correctIndex ?? 0,
          timeLimitSecs: q.timeLimitSecs ?? 15,
        })
      );

      setQuestions(generated);
      setStep(4);
    } catch (err: any) {
      toast.error(err?.message || "AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQuestion = async (id: string) => {
    const q = questions.find((q) => q.id === id);
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

      const raw =
        data.content?.find((b: { type: string }) => b.type === "text")?.text ??
        "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const replacement = Array.isArray(parsed) ? parsed[0] : parsed;

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                question: replacement?.text ?? q.question,
                options: replacement?.options ?? q.options,
                correctIndex: replacement?.correctIndex ?? q.correctIndex,
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
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        if (field === "question") return { ...q, question: value as string };
        if (field === "correctIndex") return { ...q, correctIndex: value as number };
        if (field === "timeLimitSecs") return { ...q, timeLimitSecs: value as number };
        return q;
      })
    );
  };

  const handleOptionEdit = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const addRewardTier = () => {
    const nextRank = rewardTiers.length + 1;
    setRewardTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}`,
        rank: nextRank,
        type: "CASH",
        title: `${
          nextRank === 1
            ? "1st"
            : nextRank === 2
            ? "2nd"
            : nextRank === 3
            ? "3rd"
            : `${nextRank}th`
        } Place Winner`,
        description: "",
        value: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        usageLimit: 1,
        expiryDate: "",
        quantity: 1,
      },
    ]);
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

  const removeRewardTier = (id: string) => {
    setRewardTiers((prev) =>
      prev.filter((t) => t.id !== id).map((t, i) => ({ ...t, rank: i + 1 }))
    );
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    try {
      const payload = {
        title: gameName,
        scheduleType: SCHEDULE_TO_API[scheduleMode],
        priceCurrency,
        repetitions: rounds,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: gameEndsAt ? new Date(gameEndsAt).toISOString() : undefined,
        activityTiming: PHASE_TO_API[phase],
        maxWinners,
        gameDuration,
        basePrice,
        perRoundPrice,
        rounds: questions.map((q, i) => ({
          title: `Round ${i + 1}`,
          description: "",
          gameType: GAMETYPE_TO_API[gameType],
          config: {
            questions: [
              {
                text: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                timeLimitSecs: q.timeLimitSecs,
              },
            ],
          },
          orderIndex: i,
        })),
        rewardTiers: rewardTiers.map(({ id: _id, ...tier }) => ({
          ...tier,
          expiryDate: tier.expiryDate
            ? new Date(tier.expiryDate).toISOString()
            : undefined,
        })),
      };

      const request = await createGameMutation({
        body: payload,
        eventId,
      }).unwrap();

      if (request.success) {
        toast.success("Game created successfully!");
        onCancel();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to create game. Please try again.");
    }
  };

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      setValidationError(err);
      return;
    }
    setValidationError("");

    if (step === 3 && contentMode === "ai") {
      generateQuestionsWithAI();
    } else if (step === 3 && contentMode === "manual") {
      setQuestions([]);
      setStep(4);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setValidationError("");
    setStep((s) => s - 1);
  };

  const stepLabel = [
    "Basic Info",
    "Schedule & Pricing",
    "Content Mode",
    "Questions",
    "Reward Tiers",
    "Preview",
  ][step - 1];

  // Keep aiPrompt.gameType in sync when gameType changes in step 1
  const handleSetGameType = (type: GameType) => {
    setGameType(type);
    setAiPrompt((prev) => ({ ...prev, gameType: GAMETYPE_TO_AI_KEY[type] }));
  };

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

      {/* Validation error banner */}
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
          gameType={gameType}
          setGameType={handleSetGameType}
          gameTypeConfig={gameTypeConfig}
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
          rounds={rounds}
          setRounds={setRounds}
          gameDuration={gameDuration}
          setGameDuration={setGameDuration}
          maxWinners={maxWinners}
          setMaxWinners={setMaxWinners}
          priceCurrency={priceCurrency}
          basePrice={basePrice}
          setBasePrice={setBasePrice}
          perRoundPrice={perRoundPrice}
          setPerRoundPrice={setPerRoundPrice}
          scheduleMode={scheduleMode}
          setScheduleMode={setScheduleMode}
        />
      )}
      {step === 3 && (
        <StepThree
          contentMode={contentMode}
          setContentMode={(v) => setContentMode(v as ContentMode)}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
        />
      )}
      {step === 4 && (
        <StepFour
          contentMode={contentMode}
          questions={questions}
          generateQuestionsWithAI={generateQuestionsWithAI}
          editingQuestion={editingQuestion}
          handleQuestionEdit={handleQuestionEdit}
          handleOptionEdit={handleOptionEdit}
          setEditingQuestion={setEditingQuestion}
          regenerateQuestion={regenerateQuestion}
          gameType={gameType}
          setQuestions={setQuestions}
        />
      )}
      {step === 5 && (
        <StepFive
          rewardTiers={rewardTiers}
          addRewardTier={addRewardTier}
          removeRewardTier={removeRewardTier}
          updateRewardTier={updateRewardTier}
          priceCurrency={priceCurrency}
        />
      )}
      {step === 6 && (
        <StepSix
          gameName={gameName}
          gameType={gameType}
          gameTypeConfig={gameTypeConfig}
          phase={phase}
          startsAt={startsAt}
          endsAt={gameEndsAt}
          rounds={rounds}
          gameDuration={gameDuration}
          maxWinners={maxWinners}
          priceCurrency={priceCurrency}
          basePrice={basePrice}
          perRoundPrice={perRoundPrice}
          scheduleMode={scheduleMode}
          questions={questions}
          contentMode={contentMode}
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
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={onCancel} className="flex-1">
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
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : step === 3 && contentMode === "ai" ? (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Questions
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
