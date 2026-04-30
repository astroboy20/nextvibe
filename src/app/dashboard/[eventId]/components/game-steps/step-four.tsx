import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Edit2, RefreshCw } from "lucide-react";
import { Question } from "../game-creation-wizard";
import { Badge } from "@/components/ui/badge";

interface StepFourProps {
  contentMode: string;
  questions: Question[];
  generateQuestionsWithAI: () => void;
  editingQuestion: string | null;
  handleQuestionEdit: (
    id: string,
    field: string,
    value: string | number
  ) => void;
  handleOptionEdit: (
    questionId: string,
    optionIndex: number,
    value: string
  ) => void;
  setEditingQuestion: any;
  regenerateQuestion: (id: string) => void;
  gameType: string;
  setQuestions: any;
}

const StepFour = ({
  contentMode,
  questions,
  generateQuestionsWithAI,
  editingQuestion,
  handleQuestionEdit,
  handleOptionEdit,
  setEditingQuestion,
  regenerateQuestion,
  gameType,
  setQuestions,
}: StepFourProps) => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Questions ({questions.length})</h3>
        <p className="text-sm text-muted-foreground">
          {contentMode === "ai"
            ? "Review and edit AI-generated content"
            : "Add your questions"}
        </p>
      </div>
      {contentMode === "ai" && (
        <Button
          variant="outline"
          size="sm"
          onClick={generateQuestionsWithAI}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate All
        </Button>
      )}
    </div>

    <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
      {questions.map((q, index) => (
        <Card key={q.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <Badge variant="secondary" className="shrink-0">
                Q{index + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                {editingQuestion === q.id ? (
                  <div className="space-y-3">
                    <Input
                      value={q.question}
                      onChange={(e) =>
                        handleQuestionEdit(q.id, "question", e.target.value)
                      }
                      className="font-medium"
                      placeholder="Question text"
                    />
                    {q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuestionEdit(q.id, "correctIndex", optIdx)
                              }
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs shrink-0",
                                q.correctIndex === optIdx
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {q.correctIndex === optIdx ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                String.fromCharCode(65 + optIdx)
                              )}
                            </button>
                            <Input
                              value={opt}
                              onChange={(e) =>
                                handleOptionEdit(q.id, optIdx, e.target.value)
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Label className="text-xs whitespace-nowrap">
                        Time Limit (s)
                      </Label>
                      <Input
                        type="number"
                        min={5}
                        max={60}
                        value={q.timeLimitSecs}
                        onChange={(e) =>
                          handleQuestionEdit(
                            q.id,
                            "timeLimitSecs",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 w-20 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => setEditingQuestion(null)}
                      >
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
                            variant={
                              q.correctIndex === optIdx ? "default" : "outline"
                            }
                            className="text-xs"
                          >
                            {opt}
                            {q.correctIndex === optIdx && " ✓"}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {q.timeLimitSecs}s time limit
                    </p>
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
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const newId = `q-${Date.now()}`;
          const optionCount =
            gameType === "this-or-that" ? 2 : gameType === "two-truths" ? 3 : 4;
          setQuestions((prev) => [
            ...prev,
            {
              id: newId,
              question: "",
              options: Array(optionCount).fill(""),
              correctIndex: 0,
              timeLimitSecs: 15,
            },
          ]);
          setEditingQuestion(newId);
        }}
      >
        + Add Question
      </Button>
    )}
  </div>
);

export default StepFour;
