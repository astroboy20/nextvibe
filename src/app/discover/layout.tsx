"use client";
import BottomNav from "@/components/navbar/bottom-navbar";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-white flex flex-col  ">
      <DashboardNavbar />
      <section className="px-4 py-6 sm:px-6">{children}</section>
      <BottomNav />
    </main>
  );
}
