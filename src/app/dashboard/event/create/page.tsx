"use client";

import DashboardNavbar from "@/features/layout/components/navbar/dashboard-navbar";
import Create from "../container/create/create";
import BottomNav from "@/features/layout/components/navbar/bottom-navbar";

export default function CreateEventContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <DashboardNavbar />
      <Create />
      <BottomNav />
    </div>
  );
}
