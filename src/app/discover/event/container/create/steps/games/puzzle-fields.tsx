import { WordSearchData } from "@/types/game.type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

const PuzzleFields = ({
  data,
  setPuzzleData,
}: {
  data: WordSearchData;
  setPuzzleData: (data: any) => void;
}) => {
  const updateWord = (index: number, value: string) => {
    const updated = { ...data, words: [...data.words] };
    updated.words[index] = { ...updated.words[index], word: value };
    setPuzzleData(updated);
  };

  const addWord = () => {
    const updated = {
      ...data,
      words: [
        ...data.words,
        { word: "", position: { start: [0, 0], end: [0, 0] } },
      ],
    };
    setPuzzleData(updated);
  };

  const removeWord = (index: number) => {
    const updated = {
      ...data,
      words: data.words.filter((_, i) => i !== index),
    };
    setPuzzleData(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Grid info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-700">
          Word Puzzle Grid:{" "}
          <span className="font-medium">
            {data.width}x{data.height}
          </span>
        </p>
        <p className="text-sm text-gray-700">
          Words Count:{" "}
          <span className="font-medium">{data.words.length}</span>
        </p>
      </div>

      {/* Words list */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-800">Words:</p>

        {data.words.map((word, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={word.word}
              onChange={(e) => updateWord(index, e.currentTarget.value)}
              placeholder={`Word ${index + 1}`}
              className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] flex-1"
            />
            <button
              type="button"
              onClick={() => removeWord(index)}
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
          onClick={addWord}
          className="w-fit h-9 rounded-lg border-dashed border-gray-300 text-gray-600 hover:border-[#5B1A57] hover:text-[#5B1A57] gap-1.5 transition-colors mt-1"
        >
          <Plus className="w-4 h-4" />
          Add Word
        </Button>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 leading-relaxed">
        Note: Only the word list is editable. To change the grid, regenerate the puzzle.
      </p>
    </div>
  );
};

export default PuzzleFields;