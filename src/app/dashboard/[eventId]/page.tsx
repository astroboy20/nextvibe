import React, { use } from "react";
import OrganizerDashboard from "./dashboard-event-id";
import { MobileOnlyGate } from "@/shared/components/mobile-only-gate";
import DashboardNavbar from "@/features/layout/components/navbar/dashboard-navbar";
import BottomNav from "@/features/layout/components/navbar/bottom-navbar";

const SingleEvent = ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = use(params);
  return (
    <MobileOnlyGate>
      <main className="min-h-screen bg-white flex flex-col">
        <DashboardNavbar />
        <section className="">
          <OrganizerDashboard eventId={eventId} />
        </section>
        <BottomNav />
      </main>
    </MobileOnlyGate>
  );
};

export default SingleEvent;
