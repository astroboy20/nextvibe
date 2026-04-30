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

export type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";

type GameTypeAI = "TRIVIA" | "WORD-PUZZLE" | "TWO-TRUTHS" | "THIS-OR-THAT";
export type EventPhase = "pre-event" | "main-event" | "both";
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
  "pre-event": "BEFORE_EVENT",
  "main-event": "DURING_EVENT",
  both: "BOTH",
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

const gameTypeConfig: Record<
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
}

export function GameCreationWizard({
  onCancel,
  eventId,
  eventName,
}: GameCreationWizardProps) {
  // Step
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Step 1 — Basic Info
  const [gameName, setGameName] = useState("");
  const [gameType, setGameType] = useState<GameType>("trivia");
  const [gameTypeAI, setGameTypeAI] = useState<GameTypeAI>("TRIVIA");

  // Step 2 — Schedule & Pricing
  const [phase, setPhase] = useState<EventPhase>("main-event");
  const [rounds, setRounds] = useState(3);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("concurrent");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [gameDuration, setGameDuration] = useState(0);
  const [maxWinners, setMaxWinners] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [perRoundPrice, setPerRoundPrice] = useState(0);
  const [priceCurrency] = useState("NGN");

  // Step 3 — Content Mode
  const [contentMode, setContentMode] = useState<ContentMode>("ai");
  const [aiPrompt, setAiPrompt] = useState<{
    topic: string;
    count: number | null;
    gameType: GameTypeAI;
    difficulty: string;
    activityTiming: "" | "pre_event" | "ongoing" | "post_event";
    eventName: string;
  }>({
    topic: "",
    count: null,
    gameType: gameType as GameTypeAI,
    difficulty: "",
    activityTiming: "",
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
  console.log("token:", accessToken);

  const generateQuestionsWithAI = async () => {
    if (
      !aiPrompt.topic.trim() ||
      aiPrompt.count === null ||
      aiPrompt.count <= 0 ||
      !aiPrompt.gameType ||
      !aiPrompt.difficulty ||
      !aiPrompt.activityTiming
    ) {
      toast.error("Please fill in all AI prompt fields");
      return;
    }
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

      if (response.ok) {
        setQuestions(generated);
        setStep(4);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      // Fallback mock questions
      setQuestions(
        Array.from({ length: rounds * 3 }, (_, i) => ({
          id: `q-${i + 1}`,
          question: `Sample Question ${i + 1}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: 0,
          timeLimitSecs: 15,
        }))
      );
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQuestion = async (id: string) => {
    try {
      const q = questions.find((q) => q.id === id);
      if (!q) return;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: `Generate 1 replacement question for a ${
                gameTypeConfig[gameType].label
              } game${
                aiPrompt ? ` about: ${aiPrompt}` : ""
              }. Return ONLY JSON: {"text":"...","options":[...],"correctIndex":0,"timeLimitSecs":15}`,
            },
          ],
        }),
      });
      const data = await response.json();
      const raw =
        data.content?.find((b: { type: string }) => b.type === "text")?.text ??
        "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                question: parsed.text ?? q.question,
                options: parsed.options ?? q.options,
                correctIndex: parsed.correctIndex ?? q.correctIndex,
                timeLimitSecs: parsed.timeLimitSecs ?? q.timeLimitSecs,
              }
            : q
        )
      );
    } catch {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, question: `${q.question} (refreshed)` } : q
        )
      );
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
        if (field === "correctIndex")
          return { ...q, correctIndex: value as number };
        if (field === "timeLimitSecs")
          return { ...q, timeLimitSecs: value as number };
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
          nextRank === 2 ? "2nd" : nextRank === 3 ? "3rd" : `${nextRank}th`
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

  const handleComplete = async () => {
    const payload = {
      title: gameName,
      scheduleType: SCHEDULE_TO_API[scheduleMode],
      priceCurrency,
      repetitions: rounds,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
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
      rewardTiers: rewardTiers.map(({ id, ...tier }) => ({
        ...tier,
        expiryDate: tier.expiryDate
          ? new Date(tier.expiryDate).toISOString()
          : undefined,
      })),
    };

    const request = await createGameMutation({
      body: payload,
      eventId: eventId,
    }).unwrap();
    if (request.success) {
      toast.success("Game created successfully");
      onCancel();
    }

    // console.log("Final payload:", JSON.stringify(payload, null, 2));
    // onComplete(payload);
  };

  const stepLabel = [
    "Basic Info",
    "Schedule & Pricing",
    "Content Mode",
    "Questions",
    "Reward Tiers",
    "Preview",
  ][step - 1];

  const handleNext = () => {
    if (step === 3 && contentMode === "ai") {
      generateQuestionsWithAI();
    } else if (step === 3 && contentMode === "manual") {
      setQuestions([]);
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = (): boolean => {
    if (step === 1) return gameName.trim().length > 0;
    if (step === 4) return questions.length > 0;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step} of {totalSteps}
          </span>
          <span className="text-muted-foreground">{stepLabel}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <StepOne
          gameName={gameName}
          setGameName={setGameName}
          gameType={gameType}
          setGameType={setGameType}
          gameTypeConfig={gameTypeConfig}
        />
      )}
      {step === 2 && (
        <StepTwo
          phase={phase}
          setPhase={setPhase}
          startsAt={startsAt}
          setStartsAt={setStartsAt}
          endsAt={endsAt}
          setEndsAt={setEndsAt}
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
          setContentMode={setContentMode}
          aiPrompt={{ ...aiPrompt, count: aiPrompt.count ?? 0 }}
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
          endsAt={endsAt}
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

      <div className="flex gap-3 pt-4 border-t border-border">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
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
            disabled={!canProceed() || isGenerating}
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
