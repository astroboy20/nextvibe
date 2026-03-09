import { cn } from "@/lib/utils";

interface ViewToggleProps {
  activeView: "events" | "postcards";
  onViewChange: (view: "events" | "postcards") => void;
}

const ViewToggle = ({ activeView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1">
      <button
        onClick={() => onViewChange("events")}
        className={cn(
          "relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
          activeView === "events"
            ? "bg-card text-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Events
      </button>
      <button
        onClick={() => onViewChange("postcards")}
        className={cn(
          "relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
          activeView === "postcards"
            ? "bg-card text-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Postcards
      </button>
    </div>
  );
};

export default ViewToggle;
