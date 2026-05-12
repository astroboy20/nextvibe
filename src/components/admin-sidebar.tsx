'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  Zap,
  ImageIcon,
  Gamepad2,
  Tag,
  CreditCard,
  TrendingUp,
  LayoutDashboard,
  Activity,
} from 'lucide-react';

const adminRoutes = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/stats', label: 'Stats', icon: Activity },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/events', label: 'Events', icon: Zap },
  { href: '/admin/postcards', label: 'Postcards', icon: ImageIcon },
  { href: '/admin/game-sessions', label: 'Game Sessions', icon: Gamepad2 },
  { href: '/admin/vibetags', label: 'Vibe Tags', icon: TrendingUp },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-(image:--vibe-gradient) flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">NextVibe</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-auto space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = route.exact
            ? pathname === route.href
            : pathname === route.href || pathname.startsWith(route.href + '/');

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-(image:--vibe-gradient) text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="rounded-lg bg-(image:--vibe-gradient-light) px-3 py-3">
          <p className="text-xs font-semibold text-vibe-plum">Admin Access</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Full platform control</p>
        </div>
      </div>
    </aside>
  );
}
