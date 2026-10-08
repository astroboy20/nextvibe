"use client";

import BottomNav from "./navbar/bottom-navbar";
import DashboardNavbar from "./navbar/dashboard-navbar";
import { MobileOnlyGate } from "@/shared/components/mobile-only-gate";
import { LocationPermissionBanner } from "@/shared/components/location-permission-banner";

/**
 * Shared shell used by all dashboard pages.
 * Applies the mobile-only gate without touching any inner page UI.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileOnlyGate>
      <main className="min-h-screen bg-white flex flex-col border-none!">
        <DashboardNavbar />
        <LocationPermissionBanner />
        <section className="px-4 py-6 sm:px-6">{children}</section>
        <BottomNav />
      </main>
    </MobileOnlyGate>
  );
}
