import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDashboardCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  className?: string;
}

export function EventDashboardCard({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
  className,
}: EventDashboardCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen && "ring-1 ring-primary/20",
        className
      )}
    >
      <CardHeader 
        className="pb-3 cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-primary">{icon}</span>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {badge}
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </div>
      </CardHeader>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </div>
    </Card>
  );
}
