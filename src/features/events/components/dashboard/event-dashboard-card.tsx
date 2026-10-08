"use client"
import { ReactNode, useState } from "react";
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
    <div 
      className={cn(
        "transition-all duration-200 border h-fit!  px-3 py-4 rounded-xl",
        isOpen && "ring-1 ring-primary/20",
        className
      )}
    >
      <div 
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between  h-fit!">
          <div className="flex items-center gap-2 text-base">
            <span className="text-primary">{icon}</span>
            {title}
          </div>
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
      </div>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-200 ",
          isOpen ? "max-h-500 opacity-100 mt-3" : "max-h-0 opacity-0 "
        )}
      >
        <div className="flex flex-col justify-center ">
          {children}
        </div>
      </div>
    </div>
  );
}
