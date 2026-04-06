import { ThisOrThatData } from "@/types/game.type";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

const ThisOrThatFields = ({
  data,
  setThisOrThatData,
}: {
  data: ThisOrThatData[];
  setThisOrThatData: (data: any) => void;
}) => {
  const updateQuestion = (
    index: number,
    field: keyof ThisOrThatData,
    value: any
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setThisOrThatData(updated);
  };

  const updateOption = (
    questionIndex: number,
    option: "optionA" | "optionB",
    field: keyof ThisOrThatData["optionA"],
    value: string
  ) => {
    const updated = [...data];
    updated[questionIndex][option] = {
      ...updated[questionIndex][option],
      [field]: value,
    };
    setThisOrThatData(updated);
  };

  const addQuestion = () => {
    setThisOrThatData([
      ...data,
      { question: "", optionA: { text: "" }, optionB: { text: "" } },
    ]);
  };

  const removeQuestion = (index: number) => {
    setThisOrThatData(data.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-5">
      {data.map((q, index) => (
        <Card key={index} className="rounded-xl border border-gray-200">
          <CardContent className="pt-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">
                Question {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Question input */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Question
              </Label>
              <Input
                value={q.question}
                onChange={(e) =>
                  updateQuestion(index, "question", e.currentTarget.value)
                }
                placeholder="Enter your question"
                className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
              />
            </div>

            {/* Options row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["optionA", "optionB"] as const).map((option) => (
                <div
                  key={option}
                  className="flex flex-col gap-2 rounded-lg bg-gray-50 border border-gray-100 p-3"
                >
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {option === "optionA" ? "Option A" : "Option B"}
                  </p>
                  <Input
                    placeholder="Text"
                    value={q[option].text}
                    onChange={(e) =>
                      updateOption(index, option, "text", e.currentTarget.value)
                    }
                    className="h-10 rounded-lg border-gray-200 bg-white focus-visible:ring-[#5B1A57]"
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={(q[option] as any).image || ""}
                    onChange={(e) =>
                      updateOption(
                        index,
                        option,
                        "image" as any,
                        e.currentTarget.value
                      )
                    }
                    className="h-10 rounded-lg border-gray-200 bg-white focus-visible:ring-[#5B1A57]"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addQuestion}
        className="w-fit h-10 rounded-lg border-dashed border-gray-300 text-gray-600 hover:border-[#5B1A57] hover:text-[#5B1A57] gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </Button>
    </div>
  );
};

export default ThisOrThatFields;