import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Pencil, Sparkles } from "lucide-react";

interface StepThreeProps {
  contentMode: string;
  setContentMode: any;
  aiPrompt: string;
  setAiPrompt: any;
}
const StepThree = ({
  contentMode,
  setContentMode,
  aiPrompt,
  setAiPrompt,
}: StepThreeProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-3">
      <Label>Content Creation Method</Label>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setContentMode("ai")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
            contentMode === "ai"
              ? "border-[#531342] bg-linear-to-br from-[#531342]/10 to-accent/10"
              : "border-border hover:border-[#531342]/50"
          )}
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              contentMode === "ai"
                ? "bg-linear-to-br from-[#531342] to-accent text-[#531342]"
                : "bg-muted"
            )}
          >
            <Sparkles className="h-7 w-7" />
          </div>
          <span className="font-semibold">AI Generated</span>
          <span className="text-xs text-muted-foreground text-center">
            Let AI create questions based on your prompt
          </span>
        </button>

        <button
          onClick={() => setContentMode("manual")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
            contentMode === "manual"
              ? "border-[#531342] bg-[#531342]/10"
              : "border-border hover:border-[#531342]/50"
          )}
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              contentMode === "manual" ? "bg-[#531342] text-white" : "bg-muted"
            )}
          >
            <Pencil className="h-7 w-7" />
          </div>
          <span className="font-semibold">Manual Input</span>
          <span className="text-xs text-muted-foreground text-center">
            Create your own questions manually
          </span>
        </button>
      </div>
    </div>

    {contentMode === "ai" && (
      <div className="space-y-3 animate-fade-in">
        <Label>AI Generation Prompt</Label>
        <Textarea
          placeholder="Give AI directions for generating questions. E.g., 'Create fun trivia questions about Nigerian pop culture, Afrobeats music, and Lagos nightlife for a birthday party...'"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="min-h-30"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Be specific about the theme, difficulty level, and audience for
          better results
        </p>
      </div>
    )}

    {contentMode === "manual" && (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
        <Pencil className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          You&apos;ll be able to add questions manually in the next step
        </p>
      </div>
    )}
  </div>
);

export default StepThree;
