"use client";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import Create from "../container/create/create";
import BottomNav from "@/components/navbar/bottom-navbar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function CreateEventPage() {
  const searchParams = useSearchParams();
  const stepParams = searchParams.get("step");
  const step = stepParams ? parseInt(stepParams) : 1;
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <DashboardNavbar />
        <Create step={step} />
        <BottomNav />
      </div>
    </Suspense>
  );
}
