import { QuizData } from "@/types/game.type";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

const TriviaFields = ({
  data,
  setTriviaData,
}: {
  data: any;
  setTriviaData: (data: any) => void;
}) => {
  const updateQuestion = (index: number, field: keyof QuizData, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setTriviaData(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...data];
    updated[questionIndex].options.push("");
    setTriviaData(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...data];
    updated[questionIndex].options[optionIndex] = value;
    setTriviaData(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...data];
    updated[questionIndex].options.splice(optionIndex, 1);
    setTriviaData(updated);
  };

  const addQuestion = () => {
    setTriviaData([...data, { question: "", options: ["", ""], correctOption: "" }]);
  };

  const removeQuestion = (index: number) => {
    setTriviaData(data.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="flex flex-col gap-5">
      {data.map((q: any, qIndex: number) => {
        const uniqueOptions: string[] = Array.isArray(q.options)
          ? q.options.filter(
              (opt: string, idx: number, arr: string[]) =>
                arr.indexOf(opt) === idx
            )
          : [];

        return (
          <Card key={qIndex} className="rounded-xl border border-gray-200">
            <CardContent className="pt-5 flex flex-col gap-4">
              {/* Question header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Question {qIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question textarea */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Question
                </Label>
                <Textarea
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.currentTarget.value)
                  }
                  rows={2}
                  className="resize-none rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                />
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-600">Options</p>

                {Array.isArray(q.options) &&
                  q.options.map((option: string, oIndex: number) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.currentTarget.value)
                        }
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 h-10 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addOption(qIndex)}
                  className="w-fit h-9 rounded-lg border-dashed border-gray-300 text-gray-600 hover:border-[#5B1A57] hover:text-[#5B1A57] gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </Button>
              </div>

              {/* Correct answer */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Correct Answer
                </Label>
                <Select
                  value={q.correctOption}
                  onValueChange={(value) =>
                    updateQuestion(qIndex, "correctOption", value)
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg border-gray-300 focus:ring-[#5B1A57]">
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueOptions.map((opt, i) => (
                      <SelectItem key={i} value={opt || `option-${i}`}>
                        {opt || `Option ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Add question */}
      <Button
        type="button"
        variant="outline"
        onClick={addQuestion}
        className="w-full h-10 rounded-lg border-dashed border-gray-300 text-gray-600 hover:border-[#5B1A57] hover:text-[#5B1A57] gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </Button>
    </div>
  );
};

export default TriviaFields;