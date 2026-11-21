"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/shared/lib/error-handler";
import { useUploadAiSourceMutation } from "@/features/games/api/games-api";
import type { GameType } from "@/features/games/components/create/game-creation-wizard";

export interface AiSource {
  sourceId: string;
  fileName: string;
  truncated: boolean;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * The question-file format per game type. Must match the backend parser in
 * `backend/src/modules/games/game-file-import.ts` — change both together.
 */
const FORMAT_EXAMPLES: Partial<Record<GameType, { rule: string; example: string }>> = {
  trivia: {
    rule: "4 options (A–D) and an Answer line with the correct letter.",
    example: `Title: Afrobeats Night

1. Who released "Love Damini"?
A. Wizkid
B. Burna Boy
C. Davido
D. Rema
Answer: B
Points: 10

2. Which city is Davido from?
A. Lagos
B. Atlanta
C. Abuja
D. Ibadan
Answer: B`,
  },
  "two-truths": {
    rule: "3 statements (A–C) and a Lie line with the letter of the lie.",
    example: `Title: Get to Know the Host

1. Guess which one is the lie
A. I have climbed Kilimanjaro
B. I speak four languages
C. I have never seen snow
Lie: C`,
  },
  "this-or-that": {
    rule: "One statement per question and Answer: True or Answer: False.",
    example: `Title: Fact or Fiction

1. The Nile is the longest river in Africa.
Answer: True

2. Lagos is the capital of Nigeria.
Answer: False`,
  },
  feedback: {
    rule: "Just number each prompt.",
    example: `Title: How Was Tonight?

1. What was your favourite moment?
2. What should we do differently next time?`,
  },
  "word-puzzle": {
    rule: "One WORD - clue per line, 6–10 words. Use Puzzle 1, Puzzle 2 lines to make several puzzles.",
    example: `Title: Nigerian Cities

Puzzle 1
LAGOS - Nigeria's biggest city
ABUJA - The capital
KANO - Ancient northern trading city
IBADAN - City of brown roofs
ENUGU - The Coal City
CALABAR - Home of the carnival`,
  },
};

interface AiSourceUploadProps {
  gameType: GameType;
  source: AiSource | null;
  onSourceChange: (source: AiSource | null) => void;
  /** Problems the server found in a file that claimed to be in the question format. */
  importProblems: string[] | null;
  onUseAiInstead: () => void;
  disabled?: boolean;
}

export function AiSourceUpload({
  gameType,
  source,
  onSourceChange,
  importProblems,
  onUseAiInstead,
  disabled,
}: AiSourceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [uploadAiSource, { isLoading }] = useUploadAiSourceMutation();
  const format = FORMAT_EXAMPLES[gameType];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file after a fix
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".txt")) {
      toast.error("Only PDF and .txt files are supported.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Files must be 5 MB or smaller.");
      return;
    }

    try {
      const res = await uploadAiSource(file).unwrap();
      const { sourceId, fileName, truncated } = res.data;
      onSourceChange({ sourceId, fileName, truncated });
      if (truncated) {
        toast.info("That's a long file — only the first part will be used.");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't read that file. Please try another.");
    }
  };

  const downloadTemplate = () => {
    if (!format) return;
    const blob = new Blob([format.example + "\n"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nextvibe-${gameType}-template.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
        onChange={handleFile}
      />

      {source ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#531342]/30 bg-[#531342]/5 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-[#531342]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{source.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {source.truncated ? "Long file — only the first part is used. " : ""}
              Kept for 2 hours so you can regenerate questions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSourceChange(null)}
            disabled={disabled}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isLoading}
          className="h-10 w-full gap-2 rounded-lg border-dashed"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isLoading ? "Reading file…" : "Upload a PDF or .txt (optional)"}
        </Button>
      )}

      {importProblems && importProblems.length > 0 && (
        <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            Your file needs a few fixes
          </p>
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
            {importProblems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Fix these and upload again, or let the AI write new questions from your file.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onUseAiInstead}
            disabled={disabled}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Use AI instead
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-background">
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium"
          aria-expanded={showGuide}
        >
          <span>Already have your questions? Use this format</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showGuide && "rotate-180")} />
        </button>

        {showGuide && (
          <div className="space-y-2 border-t border-border px-3 py-3 text-xs text-muted-foreground">
            {format ? (
              <>
                <p>
                  Start the file with a <strong className="text-foreground">Title:</strong> line and we&apos;ll use
                  your questions exactly as written — no AI. Number each question. {format.rule}{" "}
                  <strong className="text-foreground">Points:</strong> is optional (default 10).
                </p>
                <pre className="overflow-x-auto whitespace-pre rounded-md bg-muted p-3 font-mono text-[11px] leading-relaxed text-foreground">
                  {format.example}
                </pre>
                <p>
                  Files without a Title: line are read as notes, and the AI writes questions from them. PDFs must
                  have selectable text (not a scan).
                </p>
                <Button type="button" size="sm" variant="ghost" onClick={downloadTemplate} className="h-8 gap-1.5 px-2">
                  <Download className="h-3.5 w-3.5" />
                  Download template
                </Button>
              </>
            ) : (
              <p>
                This game type can&apos;t be imported from a file yet. Any file you upload is read as notes, and the AI
                writes questions from it.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
