"use client";

import BottomNav from "@/components/navbar/bottom-navbar";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import { MobileOnlyGate } from "@/components/mobile-only-gate";

/**
 * Shared shell used by all dashboard pages.
 * Applies the mobile-only gate without touching any inner page UI.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileOnlyGate>
      <main className="min-h-screen bg-white flex flex-col border-none!">
        <DashboardNavbar />
        <section className="px-4 py-6 sm:px-6">{children}</section>
        <BottomNav />
      </main>
    </MobileOnlyGate>
  );
}
