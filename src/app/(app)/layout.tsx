import BottomNav from "@/features/layout/components/navbar/bottom-navbar";
import DashboardNavbar from "@/features/layout/components/navbar/dashboard-navbar";
import { MobileOnlyGate } from "@/shared/components/mobile-only-gate";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
