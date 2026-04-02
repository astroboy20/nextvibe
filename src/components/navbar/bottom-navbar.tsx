"use client";
import { Home, Plus, User, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useUnreadMessages } from "@/hooks/use-unread-messages";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Home, label: "Home", path: "/discover" },
  { icon: Users, label: "Social", path: "/social" },
  { icon: Plus, label: "Create", path: "/create", isMain: true },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const pathname = usePathname();
  const [unreadCount] = useState(10);
  //   const { unreadCount } = useUnreadMessages();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-border/50 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            const showBadge = item.path === "/messages" && unreadCount > 0;

            if (item.isMain) {
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center justify-center -mt-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34132E] text-white shadow-elevated transition-transform hover:scale-105 active:scale-95">
                    <Icon className="h-6 w-6" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
