"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface PollQuestion {
  text: string;
  options: string[];
  timeLimitSecs?: number;
}

interface PollRoundPlayerProps {
  questions: PollQuestion[];
  onAllComplete: (answers: number[]) => Promise<void>;
  initialAnswers?: number[];
}

export function PollRoundPlayer({
  questions,
  onAllComplete,
  initialAnswers,
}: PollRoundPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    initialAnswers ?? Array(questions.length).fill(-1)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const allAnswered = answers.every((a) => a !== -1);

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAllComplete(answers);
    } catch (error) {
      console.error("Failed to submit poll answers:", error);
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground">
            {answers.filter((a) => a !== -1).length} / {questions.length} answered
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-relaxed">
              {currentQuestion.text}
            </h3>
            {currentAnswer !== -1 && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                You selected: {currentQuestion.options[currentAnswer]}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary/50 hover:bg-accent",
                  currentAnswer === index
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      currentAnswer === index
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {currentAnswer === index && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex-1"
        >
          Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={currentAnswer === -1}
            className="flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="flex-1 bg-[#531342] hover:bg-[#531342]/90"
          >
            {isSubmitting ? "Submitting..." : "Submit Poll"}
          </Button>
        )}
      </div>
    </div>
  );
}
