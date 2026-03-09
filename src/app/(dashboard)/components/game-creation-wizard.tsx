import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Sparkles, 
  Pencil, 
  HelpCircle, 
  Puzzle, 
  MessageSquare, 
  Zap,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  X,
  Eye,
  Edit2,
  RefreshCw,
  Calendar,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";

type GameType = "trivia" | "word-puzzle" | "two-truths" | "this-or-that";
type EventPhase = "pre-event" | "main-event" | "both";
type ContentMode = "ai" | "manual";
type ScheduleMode = "daily" | "weekly" | "concurrent";

interface Question {
  id: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
}

interface GameCreationWizardProps {
  onComplete: (game: {
    name: string;
    type: GameType;
    phase: EventPhase;
    rounds: number;
    scheduleMode: ScheduleMode;
    contentMode: ContentMode;
    questions: Question[];
  }) => void;
  onCancel: () => void;
}

const gameTypeConfig: Record<GameType, { icon: React.ReactNode; label: string; description: string }> = {
  "trivia": { icon: <HelpCircle className="h-5 w-5" />, label: "Trivia", description: "Multiple choice questions" },
  "word-puzzle": { icon: <Puzzle className="h-5 w-5" />, label: "Word Puzzle", description: "Find words from letters" },
  "two-truths": { icon: <MessageSquare className="h-5 w-5" />, label: "2 Truths & 1 Lie", description: "Guess the lie" },
  "this-or-that": { icon: <Zap className="h-5 w-5" />, label: "This or That", description: "Choose between options" },
};

export function GameCreationWizard({ onComplete, onCancel }: GameCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [gameName, setGameName] = useState("");
  const [gameType, setGameType] = useState<GameType>("trivia");
  const [phase, setPhase] = useState<EventPhase>("pre-event");
  const [rounds, setRounds] = useState(3);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("concurrent");
  const [contentMode, setContentMode] = useState<ContentMode>("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const generateQuestionsWithAI = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation - in production this would call the Lovable AI Gateway
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated questions based on game type
    let generatedQuestions: Question[] = [];
    
    if (gameType === "trivia") {
      generatedQuestions = Array.from({ length: rounds * 3 }, (_, i) => ({
        id: `q-${i + 1}`,
        question: `AI Generated Question ${i + 1}: ${aiPrompt ? `Related to "${aiPrompt.slice(0, 30)}..."` : "Sample question about the event"}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: Math.floor(Math.random() * 4),
      }));
    } else if (gameType === "two-truths") {
      generatedQuestions = Array.from({ length: rounds }, (_, i) => ({
        id: `q-${i + 1}`,
        question: `Statement Set ${i + 1}`,
        options: ["Truth 1", "Truth 2", "The Lie"],
        correctIndex: 2,
      }));
    } else if (gameType === "this-or-that") {
      generatedQuestions = Array.from({ length: rounds * 3 }, (_, i) => ({
        id: `q-${i + 1}`,
        question: `This or That ${i + 1}`,
        options: ["Option A", "Option B"],
      }));
    } else {
      generatedQuestions = [{
        id: "q-1",
        question: "Find all words from these letters",
        answer: "PARTY, VIBE, ART",
      }];
    }
    
    setQuestions(generatedQuestions);
    setIsGenerating(false);
    setStep(4);
  };

  const handleQuestionEdit = (id: string, field: string, value: string | number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      if (field === "question") return { ...q, question: value as string };
      if (field === "correctIndex") return { ...q, correctIndex: value as number };
      return q;
    }));
  };

  const handleOptionEdit = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId || !q.options) return q;
      const newOptions = [...q.options];
      newOptions[optionIndex] = value;
      return { ...q, options: newOptions };
    }));
  };

  const regenerateQuestion = async (id: string) => {
    // Mock regeneration
    setQuestions(prev => prev.map(q => 
      q.id === id 
        ? { ...q, question: `Regenerated: ${q.question} (Updated!)` }
        : q
    ));
  };

  const handleComplete = () => {
    onComplete({
      name: gameName,
      type: gameType,
      phase,
      rounds,
      scheduleMode,
      contentMode,
      questions,
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label>Game Name</Label>
        <Input
          placeholder="e.g., Birthday Trivia Challenge"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label>Game Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(gameTypeConfig) as [GameType, typeof gameTypeConfig.trivia][]).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setGameType(type)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                gameType === type 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                gameType === type ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {config.icon}
              </div>
              <span className="font-medium text-sm">{config.label}</span>
              <span className="text-xs text-muted-foreground text-center">{config.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Label>Event Phase</Label>
        <ToggleGroup 
          type="single" 
          value={phase}
          onValueChange={(v) => v && setPhase(v as EventPhase)}
          className="justify-start flex-wrap"
        >
          <ToggleGroupItem value="pre-event" className="rounded-full">Pre-Event</ToggleGroupItem>
          <ToggleGroupItem value="main-event" className="rounded-full">Main Event</ToggleGroupItem>
          <ToggleGroupItem value="both" className="rounded-full">Both</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-3">
        <Label>Number of Rounds</Label>
        <div className="flex gap-2">
          {[1, 3, 5, 10].map((num) => (
            <Button
              key={num}
              variant={rounds === num ? "default" : "outline"}
              size="sm"
              className="flex-1 rounded-full"
              onClick={() => setRounds(num)}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Schedule Mode</Label>
        <RadioGroup value={scheduleMode} onValueChange={(v) => setScheduleMode(v as ScheduleMode)}>
          <div className="space-y-3">
            <label className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
              scheduleMode === "concurrent" ? "border-primary bg-primary/5" : "border-border"
            )}>
              <RadioGroupItem value="concurrent" id="concurrent" className="mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Concurrent</div>
                <p className="text-sm text-muted-foreground">All games available at the same time</p>
              </div>
            </label>
            <label className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
              scheduleMode === "daily" ? "border-primary bg-primary/5" : "border-border"
            )}>
              <RadioGroupItem value="daily" id="daily" className="mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Daily</div>
                <p className="text-sm text-muted-foreground">New round unlocks each day</p>
              </div>
            </label>
            <label className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
              scheduleMode === "weekly" ? "border-primary bg-primary/5" : "border-border"
            )}>
              <RadioGroupItem value="weekly" id="weekly" className="mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Weekly</div>
                <p className="text-sm text-muted-foreground">New round unlocks each week</p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Label>Content Creation Method</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setContentMode("ai")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
              contentMode === "ai" 
                ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              contentMode === "ai" 
                ? "bg-gradient-to-br from-primary to-accent text-white" 
                : "bg-muted"
            )}>
              <Sparkles className="h-7 w-7" />
            </div>
            <span className="font-semibold">AI Generated</span>
            <span className="text-xs text-muted-foreground text-center">
              Let AI create questions based on your prompt
            </span>
          </button>
          
          <button
            onClick={() => setContentMode("manual")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
              contentMode === "manual" 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              contentMode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Pencil className="h-7 w-7" />
            </div>
            <span className="font-semibold">Manual Input</span>
            <span className="text-xs text-muted-foreground text-center">
              Create your own questions manually
            </span>
          </button>
        </div>
      </div>

      {contentMode === "ai" && (
        <div className="space-y-3 animate-fade-in">
          <Label>AI Generation Prompt</Label>
          <Textarea
            placeholder="Give AI directions for generating questions. E.g., 'Create fun trivia questions about Nigerian pop culture, Afrobeats music, and Lagos nightlife for a birthday party...'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Be specific about the theme, difficulty level, and audience for better results
          </p>
        </div>
      )}

      {contentMode === "manual" && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
          <Pencil className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You&apos;ll be able to add questions manually in the next step
          </p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Questions ({questions.length})</h3>
          <p className="text-sm text-muted-foreground">
            {contentMode === "ai" ? "Review and edit AI-generated content" : "Add your questions"}
          </p>
        </div>
        {contentMode === "ai" && (
          <Button variant="outline" size="sm" onClick={generateQuestionsWithAI} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate All
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {questions.map((q, index) => (
          <Card key={q.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="secondary" className="shrink-0">Q{index + 1}</Badge>
                <div className="flex-1 min-w-0">
                  {editingQuestion === q.id ? (
                    <div className="space-y-3">
                      <Input
                        value={q.question}
                        onChange={(e) => handleQuestionEdit(q.id, "question", e.target.value)}
                        className="font-medium"
                      />
                      {q.options && (
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuestionEdit(q.id, "correctIndex", optIdx)}
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full text-xs shrink-0",
                                  q.correctIndex === optIdx 
                                    ? "bg-green-500 text-white" 
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {q.correctIndex === optIdx ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + optIdx)}
                              </button>
                              <Input
                                value={opt}
                                onChange={(e) => handleOptionEdit(q.id, optIdx, e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setEditingQuestion(null)}>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-sm">{q.question}</p>
                      {q.options && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.options.map((opt, optIdx) => (
                            <Badge 
                              key={optIdx} 
                              variant={q.correctIndex === optIdx ? "default" : "outline"}
                              className="text-xs"
                            >
                              {opt}
                              {q.correctIndex === optIdx && " ✓"}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {editingQuestion !== q.id && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setEditingQuestion(q.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => regenerateQuestion(q.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contentMode === "manual" && (
        <Button variant="outline" className="w-full" onClick={() => {
          const newId = `q-${questions.length + 1}`;
          setQuestions(prev => [...prev, {
            id: newId,
            question: "",
            options: gameType === "trivia" || gameType === "two-truths" 
              ? ["", "", "", ""] 
              : gameType === "this-or-that" 
                ? ["", ""] 
                : undefined,
            correctIndex: 0,
          }]);
          setEditingQuestion(newId);
        }}>
          + Add Question
        </Button>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4">
          <Eye className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-display text-xl font-bold">Preview & Submit</h3>
        <p className="text-sm text-muted-foreground mt-1">Review your game before publishing</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              {gameTypeConfig[gameType].icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{gameName || "Untitled Game"}</h4>
              <p className="text-sm text-muted-foreground">{gameTypeConfig[gameType].label}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-lg font-bold">{rounds}</p>
              <p className="text-xs text-muted-foreground">Rounds</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-lg font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-semibold capitalize">{phase.replace("-", " ")}</p>
              <p className="text-xs text-muted-foreground">Phase</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {scheduleMode.charAt(0).toUpperCase() + scheduleMode.slice(1)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {contentMode === "ai" ? <Sparkles className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
              {contentMode === "ai" ? "AI Generated" : "Manual"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleComplete} className="w-full gap-2 rounded-xl">
        <Play className="h-4 w-4" />
        Create Game
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Step {step} of {totalSteps}</span>
          <span className="text-muted-foreground">
            {step === 1 && "Basic Info"}
            {step === 2 && "Schedule"}
            {step === 3 && "Content Mode"}
            {step === 4 && "Questions"}
            {step === 5 && "Preview"}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-border">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button 
            onClick={() => {
              if (step === 3 && contentMode === "ai") {
                generateQuestionsWithAI();
              } else if (step === 3 && contentMode === "manual") {
                setQuestions([]);
                setStep(4);
              } else {
                setStep(step + 1);
              }
            }}
            disabled={(step === 1 && !gameName) || isGenerating}
            className="flex-1 gap-1.5"
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
        ) : null}
      </div>
    </div>
  );
}
