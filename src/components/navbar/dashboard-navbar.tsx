import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewLogo } from "../logo";

interface HeaderProps {
  showSearch?: boolean;
  title?: string;
}

const DashboardNavbar = ({ showSearch = true, title }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-1000 glass border-b border-border/50 border w-full ">
      <div className="container flex h-16 items-center justify-between lg:max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <NewLogo />
          {title && (
            <h1 className="font-display text-lg font-semibold">{title}</h1>
          )}
        </div>

        {showSearch && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            {/* <Button variant="ghost" size="icon" className="rounded-full">
              <SlidersHorizontal className="h-5 w-5" />
            </Button> */}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardNavbar;
