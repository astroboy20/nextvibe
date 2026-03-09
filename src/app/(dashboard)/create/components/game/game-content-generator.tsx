"use client";

import { useState } from "react";
import { Loader2, Wand2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import PuzzleFields from "./puzzle-fields";
import ThisOrThatFields from "./this-Or-that-fields";
import TriviaFields from "./trivia-fields";
import TwoTruthsFields from "./two-truths-fields";
import {
  GameType,
  QuizData,
  ThisOrThatData,
  TwoTruthsAndALieData,
  WordSearchData,
} from "@/types/game.type";
import {
  useGenerateThisOrThatMutation,
  useGenerateTriviaMutation,
  useGenerateWordPuzzleMutation,
  useGenerateTwoTruthsOneLieMutation,
} from "@/app/provider/api/gameApi";

interface GameContentGeneratorProps {
  selectedGame: GameType;
  gameType: GameType;
  gameName?: string;
  initialData?:
    | QuizData[]
    | WordSearchData
    | ThisOrThatData[]
    | TwoTruthsAndALieData[];
  onGenerated?: (
    data:
      | QuizData[]
      | WordSearchData
      | ThisOrThatData[]
      | TwoTruthsAndALieData[]
  ) => void;
}

export function GameContentGenerator({
  selectedGame,
  gameType,
  gameName,
  onGenerated,
}: GameContentGeneratorProps) {
  const [theme, setTheme] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const [triviaData, setTriviaData] = useState<QuizData[]>([
    {
      question: "Question 1",
      options: ["Option A", "Option B", "Option C"],
      correctOption: "",
    },
  ]);
  const [puzzleData, setPuzzleData] = useState<WordSearchData>({
    width: 10,
    height: 10,
    wordsCount: 0,
    grid: [],
    words: [{ word: "", position: { start: [0, 0], end: [0, 0] } }],
  });
  const [thisOrThatData, setThisOrThatData] = useState<ThisOrThatData[]>([
    { question: "", optionA: { text: "" }, optionB: { text: "" } },
  ]);
  const [twoTruthsData, setTwoTruthsData] = useState<TwoTruthsAndALieData[]>([
    { prompt: "", statements: ["", "", ""], lieIndex: 0, category: "" },
  ]);

  const [generateTrivia, { isLoading: triviaLoading }] =
    useGenerateTriviaMutation();
  const [generateWordPuzzle, { isLoading: puzzleLoading }] =
    useGenerateWordPuzzleMutation();
  const [generateThisOrThat, { isLoading: thisOrThatLoading }] =
    useGenerateThisOrThatMutation();
  const [generateTwoTruthsOneLie, { isLoading: twoTruthsLoading }] =
    useGenerateTwoTruthsOneLieMutation();

  const isGenerating =
    triviaLoading || puzzleLoading || thisOrThatLoading || twoTruthsLoading;

  const hasContent =
    (selectedGame === "trivia" && triviaData.length > 0) ||
    (selectedGame === "wordPuzzle" && puzzleData.words.length > 0) ||
    (selectedGame === "thisOrThat" && thisOrThatData.length > 0) ||
    (selectedGame === "twoTruthsOneLie" && twoTruthsData.length > 0);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.warning("Please enter a theme");
      return;
    }

    try {
      let response: any;

      switch (selectedGame) {
        case "trivia":
          response = await generateTrivia({
            theme,
            numberOfQuestions,
          }).unwrap();
          setTriviaData(response.data as QuizData[]);
          break;
        case "wordPuzzle":
          response = await generateWordPuzzle({ theme }).unwrap();
          setPuzzleData(response.data as WordSearchData);
          break;
        case "thisOrThat":
          response = await generateThisOrThat({
            theme,
            numberOfQuestions,
          }).unwrap();
          setThisOrThatData(response.data as ThisOrThatData[]);
          break;
        case "twoTruthsOneLie":
          response = await generateTwoTruthsOneLie({
            theme,
            numberOfQuestions,
          }).unwrap();
          setTwoTruthsData(response.data as TwoTruthsAndALieData[]);
          break;
        default:
          toast.error("Game type not supported yet");
          return;
      }

      toast.success(
        "Game content generated successfully! You can now edit it."
      );
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate content");
    }
  };

  const handleSave = () => {
    let dataToSave: any;
    switch (selectedGame) {
      case "trivia":
        dataToSave = triviaData;
        break;
      case "wordPuzzle":
        dataToSave = puzzleData;
        break;
      case "thisOrThat":
        dataToSave = thisOrThatData;
        break;
      case "twoTruthsOneLie":
        dataToSave = twoTruthsData;
        break;
      default:
        toast.error("No content to save");
        return;
    }
    if (!dataToSave || (Array.isArray(dataToSave) && dataToSave.length === 0)) {
      toast.error("No content to save");
      return;
    }
    if (typeof onGenerated === "function") {
      onGenerated(dataToSave);
    }
    toast.success("Content saved!");
  };

  const renderEditableContent = () => {
    if (selectedGame === "trivia")
      return <TriviaFields data={triviaData} setTriviaData={setTriviaData} />;
    if (selectedGame === "wordPuzzle")
      return <PuzzleFields data={puzzleData} setPuzzleData={setPuzzleData} />;
    if (selectedGame === "thisOrThat")
      return (
        <ThisOrThatFields
          data={thisOrThatData}
          setThisOrThatData={setThisOrThatData}
        />
      );
    if (selectedGame === "twoTruthsOneLie")
      return (
        <TwoTruthsFields
          data={twoTruthsData}
          setTwoTruthsData={setTwoTruthsData}
        />
      );
    return (
      <p className="text-sm text-gray-400">
        Preview not available for this game type
      </p>
    );
  };

  const gameTypeTitles: Record<string, string> = {
    trivia: "Trivia",
    wordPuzzle: "Word Puzzle",
    thisOrThat: "This or That",
    twoTruthsOneLie: "Two Truths One Lie",
  };
  const displayTitle = gameName?.trim() || gameTypeTitles[gameType] || gameType;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Generate card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Generate {displayTitle} Content</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Theme */}
          <div className="flex flex-col gap-1.5">
            <Label>Theme</Label>
            <Input
              placeholder="E.g., 90s Pop Culture, Sports Trivia, etc."
              value={theme}
              onChange={(e) => setTheme(e.currentTarget.value)}
              className="h-10 rounded-lg"
            />
          </div>

          {/* Number of questions */}
          {selectedGame !== "wordPuzzle" && (
            <div className="flex flex-col gap-1.5">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                value={numberOfQuestions}
                min={1}
                max={20}
                onChange={(e) =>
                  setNumberOfQuestions(Number(e.currentTarget.value))
                }
                className="h-10 rounded-lg w-32"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#5B1A57] hover:bg-[#4a1446] text-white h-10 rounded-lg gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </Button>

            {hasContent && (
              <Button
                onClick={handleSave}
                variant="outline"
                className="h-10 rounded-lg border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors gap-2"
              >
                <Save className="w-4 h-4" />
                Save Content
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Edit card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Edit {displayTitle} Content</CardTitle>
        </CardHeader>
        <CardContent>{renderEditableContent()}</CardContent>
      </Card>
    </div>
  );
}
