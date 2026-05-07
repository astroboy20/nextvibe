import { useState, useEffect } from "react";
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
export type EventPhase = "pre-event" | "main-event" | "post-event" | "both";
type ContentMode = "ai" | "manual";
export type ScheduleMode = "daily" | "weekly" | "concurrent";
export type RewardType = "CASH" | "COUPON" | "MERCHANDISE" | "FREE_TICKET" | "BADGE" | "POINTS" | "OTHER";
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
  question: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
  timeLimitSecs: number;
}

export interface RoundData {
  gameType: GameType;
  title: string;
  description: string;
  questions: Question[];
}

const PHASE_TO_API: Record<EventPhase, string> = {
  "pre-event":  "PRE_EVENT",
  "main-event": "DURING_EVENT",
  "post-event": "POST_EVENT",
  both:         "BOTH",
};

const SCHEDULE_TO_API: Record<ScheduleMode, string> = {
  concurrent: "ALL_AT_ONCE",
  daily:      "DAILY",
  weekly:     "WEEKLY",
};

const GAMETYPE_TO_API: Record<GameType, string> = {
  trivia:         "TRIVIA",
  "word-puzzle":  "WORD_PUZZLE",
  "two-truths":   "TWO_TRUTHS_ONE_LIE",
  "this-or-that": "THIS_OR_THAT",
};

const GAMETYPE_TO_AI_KEY: Record<GameType, GameTypeOrEmpty> = {
  trivia:         "trivia",
  "word-puzzle":  "word-puzzle",
  "two-truths":   "two-truths",
  "this-or-that": "this-or-that",
};

export const gameTypeConfig: Record<GameType, { icon: React.ReactNode; label: string; description: string }> = {
  trivia:         { icon: <HelpCircle className="h-5 w-5" />,    label: "Trivia",           description: "Multiple choice questions" },
  "word-puzzle":  { icon: <Puzzle className="h-5 w-5" />,        label: "Word Puzzle",      description: "Find words from letters" },
  "two-truths":   { icon: <MessageSquare className="h-5 w-5" />, label: "2 Truths & 1 Lie", description: "Guess the lie" },
  "this-or-that": { icon: <Zap className="h-5 w-5" />,           label: "This or That",     description: "Choose between options" },
};

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

const STORAGE_KEY = "gameWizardState";
const loadSaved = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); } catch { return null; }
};
const clearSaved = () => {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
};

interface GameCreationWizardProps {
  onComplete: (game: any) => void;
  onCancel: () => void;
  eventId: string;
  eventName: string;
  eventStartsAt?: string;
}

export function GameCreationWizard({ onCancel, eventId, eventName, eventStartsAt }: GameCreationWizardProps) {
  const totalSteps = 6;

  const gameEndsAt = eventStartsAt
    ? new Date(new Date(eventStartsAt).getTime() - 60 * 1000).toISOString().slice(0, 16)
    : "";
  const maxStartsAt = gameEndsAt;

  // Initialise all state from localStorage if available, otherwise use defaults
  const saved = loadSaved();

  const [step, setStep]                       = useState<number>(saved?.step ?? 1);
  const [gameName, setGameName]               = useState<string>(saved?.gameName ?? "");
  const [numberOfRounds, setNumberOfRounds]   = useState<number>(saved?.numberOfRounds ?? 1);
  const [phase, setPhase]                     = useState<EventPhase>(saved?.phase ?? "main-event");
  const [scheduleMode, setScheduleMode]       = useState<ScheduleMode>(saved?.scheduleMode ?? "concurrent");
  const [startsAt, setStartsAt]               = useState<string>(saved?.startsAt ?? "");
  const [gameDuration, setGameDuration]       = useState<number>(saved?.gameDuration ?? 30);
  const [repetitions, setRepetitions]         = useState<number>(saved?.repetitions ?? 1);
  const [maxWinners, setMaxWinners]           = useState<number>(saved?.maxWinners ?? 3);
  const [priceCurrency]                       = useState("NGN");
  const [activeRoundIdx, setActiveRoundIdx]   = useState<number>(saved?.activeRoundIdx ?? 0);
  const [contentMode, setContentMode]         = useState<ContentMode>(saved?.contentMode ?? "ai");
  const [aiPrompt, setAiPrompt]               = useState<{
    topic: string; count: number | null; gameType: GameTypeOrEmpty;
    difficulty: string; activityTiming: "" | "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH";
    eventName: string;
  }>(saved?.aiPrompt ?? { topic: "", count: null, gameType: "trivia", difficulty: "", activityTiming: "", eventName });
  const [roundsData, setRoundsData]           = useState<RoundData[]>(saved?.roundsData ?? []);
  const [isGenerating, setIsGenerating]       = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(saved?.editingQuestion ?? null);
  const [rewardTiers, setRewardTiers]         = useState<RewardTier[]>(saved?.rewardTiers ?? []);

  const [createGameMutation, { isLoading }]   = useCreateGameMutation();
  const accessToken                           = Cookies.get("accessToken");
  const progress                              = (step / totalSteps) * 100;
  const [validationError, setValidationError] = useState("");

  useBeforeUnload(step > 1 || gameName.trim().length > 0);

  // Auto-save every time any wizard state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step, gameName, numberOfRounds, phase, scheduleMode, startsAt,
        gameDuration, repetitions, maxWinners, activeRoundIdx, contentMode,
        aiPrompt, roundsData, rewardTiers, editingQuestion,
      }));
    } catch { /* storage quota exceeded */ }
  }, [step, gameName, numberOfRounds, phase, scheduleMode, startsAt,
      gameDuration, repetitions, maxWinners, activeRoundIdx, contentMode,
      aiPrompt, roundsData, rewardTiers, editingQuestion]);

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
    setAiPrompt((prev) => ({ ...prev, gameType: GAMETYPE_TO_AI_KEY[type] }));
  };

  const updateRoundMeta = (idx: number, field: "title" | "description", value: string) => {
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
      title: rewardTiers[i]?.title ?? `${ORDINALS[i] ?? `${i + 1}th`} Place Winner`,
      description: rewardTiers[i]?.description ?? "Prize for the top performer.",
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
        if (numberOfRounds < 1 || numberOfRounds > 10) return "Rounds must be between 1 and 10.";
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
          if (!aiPrompt.topic.trim()) return "Please enter a topic for AI generation.";
          if (!aiPrompt.count || aiPrompt.count <= 0) return "Please enter a valid question count.";
          if (!aiPrompt.gameType) return "Please select a game type.";
          if (!aiPrompt.difficulty) return "Please select a difficulty level.";
          if (!aiPrompt.activityTiming) return "Please select an activity timing.";
        }
        return "";
      case 4:
        // Only validate the current round being edited
        if (!roundsData[activeRoundIdx]?.questions?.length)
          return `Round ${activeRoundIdx + 1} has no questions. Please add or generate content.`;
        for (const q of roundsData[activeRoundIdx].questions) {
          if (!q.question.trim()) return `Round ${activeRoundIdx + 1}: all questions must have text.`;
          if (q.options?.some((o) => !o.trim()))
            return `Round ${activeRoundIdx + 1}: all answer options must be filled in.`;
        }
        return "";
      case 5:
        for (const tier of rewardTiers) {
          if (!tier.title.trim())
            return `Reward tier #${tier.rank} needs a title.`;
          if (!tier.value)
            return `Set a prize value for the ${ORDINALS[tier.rank - 1] ?? `${tier.rank}th`} place winner.`;
          if ((tier.type === "CASH" || tier.type === "POINTS") && Number(tier.value) <= 0)
            return `${ORDINALS[tier.rank - 1] ?? `${tier.rank}th`} place: enter a valid amount.`;
        }
        return "";
      default:
        return "";
    }
  };

  // ── AI generation ──────────────────────────────────────────────────────────
  const generateQuestionsWithAI = async (roundIdx: number = activeRoundIdx) => {
    const err = validateStep(3);
    if (err) { toast.error(err); setValidationError(err); return; }
    setValidationError("");
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/games/ai/generate-draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(aiPrompt),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "AI generation failed");

      // API returns: { success, data: { success, data: { suggestedTitle, suggestedDescription, questions: [...] } } }
      const inner = data?.data?.data ?? data?.data ?? data;
      const rawQuestions: any[] = inner?.questions ?? [];

      if (!rawQuestions.length) throw new Error("AI returned no questions. Try a different topic.");

      const generated: Question[] = rawQuestions.map((q: any, i: number) => ({
        id: `q-${roundIdx}-${i + 1}`,
        question: q.question ?? q.text ?? "",
        options: q.options ?? [],
        correctIndex: q.correctIndex ?? 0,
        timeLimitSecs: q.timeLimitSecs ?? 15,
      }));
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ ...aiPrompt, count: 1 }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message);
      const inner = data?.data?.data ?? data?.data ?? data;
      const rawQuestions: any[] = inner?.questions ?? [];
      const replacement = rawQuestions[0];
      if (!replacement) throw new Error("No replacement question returned.");
      setRoundQuestions(activeRoundIdx, currentRound!.questions.map((q) =>
        q.id === id
          ? { ...q, question: replacement?.question ?? replacement?.text ?? q.question, options: replacement?.options ?? q.options, correctIndex: replacement?.correctIndex ?? q.correctIndex, timeLimitSecs: replacement?.timeLimitSecs ?? q.timeLimitSecs }
          : q
      ));
    } catch {
      toast.error("Could not regenerate question. Please edit it manually.");
    }
  };

  const handleQuestionEdit = (id: string, field: string, value: string | number) => {
    setRoundsData((prev) => {
      const next = [...prev];
      const current = next[activeRoundIdx];
      next[activeRoundIdx] = {
        ...current,
        questions: current.questions.map((q) => {
          if (q.id !== id) return q;
          if (field === "question") return { ...q, question: value as string };
          if (field === "correctIndex") return { ...q, correctIndex: value as number };
          if (field === "timeLimitSecs") return { ...q, timeLimitSecs: value as number };
          return q;
        }),
      };
      return next;
    });
  };

  const handleOptionEdit = (questionId: string, optionIndex: number, value: string) => {
    setRoundsData((prev) => {
      const next = [...prev];
      const current = next[activeRoundIdx];
      next[activeRoundIdx] = {
        ...current,
        questions: current.questions.map((q) => {
          if (q.id !== questionId || !q.options) return q;
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }),
      };
      return next;
    });
  };

  const updateRewardTier = (id: string, field: keyof RewardTier, value: string | number) => {
    setRewardTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    try {
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
        rounds: roundsData.map((r, i) => ({
          title: r.title || `Round ${i + 1}`,
          description: r.description,
          gameType: GAMETYPE_TO_API[r.gameType],
          config: {
            questions: r.questions.map((q) => ({
              text: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              timeLimitSecs: q.timeLimitSecs,
            })),
          },
          orderIndex: i,
          rewardTiers: rewardTiers.map(({ id: _id, ...tier }) => ({
            rank: tier.rank,
            type: tier.type,
            title: tier.title,
            description: tier.description,
            value: tier.value,
            discountType: tier.discountType,
            discountValue: tier.discountValue,
            usageLimit: tier.usageLimit,
            expiryDate: tier.expiryDate ? new Date(tier.expiryDate).toISOString() : undefined,
            quantity: tier.quantity,
          })),
        })),
        rewardTiers: rewardTiers.map(({ id: _id, ...tier }) => ({
          rank: tier.rank,
          type: tier.type,
          title: tier.title,
          description: tier.description,
          value: tier.value,
          discountType: tier.discountType,
          discountValue: tier.discountValue,
          usageLimit: tier.usageLimit,
          expiryDate: tier.expiryDate ? new Date(tier.expiryDate).toISOString() : undefined,
          quantity: tier.quantity,
        })),
      };

      const request = await createGameMutation({ body: payload, eventId }).unwrap();
      if (request.success) {
        toast.success("Game created successfully!");
        clearSaved();
        onCancel();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to create game. Please try again.");
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); setValidationError(err); return; }
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
      // Sync activityTiming from phase so AI prompt is pre-filled
      const timingMap: Record<EventPhase, string> = {
        "pre-event": "PRE_EVENT", "main-event": "DURING_EVENT",
        "post-event": "POST_EVENT", "both": "BOTH",
      };
      setAiPrompt((prev) => ({ ...prev, activityTiming: timingMap[phase] as any }));
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
        // Sync aiPrompt gameType to next round's type
        const nextType = roundsData[nextRound]?.gameType ?? "trivia";
        setAiPrompt((prev) => ({ ...prev, gameType: GAMETYPE_TO_AI_KEY[nextType], topic: "", count: null, difficulty: "", activityTiming: "" }));
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
          <span className="font-medium">Step {step} of {totalSteps}</span>
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
          onRoundTitleChange={(v) => updateRoundMeta(activeRoundIdx, "title", v)}
          onRoundDescriptionChange={(v) => updateRoundMeta(activeRoundIdx, "description", v)}
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
          generateQuestionsWithAI={() => generateQuestionsWithAI(activeRoundIdx)}
          editingQuestion={editingQuestion}
          handleQuestionEdit={handleQuestionEdit}
          handleOptionEdit={handleOptionEdit}
          setEditingQuestion={setEditingQuestion}
          regenerateQuestion={regenerateQuestion}
          gameType={currentRound?.gameType ?? "trivia"}
          setQuestions={(qs: Question[] | ((prev: Question[]) => Question[])) => {
            setRoundsData((prev) => {
              const next = [...prev];
              const current = next[activeRoundIdx] ?? { gameType: "trivia", title: "", description: "", questions: [] };
              const resolved = typeof qs === "function" ? qs(current.questions) : qs;
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
          <Button variant="outline" onClick={handleBack} className="flex-1 gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => { clearSaved(); onCancel(); }}
            className="flex-1"
          >Cancel</Button>
        )}

        {step < totalSteps && (
          <Button
            onClick={handleNext}
            disabled={isGenerating}
            className="flex-1 gap-1.5 bg-[#531342] hover:bg-[#531342]/90 text-white"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : step === 3 && contentMode === "ai" ? (
              <><Sparkles className="h-4 w-4" /> Generate Questions</>
            ) : step === 4 && activeRoundIdx + 1 < numberOfRounds ? (
              <>Next Round <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Next <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
