"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard,
  BarChart3,
  Activity,
  CreditCard,
  Zap,
  ImageIcon,
  Gamepad2,
  TrendingUp,
  Users,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminRoutes = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/stats", label: "Stats", icon: Activity },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/events", label: "Events", icon: Zap },
  { href: "/admin/postcards", label: "Postcards", icon: ImageIcon },
  { href: "/admin/game-sessions", label: "Game Sessions", icon: Gamepad2 },
  { href: "/admin/vibetags", label: "Vibe Tags", icon: TrendingUp },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[image:var(--vibe-gradient)] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-foreground">NextVibe</span>
          <span className="text-xs text-muted-foreground hidden sm:block">Admin</span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-[image:var(--vibe-gradient)] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-none">NextVibe</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Admin Console</p>
              </div>
            </div>

            <nav className="px-3 py-4 space-y-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                Navigation
              </p>
              {adminRoutes.map((route) => {
                const Icon = route.icon;
                const isActive = route.exact
                  ? pathname === route.href
                  : pathname === route.href || pathname.startsWith(route.href + "/");

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-[image:var(--vibe-gradient)] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {route.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
