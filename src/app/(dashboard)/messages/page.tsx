import BottomNav from "@/components/navbar/bottom-navbar";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import Messages from "./container/messages";
import { Suspense } from "react";

export default function SocialPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <DashboardNavbar />
        <Messages />
        <BottomNav />
      </Suspense>
    </main>
  );
}
