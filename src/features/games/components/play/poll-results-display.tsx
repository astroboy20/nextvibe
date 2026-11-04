"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollResultQuestion {
  questionIndex: number;
  text: string;
  options: string[];
  totalVotes: number;
  counts: {
    optionIndex: number;
    label: string;
    votes: number;
    percentage: number;
  }[];
  userVote: number | null;
  revealed: boolean;
}

interface PollResultsDisplayProps {
  roundId: string;
  gameType: string;
  questions: PollResultQuestion[];
  totalVotes: number;
  revealed: boolean;
}

export function PollResultsDisplay({
  questions,
  revealed,
}: PollResultsDisplayProps) {
  if (!revealed) {
    return (
      <div className="py-10 text-center space-y-2">
        <p className="text-lg font-semibold">Vote Submitted!</p>
        <p className="text-sm text-muted-foreground">
          Results will appear after you vote or when the round ends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold">Poll Results</h3>
        <p className="text-sm text-muted-foreground">
          See how others voted
        </p>
      </div>

      {questions.map((question, qIdx) => (
        <Card key={qIdx}>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-semibold leading-relaxed">
                {question.text}
              </h4>
              <p className="text-sm text-muted-foreground">
                {question.totalVotes} total {question.totalVotes === 1 ? "vote" : "votes"}
              </p>
            </div>

            <div className="space-y-3">
              {question.counts.map((option) => {
                const isUserVote = question.userVote === option.optionIndex;
                return (
                  <div
                    key={option.optionIndex}
                    className={cn(
                      "p-4 rounded-lg border-2 space-y-2",
                      isUserVote
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        {isUserVote && (
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <span className={cn(isUserVote && "font-medium")}>
                          {option.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold">
                          {option.percentage.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          ({option.votes})
                        </span>
                      </div>
                    </div>
                    <Progress value={option.percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
