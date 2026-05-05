"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Edit2, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Question } from "../game-creation-wizard";
import { Badge } from "@/components/ui/badge";

interface StepFourProps {
  roundIndex: number;
  totalRounds: number;
  roundTitle: string;
  contentMode: string;
  questions: Question[];
  generateQuestionsWithAI: () => void;
  editingQuestion: string | null;
  handleQuestionEdit: (id: string, field: string, value: string | number) => void;
  handleOptionEdit: (questionId: string, optionIndex: number, value: string) => void;
  setEditingQuestion: (id: string | null) => void;
  regenerateQuestion: (id: string) => void;
  gameType: string;
  setQuestions: any;
}

const StepFour = ({
  roundIndex,
  totalRounds,
  roundTitle,
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
}: StepFourProps) => {
  const addQuestion = () => {
    const newId = `q-${Date.now()}`;
    const optionCount = gameType === "this-or-that" ? 2 : gameType === "two-truths" ? 3 : 4;
    setQuestions((prev: Question[]) => [
      ...prev,
      { id: newId, question: "", options: Array(optionCount).fill(""), correctIndex: 0, timeLimitSecs: 15 },
    ]);
    setEditingQuestion(newId);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev: Question[]) => prev.filter((q) => q.id !== id));
    if (editingQuestion === id) setEditingQuestion(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Round indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#531342] text-white text-xs font-bold shrink-0">
            {roundIndex + 1}
          </div>
          <div>
            <p className="text-sm font-semibold">{roundTitle || `Round ${roundIndex + 1}`}</p>
            <p className="text-xs text-muted-foreground">
              {roundIndex + 1} of {totalRounds} · {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {contentMode === "ai" && questions.length > 0 && (
          <Button variant="outline" size="sm" onClick={generateQuestionsWithAI} className="gap-1.5 h-8 text-xs">
            <RefreshCw className="h-3 w-3" /> Regenerate
          </Button>
        )}
      </div>

      {/* Empty state */}
      {questions.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No questions yet for this round.</p>
          {contentMode === "manual" ? (
            <Button size="sm" onClick={addQuestion} className="gap-1.5 bg-[#531342] hover:bg-[#531342]/90 text-white">
              <Plus className="h-3.5 w-3.5" /> Add First Question
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Go back to generate questions with AI.</p>
          )}
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className={cn(
              "overflow-hidden border transition-all",
              editingQuestion === q.id ? "border-[#531342]/50 shadow-sm" : "border-border"
            )}
          >
            <CardContent className="p-3">
              {editingQuestion === q.id ? (
                /* ── Edit mode ── */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Q{index + 1}</Badge>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => handleQuestionEdit(q.id, "question", e.target.value)}
                    placeholder="Type your question here…"
                    className="h-10 font-medium"
                    autoFocus
                  />
                  {q.options && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Options — tap circle to mark correct answer</Label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuestionEdit(q.id, "correctIndex", optIdx)}
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors",
                              q.correctIndex === optIdx
                                ? "bg-emerald-500 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                            )}
                          >
                            {q.correctIndex === optIdx ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + optIdx)}
                          </button>
                          <Input
                            value={opt}
                            onChange={(e) => handleOptionEdit(q.id, optIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="h-9 text-sm flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Time limit (s)</Label>
                      <Input
                        type="number"
                        min={5}
                        max={60}
                        value={q.timeLimitSecs}
                        onChange={(e) => handleQuestionEdit(q.id, "timeLimitSecs", Number(e.target.value))}
                        className="h-8 w-16 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#531342] hover:bg-[#531342]/90 text-white gap-1.5"
                      onClick={() => setEditingQuestion(null)}
                    >
                      <Check className="h-3.5 w-3.5" /> Done
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="shrink-0 text-xs mt-0.5">Q{index + 1}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {q.question || <span className="text-muted-foreground italic">Empty question</span>}
                    </p>
                    {q.options && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {q.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className={cn(
                              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs",
                              q.correctIndex === optIdx
                                ? "bg-emerald-100 text-emerald-700 font-medium"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {opt || `Option ${String.fromCharCode(65 + optIdx)}`}
                            {q.correctIndex === optIdx && " ✓"}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">{q.timeLimitSecs}s limit</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(q.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {contentMode === "ai" && (
                      <button
                        type="button"
                        onClick={() => regenerateQuestion(q.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add question button — always visible in manual mode */}
      {contentMode === "manual" && questions.length > 0 && (
        <Button variant="outline" className="w-full gap-1.5 border-dashed" onClick={addQuestion}>
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      )}
    </div>
  );
};

export default StepFour;
