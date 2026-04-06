import { TwoTruthsAndALieData } from "@/types/game.type";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const TwoTruthsFields = ({
  data,
  setTwoTruthsData,
}: {
  data: TwoTruthsAndALieData[];
  setTwoTruthsData: (data: any) => void;
}) => {
  const updateQuestion = (
    index: number,
    field: keyof TwoTruthsAndALieData,
    value: any
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setTwoTruthsData(updated);
  };

  const updateStatement = (
    questionIndex: number,
    statementIndex: number,
    value: string
  ) => {
    const updated = [...data];
    updated[questionIndex].statements[statementIndex] = value;
    setTwoTruthsData(updated);
  };

  const addQuestion = () => {
    setTwoTruthsData([
      ...data,
      { prompt: "", statements: ["", "", ""], lieIndex: 0, category: "" },
    ]);
  };

  const removeQuestion = (index: number) => {
    setTwoTruthsData(data.filter((_, i) => i !== index));
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

            {/* Prompt */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-600">Prompt</Label>
              <Input
                value={q.prompt}
                onChange={(e) =>
                  updateQuestion(index, "prompt", e.currentTarget.value)
                }
                placeholder="Enter prompt..."
                className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-600">Category</Label>
              <Input
                value={q.category}
                onChange={(e) =>
                  updateQuestion(index, "category", e.currentTarget.value)
                }
                placeholder="Enter category..."
                className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
              />
            </div>

            {/* Statements */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-600">Statements</p>
              {q.statements.map((statement, sIndex) => (
                <div key={sIndex} className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500">
                    Statement {sIndex + 1}
                  </Label>
                  <Input
                    value={statement}
                    onChange={(e) =>
                      updateStatement(index, sIndex, e.currentTarget.value)
                    }
                    placeholder={`Enter statement ${sIndex + 1}...`}
                    className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                  />
                </div>
              ))}
            </div>

            {/* Which is the lie */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Which is the lie?
              </Label>
              <Select
                value={q.lieIndex.toString()}
                onValueChange={(value) =>
                  updateQuestion(index, "lieIndex", parseInt(value))
                }
              >
                <SelectTrigger className="h-10 rounded-lg border-gray-300 focus:ring-[#5B1A57]">
                  <SelectValue placeholder="Select the lie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Statement 1</SelectItem>
                  <SelectItem value="1">Statement 2</SelectItem>
                  <SelectItem value="2">Statement 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}

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

export default TwoTruthsFields;